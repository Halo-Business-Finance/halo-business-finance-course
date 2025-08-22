import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Database, 
  Key,
  FileText,
  MessageSquare,
  Users,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminRole } from '@/hooks/useAdminRole';

interface EncryptionStats {
  encryptedProfiles: number;
  totalProfiles: number;
  encryptedContent: number;
  encryptedMessages: number;
}

interface EncryptionManagerProps {
  className?: string;
}

export const EncryptionManager: React.FC<EncryptionManagerProps> = ({ className }) => {
  const { userRole, isAdmin, isSuperAdmin } = useAdminRole();
  const [stats, setStats] = useState<EncryptionStats>({
    encryptedProfiles: 0,
    totalProfiles: 0,
    encryptedContent: 0,
    encryptedMessages: 0
  });
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [testContent, setTestContent] = useState('');
  const [encryptedTest, setEncryptedTest] = useState('');

  // Content encryption test states
  const [contentText, setContentText] = useState('');
  const [courseId, setCourseId] = useState('halo-launch-pad-learn');
  const [contentType, setContentType] = useState('document');

  // Message encryption test states
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    if (isSuperAdmin) {
      loadEncryptionStats();
    }
  }, [isSuperAdmin]);

  const loadEncryptionStats = async () => {
    try {
      setLoading(true);

      // Get profile encryption stats with error handling
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('encryption_status');

      if (profileError) throw profileError;

      // Get encrypted content stats
      const { data: content, error: contentError } = await supabase
        .from('encrypted_course_content')
        .select('id');

      if (contentError) throw contentError;

      // Get encrypted messages stats
      const { data: messages, error: messageError } = await supabase
        .from('encrypted_messages')
        .select('id');

      if (messageError) throw messageError;

      const encryptedProfiles = profiles?.filter(p => p.encryption_status === 'encrypted').length || 0;

      setStats({
        encryptedProfiles,
        totalProfiles: profiles?.length || 0,
        encryptedContent: content?.length || 0,
        encryptedMessages: messages?.length || 0
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load encryption statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const migrateProfile = async (userId?: string) => {
    try {
      setMigrating(true);

      // Get current user if no userId specified
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetUserId) {
        throw new Error('No user ID available for migration');
      }

      const { error } = await supabase.rpc('migrate_profile_to_encrypted', {
        profile_user_id: targetUserId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile data has been encrypted successfully",
      });

      loadEncryptionStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to encrypt profile data",
        variant: "destructive"
      });
    } finally {
      setMigrating(false);
    }
  };

  const encryptCourseContent = async () => {
    if (!contentText || !courseId) {
      toast({
        title: "Error",
        description: "Please provide content text and course ID",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('encrypt_course_content', {
        content_text: contentText,
        content_type: contentType,
        course_id: courseId,
        module_id: null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Course content encrypted with ID: ${data}`,
      });

      setContentText('');
      loadEncryptionStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to encrypt course content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEncryptedMessage = async () => {
    if (!messageSubject || !messageBody || !recipientEmail) {
      toast({
        title: "Error",
        description: "Please fill in all message fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // First get the recipient user ID by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', recipientEmail)
        .single();

      if (profileError) throw new Error(`Recipient not found: ${recipientEmail}`);

      const { data, error } = await supabase.rpc('send_encrypted_message', {
        recipient_user_id: profiles.user_id,
        message_subject: messageSubject,
        message_body: messageBody,
        expires_hours: 24
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Encrypted message sent with ID: ${data}`,
      });

      setMessageSubject('');
      setMessageBody('');
      setRecipientEmail('');
      loadEncryptionStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send encrypted message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testEncryption = async () => {
    if (!testContent) {
      toast({
        title: "Error",
        description: "Please enter some text to encrypt",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('encrypt_sensitive_data', {
        plaintext: testContent,
        context: 'test_encryption'
      });

      if (error) throw error;

      setEncryptedTest(data);
      
      toast({
        title: "Success",
        description: "Text encrypted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to encrypt text",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>Admin privileges required to access encryption management</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            LMS Encryption Manager
          </CardTitle>
          <CardDescription>
            Manage data encryption across your Learning Management System
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Encryption Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Encryption Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Profile Encryption</p>
                <p className="text-2xl font-semibold">
                  {stats.encryptedProfiles}/{stats.totalProfiles}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Encrypted Content</p>
                <p className="text-2xl font-semibold">{stats.encryptedContent}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Encrypted Messages</p>
                <p className="text-2xl font-semibold">{stats.encryptedMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={loadEncryptionStats} disabled={loading}>
              <Settings className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            
            {isSuperAdmin && (
              <Button 
                onClick={() => migrateProfile()} 
                disabled={migrating}
                variant="outline"
              >
                <Lock className="h-4 w-4 mr-2" />
                {migrating ? 'Encrypting...' : 'Encrypt My Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Encryption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Test Encryption
          </CardTitle>
          <CardDescription>
            Test the encryption system with sample data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Test Content</label>
            <Textarea
              placeholder="Enter text to encrypt..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              className="mt-1"
            />
          </div>

          {encryptedTest && (
            <div>
              <label className="text-sm font-medium">Encrypted Result</label>
              <div className="mt-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                {encryptedTest}
              </div>
            </div>
          )}

          <Button onClick={testEncryption} disabled={loading || !testContent}>
            <Lock className="h-4 w-4 mr-2" />
            Encrypt Test
          </Button>
        </CardContent>
      </Card>

      {/* Course Content Encryption */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Encrypt Course Content
            </CardTitle>
            <CardDescription>
              Encrypt sensitive course materials and store them securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Course ID</label>
                <Input
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="halo-launch-pad-learn"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <select 
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="assessment">Assessment</option>
                  <option value="article">Article</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Content Text</label>
              <Textarea
                placeholder="Enter course content to encrypt..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            <Button onClick={encryptCourseContent} disabled={loading || !contentText}>
              <Lock className="h-4 w-4 mr-2" />
              Encrypt & Store Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Encrypted Messaging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Encrypted Message
          </CardTitle>
          <CardDescription>
            Send secure, encrypted messages to other users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Recipient Email</label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Message subject..."
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message Body</label>
            <Textarea
              placeholder="Enter your secure message..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <Button onClick={sendEncryptedMessage} disabled={loading || !messageSubject || !messageBody || !recipientEmail}>
            <Lock className="h-4 w-4 mr-2" />
            Send Encrypted Message
          </Button>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> All sensitive data is encrypted using AES-256 encryption. 
          Encrypted data is automatically decrypted only for authorized users with proper access controls.
          All encryption and decryption operations are logged for security monitoring.
        </AlertDescription>
      </Alert>
    </div>
  );
};