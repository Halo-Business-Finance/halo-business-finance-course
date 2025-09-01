-- Create 7 adaptive interactive modules for each course
-- First, let's create an adaptive_modules table to store the template modules

CREATE TABLE IF NOT EXISTS public.adaptive_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL,
  module_type text NOT NULL DEFAULT 'adaptive',
  difficulty_level text NOT NULL DEFAULT 'adaptive',
  base_duration text NOT NULL DEFAULT '60 minutes',
  learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  adaptive_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  assessment_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills_taught jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on adaptive_modules
ALTER TABLE public.adaptive_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for adaptive_modules
CREATE POLICY "Admins can manage adaptive modules" 
ON public.adaptive_modules FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Enrolled users can view adaptive modules" 
ON public.adaptive_modules FOR SELECT 
USING (
  is_active = true AND (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM course_enrollments 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      ) OR is_admin(auth.uid())
    )
  )
);

-- Insert the 7 adaptive modules
INSERT INTO public.adaptive_modules (module_key, title, description, order_index, learning_objectives, adaptive_content, assessment_criteria, skills_taught) VALUES
(
  'foundations_assessment',
  'Foundations & Assessment',
  'Adaptive introduction that assesses your current knowledge and customizes the learning path based on your expertise level.',
  1,
  '["Assess current knowledge level", "Identify learning gaps", "Create personalized learning path", "Establish baseline competencies"]'::jsonb,
  '{
    "adaptive_features": ["skill_assessment", "personalized_path", "prerequisite_checking"],
    "content_types": ["diagnostic_quiz", "interactive_assessment", "knowledge_mapping"],
    "difficulty_levels": ["beginner", "intermediate", "advanced"],
    "branching_logic": true
  }'::jsonb,
  '{
    "passing_score": 70,
    "adaptive_scoring": true,
    "competency_areas": ["financial_analysis", "risk_assessment", "regulatory_knowledge", "market_understanding"],
    "remediation_triggers": ["score_below_60", "time_spent_excessive", "multiple_attempts"]
  }'::jsonb,
  '["Self-Assessment", "Learning Path Planning", "Knowledge Gap Analysis", "Competency Mapping"]'::jsonb
),
(
  'core_concepts',
  'Core Concepts Mastery',
  'Interactive deep-dive into fundamental concepts with adaptive explanations that adjust complexity based on your understanding.',
  2,
  '["Master fundamental business finance concepts", "Understand regulatory frameworks", "Apply core lending principles", "Demonstrate conceptual fluency"]'::jsonb,
  '{
    "adaptive_features": ["concept_difficulty_scaling", "explanation_depth_adjustment", "example_complexity_matching"],
    "content_types": ["interactive_lessons", "adaptive_simulations", "concept_mapping", "scenario_analysis"], 
    "learning_modalities": ["visual", "auditory", "kinesthetic", "reading"],
    "feedback_mechanisms": ["immediate", "explanatory", "corrective", "encouraging"]
  }'::jsonb,
  '{
    "mastery_threshold": 85,
    "concept_retention_check": true,
    "spaced_repetition": true,
    "transfer_assessment": ["apply_to_new_scenarios", "cross_concept_connections"]
  }'::jsonb,
  '["Conceptual Understanding", "Regulatory Compliance", "Financial Analysis", "Risk Recognition"]'::jsonb
),
(
  'practical_application',
  'Practical Application Lab',
  'Hands-on practice with real-world scenarios that adapt difficulty and complexity based on your performance and confidence level.',
  3,
  '["Apply concepts to real scenarios", "Solve complex financial problems", "Navigate regulatory challenges", "Build practical expertise"]'::jsonb,
  '{
    "adaptive_features": ["scenario_complexity_adjustment", "real_time_guidance", "performance_based_progression"],
    "content_types": ["case_studies", "simulations", "problem_solving_exercises", "interactive_tools"],
    "practice_modes": ["guided", "semi_guided", "independent", "collaborative"],
    "scaffold_removal": "gradual_fade_support"
  }'::jsonb,
  '{
    "performance_criteria": ["accuracy", "efficiency", "reasoning_quality", "compliance_adherence"],
    "adaptive_feedback": true,
    "peer_comparison": false,
    "real_world_validation": true
  }'::jsonb,
  '["Problem Solving", "Scenario Analysis", "Decision Making", "Practical Application"]'::jsonb
),
(
  'advanced_techniques',
  'Advanced Techniques & Strategies',
  'Sophisticated methods and strategies with adaptive content that scales from intermediate to expert level based on your mastery.',
  4,
  '["Master advanced analytical techniques", "Develop strategic thinking", "Handle complex transactions", "Lead sophisticated deals"]'::jsonb,
  '{
    "adaptive_features": ["technique_complexity_scaling", "strategy_depth_adjustment", "expertise_level_matching"],
    "content_types": ["advanced_case_studies", "strategic_simulations", "expert_interviews", "technique_labs"],
    "expertise_levels": ["intermediate", "advanced", "expert", "thought_leader"],
    "personalization": "role_based_content"
  }'::jsonb,
  '{
    "expertise_demonstration": ["technique_application", "strategy_development", "innovation_thinking"],
    "peer_review": true,
    "expert_validation": true,
    "portfolio_development": true
  }'::jsonb,
  '["Advanced Analysis", "Strategic Planning", "Innovation", "Leadership"]'::jsonb
),
(
  'interactive_simulations',
  'Interactive Business Simulations',
  'Immersive business simulations that adapt market conditions, complexity, and challenges based on your decisions and learning progress.',
  5,
  '["Navigate complex business environments", "Make strategic decisions under pressure", "Manage multiple stakeholders", "Optimize business outcomes"]'::jsonb,
  '{
    "adaptive_features": ["dynamic_market_conditions", "stakeholder_behavior_adjustment", "complexity_scaling", "consequence_modeling"],
    "content_types": ["business_simulations", "market_scenarios", "stakeholder_negotiations", "crisis_management"],
    "simulation_types": ["individual", "team_based", "competitive", "collaborative"],
    "realism_level": "high_fidelity"
  }'::jsonb,
  '{
    "decision_quality": ["strategic_alignment", "risk_management", "stakeholder_satisfaction", "financial_outcomes"],
    "simulation_scoring": "holistic_performance",
    "learning_from_failure": true,
    "multiple_attempt_scenarios": true
  }'::jsonb,
  '["Strategic Decision Making", "Stakeholder Management", "Risk Management", "Business Acumen"]'::jsonb
),
(
  'collaborative_projects',
  'Collaborative Learning Projects',
  'Team-based projects with adaptive group formation and project complexity based on collective skill levels and learning objectives.',
  6,
  '["Collaborate effectively with peers", "Lead project teams", "Synthesize diverse perspectives", "Deliver professional-quality work"]'::jsonb,
  '{
    "adaptive_features": ["smart_group_formation", "role_assignment_optimization", "project_scope_adjustment", "collaboration_tools"],
    "content_types": ["group_projects", "peer_learning", "collaborative_case_studies", "team_challenges"],
    "collaboration_modes": ["synchronous", "asynchronous", "hybrid", "self_organizing"],
    "project_types": ["research", "analysis", "strategy_development", "solution_design"]
  }'::jsonb,
  '{
    "individual_contribution": true,
    "team_performance": true,
    "peer_evaluation": true,
    "project_quality": ["professional_standards", "innovation", "practical_applicability"]
  }'::jsonb,
  '["Collaboration", "Leadership", "Communication", "Project Management"]'::jsonb
),
(
  'mastery_certification',
  'Mastery Certification & Portfolio',
  'Comprehensive assessment and portfolio development that adapts evaluation criteria based on your career goals and demonstrated competencies.',
  7,
  '["Demonstrate comprehensive mastery", "Build professional portfolio", "Prepare for career advancement", "Achieve industry recognition"]'::jsonb,
  '{
    "adaptive_features": ["personalized_assessment_path", "career_goal_alignment", "competency_gap_analysis", "portfolio_optimization"],
    "content_types": ["comprehensive_assessment", "portfolio_development", "capstone_project", "industry_presentation"],
    "certification_levels": ["competent", "proficient", "advanced", "expert"],
    "career_alignment": "role_specific_preparation"
  }'::jsonb,
  '{
    "mastery_demonstration": ["comprehensive_knowledge", "practical_application", "professional_communication", "industry_readiness"],
    "portfolio_quality": ["professional_presentation", "real_world_applicability", "innovation_demonstration"],
    "certification_standards": "industry_aligned",
    "continuing_education_path": true
  }'::jsonb,
  '["Comprehensive Mastery", "Professional Portfolio", "Industry Readiness", "Continuous Learning"]'::jsonb
);

