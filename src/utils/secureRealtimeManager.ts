import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Secure Realtime Subscription Manager
 * Provides authorization checks and rate limiting for realtime subscriptions
 */

// Allowed public channels that don't require authorization
const PUBLIC_CHANNELS = ['public-updates', 'announcements'];

// Sensitive channels that require admin access
const ADMIN_ONLY_CHANNELS = [
  'admin_audit_log',
  'security_events',
  'security_alerts',
  'user_roles',
  'compliance_audit_trail',
  'advanced_threat_intelligence',
];

// Maximum subscriptions per user
const MAX_SUBSCRIPTIONS_PER_USER = 10;

// Track active subscriptions
const activeSubscriptions = new Map<string, RealtimeChannel>();
let subscriptionCount = 0;

interface SubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
}

/**
 * Check if a table is allowed for the current user
 */
async function isChannelAuthorized(table: string): Promise<boolean> {
  // Public channels are always allowed
  if (PUBLIC_CHANNELS.includes(table)) {
    return true;
  }
  
  // Admin-only channels require admin role
  if (ADMIN_ONLY_CHANNELS.includes(table)) {
    try {
      const { data: isAdmin, error } = await supabase.rpc('check_current_user_admin_status');
      if (error || !isAdmin) {
        console.warn(`[SecureRealtime] Unauthorized access attempt to ${table}`);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
  
  // All other tables are allowed for authenticated users
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Create a secure realtime subscription with authorization
 */
export async function createSecureSubscription(
  channelName: string,
  options: SubscriptionOptions
): Promise<RealtimeChannel | null> {
  // Check subscription limit
  if (subscriptionCount >= MAX_SUBSCRIPTIONS_PER_USER) {
    console.error('[SecureRealtime] Maximum subscriptions reached');
    return null;
  }
  
  // Check authorization
  const isAuthorized = await isChannelAuthorized(options.table);
  if (!isAuthorized) {
    console.error(`[SecureRealtime] Unauthorized subscription to ${options.table}`);
    return null;
  }
  
  // Check if already subscribed
  if (activeSubscriptions.has(channelName)) {
    return activeSubscriptions.get(channelName)!;
  }
  
  // Create the subscription
  const channel = supabase.channel(channelName);
  
  // Subscribe to postgres changes
  channel.on(
    'postgres_changes' as any,
    {
      event: options.event || '*',
      schema: 'public',
      table: options.table,
      filter: options.filter,
    },
    options.callback
  );
  
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      subscriptionCount++;
    }
  });
  
  activeSubscriptions.set(channelName, channel);
  return channel;
}

/**
 * Remove a subscription
 */
export async function removeSubscription(channelName: string): Promise<void> {
  const channel = activeSubscriptions.get(channelName);
  if (channel) {
    await supabase.removeChannel(channel);
    activeSubscriptions.delete(channelName);
    subscriptionCount = Math.max(0, subscriptionCount - 1);
  }
}

/**
 * Remove all subscriptions
 */
export async function removeAllSubscriptions(): Promise<void> {
  for (const [name, channel] of activeSubscriptions) {
    await supabase.removeChannel(channel);
  }
  activeSubscriptions.clear();
  subscriptionCount = 0;
}

/**
 * Get current subscription count
 */
export function getSubscriptionCount(): number {
  return subscriptionCount;
}

/**
 * Subscribe to user-specific data changes (own data only)
 */
export async function subscribeToUserData(
  table: string,
  userId: string,
  callback: (payload: any) => void
): Promise<RealtimeChannel | null> {
  // Verify the user is subscribing to their own data
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error('[SecureRealtime] Cannot subscribe to other users data');
    return null;
  }
  
  return createSecureSubscription(`user-${table}-${userId}`, {
    table,
    filter: `user_id=eq.${userId}`,
    callback,
  });
}
