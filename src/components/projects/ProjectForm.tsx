
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters' }),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  projectId?: string;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  projectId, 
  isEditing = false,
  onSuccess 
}) => {
  const { createProject, updateProject } = useProjects();
  
  // Fetch project details if editing
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!projectId && isEditing,
  });
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  // Set form values when editing existing project
  useEffect(() => {
    if (projectData && isEditing) {
      form.reset({
        name: projectData.name,
        description: projectData.description || '',
      });
    }
  }, [projectData, form, isEditing]);

  function onSubmit(data: ProjectFormValues) {
    if (isEditing && projectId) {
      // Update existing project
      updateProject.mutate({
        id: projectId,
        name: data.name,
        description: data.description || ''
      }, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        }
      });
    } else {
      // Create new project
      createProject.mutate({
        name: data.name,
        description: data.description || ''
      }, {
        onSuccess: () => {
          form.reset();
          if (onSuccess) onSuccess();
        }
      });
    }
  }

  if (projectLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter project description (optional)" 
                  className="resize-none h-24"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={createProject.isPending || updateProject?.isPending}
        >
          {createProject.isPending || updateProject?.isPending ? 
            'Saving...' : 
            isEditing ? 'Update Project' : 'Create Project'
          }
        </Button>
      </form>
    </Form>
  );
};

export default ProjectForm;
