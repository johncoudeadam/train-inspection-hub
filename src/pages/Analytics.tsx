
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Filter, Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subMonths, subYears, startOfMonth, endOfMonth } from 'date-fns';

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6m');
  const [project, setProject] = useState('all');
  
  // Get the date range based on selected time period
  const getDateRange = () => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1m':
        startDate = subMonths(now, 1);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = subYears(now, 1);
        break;
      default:
        startDate = subMonths(now, 6);
    }
    
    return {
      startDate: startOfMonth(startDate).toISOString(),
      endDate: endOfMonth(now).toISOString()
    };
  };
  
  // Fetch all projects for the filter
  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Get data for issue trends over time
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['issue-trends', timeRange, project],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const monthCount = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
      
      // Create array of months
      const months = Array.from({ length: monthCount }, (_, i) => {
        const date = subMonths(new Date(), i);
        return {
          month: format(date, 'MMM'),
          startDate: startOfMonth(date).toISOString(),
          endDate: endOfMonth(date).toISOString()
        };
      }).reverse();
      
      // Build query
      let query = supabase
        .from('reports')
        .select('created_at, status, notes')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      // Apply project filter if not "all"
      if (project !== 'all') {
        // Join with subsystems or locations to filter by project
        const { data: projectData, error: projectError } = await supabase
          .from('reports')
          .select(`
            id, 
            subsystem, 
            location,
            created_at,
            status,
            notes
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        if (projectError) throw projectError;
        
        // Get subsystems and locations for the selected project
        const { data: subsystems } = await supabase
          .from('subsystems')
          .select('name')
          .eq('project_id', project);
          
        const { data: locations } = await supabase
          .from('locations')
          .select('name')
          .eq('project_id', project);
        
        const subsystemNames = subsystems?.map(s => s.name) || [];
        const locationNames = locations?.map(l => l.name) || [];
        
        // Filter reports by project's subsystems and locations
        const filteredReports = projectData.filter(report => 
          subsystemNames.includes(report.subsystem) || locationNames.includes(report.location)
        );
        
        // Count issues by month
        return months.map(({ month, startDate, endDate }) => {
          const monthReports = filteredReports.filter(report => 
            report.created_at >= startDate && report.created_at <= endDate
          );
          
          const issueCount = monthReports.filter(report => 
            report.status === 'Rejected' || 
            (report.notes && (
              report.notes.toLowerCase().includes('issue') ||
              report.notes.toLowerCase().includes('problem') ||
              report.notes.toLowerCase().includes('repair')
            ))
          ).length;
          
          return {
            month,
            issues: issueCount
          };
        });
      }
      
      // If all projects, count by month directly
      return Promise.all(months.map(async ({ month, startDate, endDate }) => {
        const { count, error } = await supabase
          .from('reports')
          .select('id, notes, status', { count: 'exact' })
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .or('status.eq.Rejected,notes.ilike.%issue%,notes.ilike.%problem%,notes.ilike.%repair%');
          
        if (error) throw error;
        
        return {
          month,
          issues: count || 0
        };
      }));
    }
  });
  
  // Get data for issues by subsystem
  const { data: subsystemData, isLoading: subsystemLoading } = useQuery({
    queryKey: ['subsystem-issues', timeRange, project],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      
      // Build query
      let query = supabase
        .from('reports')
        .select('subsystem, status, notes')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      // Apply project filter if not "all"
      if (project !== 'all') {
        // Get subsystems for this project
        const { data: subsystems } = await supabase
          .from('subsystems')
          .select('name')
          .eq('project_id', project);
          
        const subsystemNames = subsystems?.map(s => s.name) || [];
        
        // Get reports for these subsystems
        const { data, error } = await query
          .in('subsystem', subsystemNames);
          
        if (error) throw error;
        
        // Filter for issues
        const issues = data.filter(report => 
          report.status === 'Rejected' || 
          (report.notes && (
            report.notes.toLowerCase().includes('issue') ||
            report.notes.toLowerCase().includes('problem') ||
            report.notes.toLowerCase().includes('repair')
          ))
        );
        
        // Count by subsystem
        const counts: Record<string, number> = {};
        issues.forEach(issue => {
          counts[issue.subsystem] = (counts[issue.subsystem] || 0) + 1;
        });
        
        return Object.entries(counts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
      }
      
      // For all projects
      const { data, error } = await query
        .or('status.eq.Rejected,notes.ilike.%issue%,notes.ilike.%problem%,notes.ilike.%repair%');
        
      if (error) throw error;
      
      // Count by subsystem
      const counts: Record<string, number> = {};
      data.forEach(issue => {
        counts[issue.subsystem] = (counts[issue.subsystem] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 subsystems
    }
  });
  
  // Get data for issues by location
  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['location-issues', timeRange, project],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      
      // Build query
      let query = supabase
        .from('reports')
        .select('location, status, notes')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      // Apply project filter if not "all"
      if (project !== 'all') {
        // Get locations for this project
        const { data: locations } = await supabase
          .from('locations')
          .select('name')
          .eq('project_id', project);
          
        const locationNames = locations?.map(l => l.name) || [];
        
        // Get reports for these locations
        const { data, error } = await query
          .in('location', locationNames);
          
        if (error) throw error;
        
        // Filter for issues
        const issues = data.filter(report => 
          report.status === 'Rejected' || 
          (report.notes && (
            report.notes.toLowerCase().includes('issue') ||
            report.notes.toLowerCase().includes('problem') ||
            report.notes.toLowerCase().includes('repair')
          ))
        );
        
        // Count by location
        const counts: Record<string, number> = {};
        issues.forEach(issue => {
          counts[issue.location] = (counts[issue.location] || 0) + 1;
        });
        
        return Object.entries(counts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
      }
      
      // For all projects
      const { data, error } = await query
        .or('status.eq.Rejected,notes.ilike.%issue%,notes.ilike.%problem%,notes.ilike.%repair%');
        
      if (error) throw error;
      
      // Count by location
      const counts: Record<string, number> = {};
      data.forEach(issue => {
        counts[issue.location] = (counts[issue.location] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 locations
    }
  });
  
  // Check if any data is loading
  const isLoading = trendLoading || subsystemLoading || locationLoading;
  
  // Get key insights
  const getInsights = () => {
    if (isLoading || !subsystemData || !locationData || !trendData) {
      return [];
    }
    
    const insights = [];
    
    // Most common subsystem issue
    if (subsystemData.length > 0) {
      insights.push({
        text: `<strong>${subsystemData[0].name}</strong> is the most frequently reported subsystem with issues (${subsystemData[0].value} reports)`
      });
    }
    
    // Most common location issue
    if (locationData.length > 0) {
      insights.push({
        text: `<strong>${locationData[0].name}</strong> has the highest number of reported issues across all locations`
      });
    }
    
    // Peak month
    if (trendData.length > 0) {
      const peakMonth = [...trendData].sort((a, b) => b.issues - a.issues)[0];
      insights.push({
        text: `Issue reports peaked in <strong>${peakMonth.month}</strong> with ${peakMonth.issues} reports submitted`
      });
    }
    
    // Top project (if filtering by all projects)
    if (project === 'all' && projects && projects.length > 0) {
      insights.push({
        text: `The <strong>${projects[0].name}</strong> project has significant activity`
      });
    }
    
    return insights;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-40">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-60">
          <Select defaultValue={project} onValueChange={setProject}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading analytics data...</p>
        </div>
      )}
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="trend">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trend">Issue Trends</TabsTrigger>
          <TabsTrigger value="subsystem">By Subsystem</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
        </TabsList>
        
        {/* Issues Trend Tab */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Issue Trends Over Time</CardTitle>
              <CardDescription>
                Number of issues reported over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="issues" 
                        name="Issues" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Subsystem Tab */}
        <TabsContent value="subsystem">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Subsystem</CardTitle>
              <CardDescription>
                Distribution of issues across different train subsystems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : subsystemData && subsystemData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                      <BarChart
                        data={subsystemData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Issues" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                      <PieChart>
                        <Pie
                          data={subsystemData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {subsystemData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </div>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No subsystem data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Location</CardTitle>
              <CardDescription>
                Distribution of issues across different locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : locationData && locationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                      <BarChart
                        data={locationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Issues" 
                          fill="hsl(var(--accent))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                      <PieChart>
                        <Pie
                          data={locationData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </div>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No location data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Summary</CardTitle>
          <CardDescription>Key insights from the data</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-3/6" />
            </div>
          ) : (
            <ul className="space-y-2">
              {getInsights().map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">•</span>
                  <span dangerouslySetInnerHTML={{ __html: insight.text }}></span>
                </li>
              ))}
              {getInsights().length === 0 && (
                <li className="text-muted-foreground">
                  Not enough data to generate insights for the selected period
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
