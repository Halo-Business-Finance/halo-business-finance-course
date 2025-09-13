import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  user_id: string;
  module_id: string;
  lesson_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  selectedNote: Note | null;
  isNotesModalOpen: boolean;
  currentModuleId: string | null;
  currentLessonId: string | null;
  setIsNotesModalOpen: (open: boolean) => void;
  setCurrentContext: (moduleId: string, lessonId?: string) => void;
  createNote: (content: string, moduleId: string, lessonId?: string) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesByModule: (moduleId: string) => Note[];
  getNotesByLesson: (moduleId: string, lessonId: string) => Note[];
  selectNote: (note: Note | null) => void;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshNotes = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (content: string, moduleId: string, lessonId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          lesson_id: lessonId || null,
          content: content,
          is_private: true
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive"
      });
    }
  };

  const updateNote = async (id: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => note.id === id ? data : note));
      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const getNotesByModule = (moduleId: string) => {
    return notes.filter(note => note.module_id === moduleId);
  };

  const getNotesByLesson = (moduleId: string, lessonId: string) => {
    return notes.filter(note => note.module_id === moduleId && note.lesson_id === lessonId);
  };

  const selectNote = (note: Note | null) => {
    setSelectedNote(note);
  };

  const setCurrentContext = (moduleId: string, lessonId?: string) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId || null);
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  const value: NotesContextType = {
    notes,
    isLoading,
    selectedNote,
    isNotesModalOpen,
    currentModuleId,
    currentLessonId,
    setIsNotesModalOpen,
    setCurrentContext,
    createNote,
    updateNote,
    deleteNote,
    getNotesByModule,
    getNotesByLesson,
    selectNote,
    refreshNotes
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};