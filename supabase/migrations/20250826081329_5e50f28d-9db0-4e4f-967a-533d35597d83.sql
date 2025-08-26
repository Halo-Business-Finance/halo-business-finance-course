-- Enable RLS on the lead_submission_rate_limits table
ALTER TABLE lead_submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for the rate limits table (only allow system functions to manage this)
CREATE POLICY "System can manage rate limits"
ON lead_submission_rate_limits
FOR ALL
USING (false)  -- No direct user access
WITH CHECK (false);  -- No direct user inserts

-- Create policy to allow the rate limit function to operate
CREATE POLICY "Rate limit functions can access data"
ON lead_submission_rate_limits
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);