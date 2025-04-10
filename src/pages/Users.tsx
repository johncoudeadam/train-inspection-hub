import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, UserProjectAccess } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  FilterX, 
  UserPlus, 
  User, 
  Mail, 
  ShieldCheck,
  Building,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjects } from '@/hooks/useProjects';

type UserRole = 'Technician' | 'Manager' | 'Admin';

const Users = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [projectAccessDialogOpen, setProjectAccessDialogOpen] = useState(false);
  
  // Get projects for user access management
  const { projects, projectsLoading } = useProjects();
  
  // Form schema for creating new users
  const userSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
    role: z.enum(['Technician', 'Manager', 'Admin'], {
      required_error: "Please select a role",
    }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  });
  
  type UserFormValues = z.infer<typeof userSchema>;
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: 'Technician',
      password: '',
    },
  });
  
  // Query to fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', searchTerm, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (roleFilter !== 'All') {
        query = query.eq('role', roleFilter);
      }
      
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: userRole === 'Admin',
  });
  
  // Query to fetch user project access
  const { data: userProjects, isLoading: userProjectsLoading } = useQuery({
    queryKey: ['userProjects', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      const { data, error } = await supabase
        .from('user_project_access')
        .select('project_id')
        .eq('user_id', selectedUser);
      
      if (error) throw error;
      return data.map(item => item.project_id);
    },
    enabled: !!selectedUser && projectAccessDialogOpen,
  });
  
  // Mutation to create a new user
  const createUser = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: userData.role })
          .eq('id', authData.user.id);
        
        if (profileError) throw profileError;
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User created",
        description: "The user has been created successfully",
      });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(data: UserFormValues) {
    createUser.mutate(data);
  }
  
  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      return { userId, role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user project access mutation
  const updateUserProjectAccess = useMutation({
    mutationFn: async ({ 
      userId, 
      projectId, 
      hasAccess 
    }: { 
      userId: string, 
      projectId: string, 
      hasAccess: boolean 
    }) => {
      if (hasAccess) {
        const { error } = await supabase
          .from('user_project_access')
          .insert([{
            user_id: userId, 
            project_id: projectId 
          }]);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_project_access')
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId);
          
        if (error) throw error;
      }
      
      return { userId, projectId, hasAccess };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjects', selectedUser] });
      toast({
        title: "Project access updated",
        description: "The user's project access has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update project access",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle project access change
  const handleProjectAccessChange = (projectId: string, checked: boolean) => {
    if (selectedUser) {
      updateUserProjectAccess.mutate({
        userId: selectedUser,
        projectId,
        hasAccess: checked
      });
    }
  };
  
  // Open project access dialog for a user
  const openProjectAccessDialog = (userId: string) => {
    setSelectedUser(userId);
    setProjectAccessDialogOpen(true);
  };
  
  if (userRole !== 'Admin') {
    return (
      <Card className="my-8">
        <CardContent className="py-12 text-center">
          <h2 className="text-xl font-medium text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page. This page is only accessible to Admins.
          </p>
          <Button asChild>
            <Link to="/">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Technician">Technician</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full mt-4" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Project Access Dialog */}
        <Dialog 
          open={projectAccessDialogOpen} 
          onOpenChange={setProjectAccessDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Project Access</DialogTitle>
              <DialogDescription>
                Select which projects this user can access
              </DialogDescription>
            </DialogHeader>
            
            {projectsLoading || userProjectsLoading ? (
              <div className="py-4 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4 py-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`project-${project.id}`}
                      checked={userProjects?.includes(project.id)}
                      onCheckedChange={(checked) => 
                        handleProjectAccessChange(project.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`project-${project.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {project.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No projects found
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setProjectAccessDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users, their roles and project access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-6 w-6"
                  onClick={() => setSearchTerm('')}
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="w-full md:w-48">
              <Select
                defaultValue={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | 'All')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-2 border rounded">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-4 space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading users: {error.message}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="ml-2 font-medium">{user.full_name || 'User'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'Admin' ? 'default' :
                        user.role === 'Manager' ? 'secondary' : 'outline'
                      }>
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProjectAccessDialog(user.id)}
                        className="flex items-center gap-1"
                      >
                        <Building className="h-3.5 w-3.5" />
                        Manage Access
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => 
                          updateUserRole.mutate({ 
                            userId: user.id, 
                            role: value as UserRole 
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technician">Technician</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <UserPlus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Users Found</h3>
              <p className="text-muted-foreground mt-1">
                No users match your current filters.
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
