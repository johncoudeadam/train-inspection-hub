
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Project } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export interface ProjectFormData {
  name: string;
  description?: string;
}

export interface SubsystemFormData {
  name: string;
  projectId: string;
}

export interface LocationFormData {
  name: string;
  projectId: string;
}

export function useProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  // Fetch subsystems for a project
  const useSubsystems = (projectId?: string) => {
    return useQuery({
      queryKey: ['subsystems', projectId],
      queryFn: async () => {
        if (!projectId) return [];
        const { data, error } = await supabase
          .from('subsystems')
          .select('*')
          .eq('project_id', projectId)
          .order('name');
          
        if (error) throw error;
        return data;
      },
      enabled: !!projectId,
    });
  };

  // Fetch locations for a project
  const useLocations = (projectId?: string) => {
    return useQuery({
      queryKey: ['locations', projectId],
      queryFn: async () => {
        if (!projectId) return [];
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('project_id', projectId)
          .order('name');
          
        if (error) throw error;
        return data;
      },
      enabled: !!projectId,
    });
  };

  // Create a new project
  const createProject = useMutation({
    mutationFn: async (formData: ProjectFormData) => {
      const newProject = {
        name: formData.name,
        description: formData.description || '',
        created_by: user?.id,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project created",
        description: "The project has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add a subsystem to a project
  const addSubsystem = useMutation({
    mutationFn: async (formData: SubsystemFormData) => {
      const { data, error } = await supabase
        .from('subsystems')
        .insert([{
          name: formData.name,
          project_id: formData.projectId,
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subsystems', variables.projectId] });
      toast({
        title: "Subsystem added",
        description: "The subsystem has been added to the project",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add subsystem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add a location to a project
  const addLocation = useMutation({
    mutationFn: async (formData: LocationFormData) => {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: formData.name,
          project_id: formData.projectId,
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.projectId] });
      toast({
        title: "Location added",
        description: "The location has been added to the project",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add location",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    projectsLoading,
    useSubsystems,
    useLocations,
    createProject,
    addSubsystem,
    addLocation,
  };
}
