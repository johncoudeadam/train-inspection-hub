
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Settings, Loader2, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import SubsystemForm from '@/components/projects/SubsystemForm';
import LocationForm from '@/components/projects/LocationForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Projects = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { projects, projectsLoading, useSubsystems, useLocations } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'project' | 'subsystem' | 'location';
    id: string;
    name: string;
  } | null>(null);
  
  // Get subsystems for the selected project
  const { 
    data: subsystems, 
    isLoading: subsystemsLoading 
  } = useSubsystems(selectedProject || undefined);
  
  // Get locations for the selected project
  const { 
    data: locations, 
    isLoading: locationsLoading 
  } = useLocations(selectedProject || undefined);
  
  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
  };
  
  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      return projectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProject(null);
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete subsystem mutation
  const deleteSubsystem = useMutation({
    mutationFn: async (subsystemId: string) => {
      const { error } = await supabase
        .from('subsystems')
        .delete()
        .eq('id', subsystemId);
        
      if (error) throw error;
      return subsystemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsystems', selectedProject] });
      toast({
        title: "Subsystem deleted",
        description: "The subsystem has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete subsystem",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete location mutation
  const deleteLocation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
        
      if (error) throw error;
      return locationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', selectedProject] });
      toast({
        title: "Location deleted",
        description: "The location has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete location",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete confirmation
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    switch (itemToDelete.type) {
      case 'project':
        deleteProject.mutate(itemToDelete.id);
        break;
      case 'subsystem':
        deleteSubsystem.mutate(itemToDelete.id);
        break;
      case 'location':
        deleteLocation.mutate(itemToDelete.id);
        break;
    }
    
    setDeleteAlertOpen(false);
    setItemToDelete(null);
  };
  
  // Prepare to delete an item
  const prepareDelete = (type: 'project' | 'subsystem' | 'location', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteAlertOpen(true);
  };
  
  const isAdmin = userRole === 'Admin';
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to configure for inspection reports
                </DialogDescription>
              </DialogHeader>
              <ProjectForm />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Edit Project Dialog */}
      {selectedProject && (
        <Dialog open={editProjectDialogOpen} onOpenChange={setEditProjectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details
              </DialogDescription>
            </DialogHeader>
            <ProjectForm 
              projectId={selectedProject} 
              isEditing={true} 
              onSuccess={() => setEditProjectDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete?.type === 'project' ? 'Delete Project' : 
               itemToDelete?.type === 'subsystem' ? 'Delete Subsystem' : 'Delete Location'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium">{itemToDelete?.name}</span>?
              {itemToDelete?.type === 'project' && (
                <span className="block mt-2 text-destructive">
                  This will also delete all associated subsystems, locations, and reports!
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Project List */}
      <div className="grid grid-cols-12 gap-6">
        {/* Projects List Panel */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle>Project List</CardTitle>
            <CardDescription>Select a project to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center">
                    <Button
                      variant={selectedProject === project.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleSelectProject(project.id)}
                    >
                      {project.name}
                    </Button>
                    
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedProject(project.id);
                              setEditProjectDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                            onClick={() => prepareDelete('project', project.id, project.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No projects found
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Project Details Panel */}
        <Card className="col-span-12 md:col-span-8">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                {selectedProject ? 
                  projects?.find(p => p.id === selectedProject)?.name || 'Project Details' : 
                  'Project Details'
                }
              </CardTitle>
              <CardDescription>
                {selectedProject ? 
                  projects?.find(p => p.id === selectedProject)?.description || 'No description' : 
                  'Select a project to view and configure details'
                }
              </CardDescription>
            </div>
            
            {selectedProject && isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditProjectDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </CardHeader>
          
          {selectedProject ? (
            <CardContent>
              <Tabs defaultValue="subsystems">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="subsystems">Subsystems</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                </TabsList>
                
                {/* Subsystems Tab */}
                <TabsContent value="subsystems">
                  {isAdmin && (
                    <>
                      <SubsystemForm projectId={selectedProject} />
                      <Separator className="my-4" />
                    </>
                  )}
                  
                  {subsystemsLoading ? (
                    <div className="py-4 space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : subsystems && subsystems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Added Date</TableHead>
                          {isAdmin && <TableHead className="w-20">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subsystems.map((subsystem) => (
                          <TableRow key={subsystem.id}>
                            <TableCell className="font-medium">{subsystem.name}</TableCell>
                            <TableCell>
                              {new Date(subsystem.created_at).toLocaleDateString()}
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => prepareDelete('subsystem', subsystem.id, subsystem.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No subsystems defined for this project
                    </div>
                  )}
                </TabsContent>
                
                {/* Locations Tab */}
                <TabsContent value="locations">
                  {isAdmin && (
                    <>
                      <LocationForm projectId={selectedProject} />
                      <Separator className="my-4" />
                    </>
                  )}
                  
                  {locationsLoading ? (
                    <div className="py-4 space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : locations && locations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Added Date</TableHead>
                          {isAdmin && <TableHead className="w-20">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map((location) => (
                          <TableRow key={location.id}>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>
                              {new Date(location.created_at).toLocaleDateString()}
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => prepareDelete('location', location.id, location.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No locations defined for this project
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          ) : (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Project Selected</h3>
                <p className="text-muted-foreground mt-1">
                  Select a project from the list to view and configure its details
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Projects;
