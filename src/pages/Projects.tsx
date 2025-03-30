
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Settings, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock data for projects
const projects = [
  {
    id: 1,
    name: "Express Fleet Maintenance",
    description: "Regular maintenance for express trains",
    subsystems: 6,
    locations: 4,
    reportCount: 42,
    userCount: 12
  },
  {
    id: 2,
    name: "Urban Metro Inspections",
    description: "Inspections for urban metro system",
    subsystems: 5,
    locations: 8,
    reportCount: 78,
    userCount: 15
  },
  {
    id: 3,
    name: "Freight Train Monitoring",
    description: "Safety checks for freight locomotives",
    subsystems: 4,
    locations: 3,
    reportCount: 36,
    userCount: 8
  }
];

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Project Management</h1>
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
                Add a new project and configure its subsystems and locations
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="Enter project name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter project description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{project.subsystems} Subsystems</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{project.reportCount} Reports</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {project.locations}
                  </Badge>
                  <span className="text-sm">Locations</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{project.userCount} Users</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">Manage Project</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Subsystems and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subsystems Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Subsystems</CardTitle>
              <CardDescription>Manage subsystems across projects</CardDescription>
            </div>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Brakes</TableCell>
                  <TableCell>Express Fleet</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Engine</TableCell>
                  <TableCell>Express Fleet</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Doors</TableCell>
                  <TableCell>Urban Metro</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">HVAC</TableCell>
                  <TableCell>Urban Metro</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Electrical</TableCell>
                  <TableCell>Freight Train</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Locations Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Locations</CardTitle>
              <CardDescription>Manage locations across projects</CardDescription>
            </div>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Car 1</TableCell>
                  <TableCell>Express Fleet</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Depot</TableCell>
                  <TableCell>Express Fleet</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Station 1</TableCell>
                  <TableCell>Urban Metro</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Station 2</TableCell>
                  <TableCell>Urban Metro</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Yard</TableCell>
                  <TableCell>Freight Train</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projects;