-- Create adaptive_module_instances table to track user-specific adaptive module progress
CREATE TABLE IF NOT EXISTS public.adaptive_module_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id text NOT NULL,
  adaptive_module_id uuid REFERENCES public.adaptive_modules(id) ON DELETE CASCADE,
  personalized_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_difficulty_level text NOT NULL DEFAULT 'beginner',
  adaptive_path jsonb NOT NULL DEFAULT '[]'::jsonb,
  performance_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  completion_status text NOT NULL DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  last_accessed_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on adaptive_module_instances
ALTER TABLE public.adaptive_module_instances ENABLE ROW LEVEL SECURITY;

-- RLS policies for adaptive_module_instances
CREATE POLICY "Users can manage their own adaptive module instances" 
ON public.adaptive_module_instances FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all adaptive module instances" 
ON public.adaptive_module_instances FOR SELECT 
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_adaptive_module_instances_user_course ON public.adaptive_module_instances(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_module_instances_module ON public.adaptive_module_instances(adaptive_module_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_modules_order ON public.adaptive_modules(order_index);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_adaptive_module_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_adaptive_module_instances_updated_at
  BEFORE UPDATE ON public.adaptive_module_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_adaptive_module_instances_updated_at();

-- Function to initialize adaptive modules for a user's course enrollment
CREATE OR REPLACE FUNCTION initialize_adaptive_modules_for_user(p_user_id uuid, p_course_id text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.adaptive_module_instances (
    user_id, 
    course_id, 
    adaptive_module_id,
    personalized_content,
    adaptive_path
  )
  SELECT 
    p_user_id,
    p_course_id,
    am.id,
    jsonb_build_object(
      'initial_assessment_required', true,
      'personalization_level', 'standard',
      'preferred_learning_style', 'mixed'
    ),
    jsonb_build_array(
      jsonb_build_object(
        'step', 1,
        'type', 'assessment',
        'status', 'pending'
      )
    )
  FROM public.adaptive_modules am
  WHERE am.is_active = true
  ON CONFLICT (user_id, course_id, adaptive_module_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-initialize adaptive modules when user enrolls in course
CREATE OR REPLACE FUNCTION auto_initialize_adaptive_modules()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_adaptive_modules_for_user(NEW.user_id, NEW.course_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_initialize_adaptive_modules_trigger
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION auto_initialize_adaptive_modules();

-- Initialize adaptive modules for existing enrolled users
INSERT INTO public.adaptive_module_instances (
  user_id, 
  course_id, 
  adaptive_module_id,
  personalized_content,
  adaptive_path
)
SELECT 
  ce.user_id,
  ce.course_id,
  am.id,
  jsonb_build_object(
    'initial_assessment_required', true,
    'personalization_level', 'standard',
    'preferred_learning_style', 'mixed'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'step', 1,
      'type', 'assessment', 
      'status', 'pending'
    )
  )
FROM public.course_enrollments ce
CROSS JOIN public.adaptive_modules am
WHERE ce.status = 'active' 
  AND am.is_active = true
ON CONFLICT DO NOTHING;