import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EncryptedData {
  id: string;
  encrypted_content: string;
  content_hash: string;
  created_at: string;
}

export const useEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const encryptData = useCallback(async (
    plaintext: string,
    context: string = 'general'
  ): Promise<string | null> => {
    try {
      setIsEncrypting(true);

      const { data, error } = await supabase.rpc('encrypt_sensitive_data', {
        plaintext,
        context
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      toast({
        title: "Encryption Error",
        description: error.message || "Failed to encrypt data",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const decryptData = useCallback(async (
    encryptedData: string,
    context: string = 'general'
  ): Promise<string | null> => {
    try {
      setIsDecrypting(true);

      const { data, error } = await supabase.rpc('decrypt_sensitive_data', {
        encrypted_data: encryptedData,
        context
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      toast({
        title: "Decryption Error",
        description: error.message || "Failed to decrypt data",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const getSecureProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_secure_profile_data', {
        target_user_id: userId
      });

      if (error) {
        throw error;
      }

      return data?.[0] || null;
    } catch (error: any) {
      toast({
        title: "Profile Access Error",
        description: error.message || "Failed to access secure profile data",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const encryptCourseContent = useCallback(async (
    contentText: string,
    contentType: string,
    courseId: string,
    moduleId?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('encrypt_course_content', {
        content_text: contentText,
        content_type: contentType,
        course_id: courseId,
        module_id: moduleId
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Course content encrypted and stored securely",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Content Encryption Error",
        description: error.message || "Failed to encrypt course content",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const sendEncryptedMessage = useCallback(async (
    recipientId: string,
    subject: string,
    body: string,
    expiresHours: number = 24
  ) => {
    try {
      const { data, error } = await supabase.rpc('send_encrypted_message', {
        recipient_user_id: recipientId,
        message_subject: subject,
        message_body: body,
        expires_hours: expiresHours
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Encrypted message sent successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Message Encryption Error",
        description: error.message || "Failed to send encrypted message",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const getEncryptedMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_encrypted_messages');

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      toast({
        title: "Messages Error",
        description: error.message || "Failed to load encrypted messages",
        variant: "destructive"
      });
      return [];
    }
  }, []);

  const migrateProfileToEncrypted = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase.rpc('migrate_profile_to_encrypted', {
        profile_user_id: userId
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile data has been encrypted successfully",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Migration Error",
        description: error.message || "Failed to encrypt profile data",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    encryptData,
    decryptData,
    getSecureProfile,
    encryptCourseContent,
    sendEncryptedMessage,
    getEncryptedMessages,
    migrateProfileToEncrypted,
    isEncrypting,
    isDecrypting
  };
};