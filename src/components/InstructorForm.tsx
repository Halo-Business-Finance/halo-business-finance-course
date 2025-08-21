import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Instructor {
  id?: string;
  name: string;
  title: string;
  company: string;
  years_experience: string;
  bio: string;
  avatar_initials: string;
  avatar_color: string;
  display_order: number;
  is_active: boolean;
}

interface InstructorFormProps {
  instructor?: Instructor;
  onSave: () => void;
  onCancel: () => void;
}

export const InstructorForm = ({ instructor, onSave, onCancel }: InstructorFormProps) => {
  const [formData, setFormData] = useState<Instructor>({
    name: instructor?.name || "",
    title: instructor?.title || "",
    company: instructor?.company || "Halo Business Finance",
    years_experience: instructor?.years_experience || "",
    bio: instructor?.bio || "",
    avatar_initials: instructor?.avatar_initials || "",
    avatar_color: instructor?.avatar_color || "primary",
    display_order: instructor?.display_order || 0,
    is_active: instructor?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (instructor?.id) {
        // Update existing instructor
        const { error } = await supabase
          .from('instructors')
          .update(formData)
          .eq('id', instructor.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Instructor updated successfully",
        });
      } else {
        // Create new instructor
        const { error } = await supabase
          .from('instructors')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success", 
          description: "Instructor created successfully",
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save instructor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {instructor ? "Edit Instructor" : "Add New Instructor"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_initials">Avatar Initials *</Label>
              <Input
                id="avatar_initials"
                value={formData.avatar_initials}
                onChange={(e) => setFormData({ ...formData, avatar_initials: e.target.value.toUpperCase() })}
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience *</Label>
              <Input
                id="years_experience"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                placeholder="e.g., 15+ years experience"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avatar_color">Avatar Color</Label>
              <Select 
                value={formData.avatar_color}
                onValueChange={(value) => setFormData({ ...formData, avatar_color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : instructor ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};