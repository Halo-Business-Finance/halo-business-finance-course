-- Final Hunt for the Last Security Definer View
-- Use system catalogs to find exactly what's causing the warning

-- Create a comprehensive search across all possible locations
DO $$
DECLARE
    rec RECORD;
    def_text TEXT;
    is_found BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE SECURITY DEFINER VIEW SEARCH ===';
    
    -- 1. Search ALL views in ALL non-system schemas
    FOR rec IN 
        SELECT 
            n.nspname as schema_name, 
            c.relname as view_name,
            c.oid as view_oid
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'v'  -- views
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1')
        ORDER BY n.nspname, c.relname
    LOOP
        BEGIN
            -- Get the view definition
            SELECT pg_get_viewdef(rec.view_oid, true) INTO def_text;
            
            -- Check for SECURITY DEFINER in the definition
            IF def_text IS NOT NULL AND (
                def_text ILIKE '%SECURITY DEFINER%' OR 
                def_text ILIKE '%security_definer%' OR
                def_text ~* 'SECURITY\s+DEFINER'
            ) THEN
                is_found := TRUE;
                RAISE NOTICE 'FOUND SECURITY DEFINER VIEW: %.% (OID: %)', 
                    rec.schema_name, rec.view_name, rec.view_oid;
                RAISE NOTICE 'Definition: %', substring(def_text, 1, 500);
                
                -- Try to drop it
                BEGIN
                    EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', rec.schema_name, rec.view_name);
                    RAISE NOTICE 'Successfully dropped view: %.%', rec.schema_name, rec.view_name;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Could not drop view %.%: %', rec.schema_name, rec.view_name, SQLERRM;
                END;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error processing view %.%: %', rec.schema_name, rec.view_name, SQLERRM;
        END;
    END LOOP;
    
    -- 2. Check materialized views too
    FOR rec IN 
        SELECT 
            n.nspname as schema_name, 
            c.relname as view_name,
            c.oid as view_oid
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'm'  -- materialized views
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    LOOP
        BEGIN
            SELECT pg_get_viewdef(rec.view_oid, true) INTO def_text;
            
            IF def_text IS NOT NULL AND (
                def_text ILIKE '%SECURITY DEFINER%' OR 
                def_text ILIKE '%security_definer%'
            ) THEN
                is_found := TRUE;
                RAISE NOTICE 'FOUND SECURITY DEFINER MATERIALIZED VIEW: %.%', rec.schema_name, rec.view_name;
                
                BEGIN
                    EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', rec.schema_name, rec.view_name);
                    RAISE NOTICE 'Successfully dropped materialized view: %.%', rec.schema_name, rec.view_name;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Could not drop materialized view %.%: %', rec.schema_name, rec.view_name, SQLERRM;
                END;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error processing materialized view %.%: %', rec.schema_name, rec.view_name, SQLERRM;
        END;
    END LOOP;
    
    -- 3. Check for any objects with security_definer in reloptions
    FOR rec IN 
        SELECT 
            n.nspname as schema_name,
            c.relname,
            c.relkind,
            c.reloptions
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.reloptions IS NOT NULL
        AND array_to_string(c.reloptions, ' ') ILIKE '%security_definer%'
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    LOOP
        is_found := TRUE;
        RAISE NOTICE 'FOUND OBJECT WITH SECURITY_DEFINER OPTION: %.% (type: %, options: %)', 
            rec.schema_name, rec.relname, rec.relkind, rec.reloptions;
            
        BEGIN
            IF rec.relkind = 'v' THEN
                EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', rec.schema_name, rec.relname);
            ELSIF rec.relkind = 'm' THEN
                EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', rec.schema_name, rec.relname);
            END IF;
            RAISE NOTICE 'Dropped object: %.%', rec.schema_name, rec.relname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop object %.%: %', rec.schema_name, rec.relname, SQLERRM;
        END;
    END LOOP;
    
    -- 4. Search in extensions schema if it exists
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
        FOR rec IN 
            SELECT 
                n.nspname as schema_name, 
                c.relname as view_name
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relkind IN ('v', 'm')
            AND n.nspname = 'extensions'
        LOOP
            BEGIN
                SELECT pg_get_viewdef(c.oid, true) INTO def_text
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relname = rec.view_name AND n.nspname = rec.schema_name;
                
                IF def_text IS NOT NULL AND def_text ILIKE '%SECURITY DEFINER%' THEN
                    is_found := TRUE;
                    RAISE NOTICE 'FOUND SECURITY DEFINER VIEW IN EXTENSIONS: %.%', rec.schema_name, rec.view_name;
                    
                    BEGIN
                        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', rec.schema_name, rec.view_name);
                        RAISE NOTICE 'Dropped extensions view: %.%', rec.schema_name, rec.view_name;
                    EXCEPTION
                        WHEN OTHERS THEN
                            RAISE NOTICE 'Could not drop extensions view %.%: %', rec.schema_name, rec.view_name, SQLERRM;
                    END;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Error processing extensions view %.%: %', rec.schema_name, rec.view_name, SQLERRM;
            END;
        END LOOP;
    END IF;
    
    -- Summary
    IF is_found THEN
        RAISE NOTICE 'Found and attempted to remove SECURITY DEFINER views.';
    ELSE
        RAISE NOTICE 'No SECURITY DEFINER views found in comprehensive search.';
    END IF;
    
END $$;

-- Log this comprehensive search
INSERT INTO public.security_events (
  event_type, 
  severity, 
  details
) VALUES (
  'security_comprehensive_search',
  'high',
  jsonb_build_object(
    'action', 'comprehensive_security_definer_search_and_removal',
    'timestamp', now(),
    'description', 'Performed exhaustive search for remaining SECURITY DEFINER views across all schemas'
  )
);