
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
import { PlusCircle, Settings, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import ProjectForm from '@/components/projects/ProjectForm';
import SubsystemForm from '@/components/projects/SubsystemForm';
import LocationForm from '@/components/projects/LocationForm';

const Projects = () => {
  const { userRole } = useAuth();
  const { projects, projectsLoading, useSubsystems, useLocations } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
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
                  <Button
                    key={project.id}
                    variant={selectedProject === project.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    {project.name}
                  </Button>
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
          <CardHeader>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subsystems.map((subsystem) => (
                          <TableRow key={subsystem.id}>
                            <TableCell className="font-medium">{subsystem.name}</TableCell>
                            <TableCell>
                              {new Date(subsystem.created_at).toLocaleDateString()}
                            </TableCell>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map((location) => (
                          <TableRow key={location.id}>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>
                              {new Date(location.created_at).toLocaleDateString()}
                            </TableCell>
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
