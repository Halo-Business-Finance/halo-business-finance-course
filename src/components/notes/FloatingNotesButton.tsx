import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';
import { StickyNote, Plus } from 'lucide-react';

interface FloatingNotesButtonProps {
  moduleId?: string;
  lessonId?: string;
  className?: string;
}

export const FloatingNotesButton: React.FC<FloatingNotesButtonProps> = ({ 
  moduleId, 
  lessonId,
  className = ""
}) => {
  const { 
    setIsNotesModalOpen, 
    setCurrentContext, 
    getNotesByModule, 
    getNotesByLesson 
  } = useNotes();

  // Get note count based on context
  const noteCount = lessonId && moduleId 
    ? getNotesByLesson(moduleId, lessonId).length
    : moduleId 
    ? getNotesByModule(moduleId).length 
    : 0;

  const handleClick = () => {
    if (moduleId) {
      setCurrentContext(moduleId, lessonId);
    }
    setIsNotesModalOpen(true);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        onClick={handleClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative group"
        title={noteCount > 0 ? `${noteCount} notes` : "Take notes"}
      >
        <StickyNote className="h-6 w-6" />
        
        {/* Note count badge */}
        {noteCount > 0 && (
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-destructive text-destructive-foreground">
            {noteCount > 99 ? '99+' : noteCount}
          </div>
        )}
        
        {/* Plus icon overlay for quick add */}
        <div className="absolute -bottom-1 -right-1 bg-primary border-2 border-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Plus className="h-3 w-3 text-primary-foreground" />
        </div>
      </Button>
    </div>
  );
};