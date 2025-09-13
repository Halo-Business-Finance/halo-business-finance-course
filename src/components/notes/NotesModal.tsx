import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotes } from '@/contexts/NotesContext';
import { Search, Plus, Edit, Trash2, Save, X, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle?: string;
  lessonTitle?: string;
}

export const NotesModal: React.FC<NotesModalProps> = ({ 
  isOpen, 
  onClose, 
  moduleTitle,
  lessonTitle 
}) => {
  const {
    notes,
    selectedNote,
    currentModuleId,
    currentLessonId,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    getNotesByModule,
    getNotesByLesson
  } = useNotes();

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get relevant notes based on context
  const relevantNotes = currentLessonId && currentModuleId
    ? getNotesByLesson(currentModuleId, currentLessonId)
    : currentModuleId
    ? getNotesByModule(currentModuleId)
    : notes;

  // Filter notes by search term
  const filteredNotes = relevantNotes.filter(note =>
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    if (!newNoteContent.trim() || !currentModuleId) return;

    await createNote(newNoteContent, currentModuleId, currentLessonId || undefined);
    setNewNoteContent('');
    setIsCreating(false);
  };

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNote(noteId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editContent.trim()) return;
    
    await updateNote(editingNote, editContent);
    setEditingNote(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const getContextBadge = () => {
    if (lessonTitle) {
      return <Badge variant="secondary">Lesson: {lessonTitle}</Badge>;
    }
    if (moduleTitle) {
      return <Badge variant="outline">Module: {moduleTitle}</Badge>;
    }
    return <Badge variant="default">All Notes</Badge>;
  };

  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setEditingNote(null);
      setEditContent('');
      setNewNoteContent('');
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">My Notes</DialogTitle>
              {getContextBadge()}
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 p-6 pt-4">
          {/* Create Note Form */}
          {isCreating && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Write your note here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNote} disabled={!newNoteContent.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes List */}
          <ScrollArea className="h-96">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notes found</p>
                <p className="text-sm">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first note to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      {editingNote === note.id ? (
                        <div className="space-y-4">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {note.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note.id, note.content)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              {note.lesson_id && (
                                <Badge variant="secondary" className="text-xs">
                                  Lesson Note
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(note.updated_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};