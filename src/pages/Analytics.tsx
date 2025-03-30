
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
import { Download, Filter } from 'lucide-react';
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

// Mock data for analytics charts
const issuesBySubsystem = [
  { name: 'Brakes', value: 25 },
  { name: 'Engine', value: 18 },
  { name: 'Doors', value: 12 },
  { name: 'HVAC', value: 8 },
  { name: 'Electrical', value: 15 },
  { name: 'Suspension', value: 10 }
];

const issuesByLocation = [
  { name: 'Car 1', value: 20 },
  { name: 'Car 2', value: 15 },
  { name: 'Car 3', value: 18 },
  { name: 'Depot', value: 12 },
  { name: 'Station 1', value: 8 },
  { name: 'Yard', value: 5 }
];

const issuesTrend = [
  { month: 'Jan', issues: 12 },
  { month: 'Feb', issues: 19 },
  { month: 'Mar', issues: 15 },
  { month: 'Apr', issues: 20 },
  { month: 'May', issues: 18 },
  { month: 'Jun', issues: 14 }
];

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6m');
  const [project, setProject] = useState('all');
  
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
              <SelectItem value="express">Express Fleet</SelectItem>
              <SelectItem value="urban">Urban Metro</SelectItem>
              <SelectItem value="freight">Freight Train</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
              <CardDescription>Number of issues reported over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={issuesTrend}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Subsystem Tab */}
        <TabsContent value="subsystem">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Subsystem</CardTitle>
              <CardDescription>Distribution of issues across different train subsystems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <BarChart
                      data={issuesBySubsystem}
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
                        data={issuesBySubsystem}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {issuesBySubsystem.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Issues by Location</CardTitle>
              <CardDescription>Distribution of issues across different locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <BarChart
                      data={issuesByLocation}
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
                        data={issuesByLocation}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {issuesByLocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                </ResponsiveContainer>
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
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">•</span>
              <span><strong>Brakes</strong> are the most frequently reported subsystem with issues (25 reports)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">•</span>
              <span><strong>Car 1</strong> has the highest number of reported issues across all locations</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">•</span>
              <span>Issue reports peaked in <strong>April</strong> with 20 reports submitted</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/20 text-primary rounded-full p-1 mr-2">•</span>
              <span>The <strong>Express Fleet</strong> project has the highest number of reports</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
