
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ReportCard from '@/components/reports/ReportCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { ReportStatus } from '@/lib/supabase';
import { format, subMonths } from 'date-fns';

const Dashboard = () => {
  const { userRole } = useAuth();
  
  // Fetch report statistics
  const { data: reportStats, isLoading: statsLoading } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      // Get total reports
      const { count: totalCount, error: totalError } = await supabase
        .from('reports')
        .count();
      
      if (totalError) throw totalError;
      
      // Get approved reports
      const { count: approvedCount, error: approvedError } = await supabase
        .from('reports')
        .count()
        .eq('status', 'Approved');
      
      if (approvedError) throw approvedError;
      
      // Get reports with issues (using reports that are either rejected or with notes containing certain keywords)
      const { count: issuesCount, error: issuesError } = await supabase
        .from('reports')
        .count()
        .or('status.eq.Rejected,notes.ilike.%issue%,notes.ilike.%problem%,notes.ilike.%repair%');
      
      if (issuesError) throw issuesError;
      
      // Get pending reports
      const { count: pendingCount, error: pendingError } = await supabase
        .from('reports')
        .count()
        .eq('status', 'Submitted');
      
      if (pendingError) throw pendingError;
      
      return {
        total: totalCount,
        approved: approvedCount,
        issues: issuesCount,
        pending: pendingCount
      };
    }
  });
  
  // Fetch recent reports
  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch issue trends for the line chart
  const { data: issuesTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['issues-trend'],
    queryFn: async () => {
      // Get the last 6 months
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i);
        return {
          month: format(date, 'MMM'),
          startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        };
      }).reverse();
      
      // Fetch issue count for each month
      const result = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        const { count, error } = await supabase
          .from('reports')
          .count()
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .or('status.eq.Rejected,notes.ilike.%issue%,notes.ilike.%problem%,notes.ilike.%repair%');
          
        if (error) throw error;
        
        return {
          month,
          issues: count
        };
      }));
      
      return result;
    }
  });
  
  // Fetch issues by subsystem for the bar chart
  const { data: subsystemIssues, isLoading: subsystemLoading } = useQuery({
    queryKey: ['subsystem-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('subsystem')
        .or('status.eq.Rejected,notes.ilike.%issue%,notes.ilike.%problem%,notes.ilike.%repair%');
        
      if (error) throw error;
      
      // Count occurrences of each subsystem
      const counts: Record<string, number> = {};
      data.forEach(report => {
        counts[report.subsystem] = (counts[report.subsystem] || 0) + 1;
      });
      
      // Convert to array format for chart
      return Object.entries(counts)
        .map(([name, issues]) => ({ name, issues }))
        .sort((a, b) => b.issues - a.issues)
        .slice(0, 6); // Top 6 subsystems
    }
  });
  
  // Determine if data is loading
  const isLoading = statsLoading || reportsLoading || trendLoading || subsystemLoading;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {userRole === 'Technician' && (
          <Button asChild>
            <Link to="/reports/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
        )}
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Reports" 
          value={isLoading ? "..." : reportStats?.total.toString() || '0'}
          description="All time" 
          icon={<FileText />}
        />
        <StatCard 
          title="Approved" 
          value={isLoading ? "..." : reportStats?.approved.toString() || '0'}
          description={isLoading ? "..." : `${Math.round((reportStats?.approved || 0) / (reportStats?.total || 1) * 100)}% approval rate`} 
          icon={<CheckCircle />}
        />
        <StatCard 
          title="Issues Identified" 
          value={isLoading ? "..." : reportStats?.issues.toString() || '0'}
          description="Needs attention" 
          icon={<AlertTriangle />}
        />
        <StatCard 
          title="Pending Review" 
          value={isLoading ? "..." : reportStats?.pending.toString() || '0'}
          description="Awaiting action" 
          icon={<Clock />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Issues Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={issuesTrend}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="issues" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Subsystem Issues */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Issues by Subsystem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subsystemIssues}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="issues" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Reports */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Reports</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reports">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentReports && recentReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReports.map((report) => (
              <ReportCard 
                key={report.id} 
                id={report.id}
                trainNumber={report.train_number}
                subsystem={report.subsystem}
                location={report.location}
                status={report.status as ReportStatus}
                createdAt={new Date(report.created_at).toISOString().split('T')[0]}
                hasPhotos={report.has_photos || false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No reports found</h3>
            <p className="text-muted-foreground mt-1">No reports have been submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
