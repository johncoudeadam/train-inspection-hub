
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportStatus } from '@/lib/supabase';
import ReportCard from '@/components/reports/ReportCard';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Search, FilterX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Reviews = () => {
  const { userRole } = useAuth();
  const [filter, setFilter] = useState<string>('Submitted');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports-for-review', filter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filter !== 'All') {
        query = query.eq('status', filter);
      }
      
      if (searchTerm) {
        query = query.or(`train_number.ilike.%${searchTerm}%,subsystem.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: userRole === 'Manager' || userRole === 'Admin',
  });

  if (userRole !== 'Manager' && userRole !== 'Admin') {
    return (
      <Card className="my-8">
        <CardContent className="py-12 text-center">
          <h2 className="text-xl font-medium text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page. This page is only accessible to Managers and Admins.
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
        <h1 className="text-2xl font-bold">Report Reviews</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>
            Review and manage inspection reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by train number, subsystem, or location..."
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
                defaultValue={filter}
                onValueChange={setFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Reports</SelectItem>
                  <SelectItem value="Submitted">Pending Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading reports: {error.message}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  id={report.id}
                  trainNumber={report.train_number}
                  subsystem={report.subsystem}
                  location={report.location}
                  status={report.status as ReportStatus}
                  createdAt={new Date(report.created_at).toLocaleDateString()}
                  hasPhotos={report.has_photos || false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                {filter === 'Submitted' ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium">No Reports Found</h3>
              <p className="text-muted-foreground mt-1">
                {filter === 'Submitted' ? (
                  'All reports have been reviewed. Good job!'
                ) : (
                  'No reports match your current filters.'
                )}
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

export default Reviews;
