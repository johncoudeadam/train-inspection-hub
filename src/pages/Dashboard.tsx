
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
  TrendingUp,
  TrendingDown,
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

// Mock data for dashboard charts
const issuesTrendData = [
  { month: 'Jan', issues: 12 },
  { month: 'Feb', issues: 19 },
  { month: 'Mar', issues: 15 },
  { month: 'Apr', issues: 20 },
  { month: 'May', issues: 18 },
  { month: 'Jun', issues: 14 }
];

const subsystemIssuesData = [
  { name: 'Brakes', issues: 15 },
  { name: 'Engine', issues: 12 },
  { name: 'Doors', issues: 8 },
  { name: 'HVAC', issues: 5 },
  { name: 'Electrical', issues: 10 },
  { name: 'Suspension', issues: 7 }
];

// Mock reports for recent reports list
const recentReports = [
  {
    id: "TR2023-001",
    trainNumber: "A1234",
    subsystem: "Brakes",
    location: "Car 1",
    status: "Approved" as const,
    createdAt: "2023-06-01",
    hasPhotos: true
  },
  {
    id: "TR2023-002",
    trainNumber: "B5678",
    subsystem: "Engine",
    location: "Depot",
    status: "Submitted" as const,
    createdAt: "2023-06-02",
    hasPhotos: false
  },
  {
    id: "TR2023-003",
    trainNumber: "C9012",
    subsystem: "Doors",
    location: "Station 1",
    status: "Draft" as const,
    createdAt: "2023-06-03",
    hasPhotos: true
  }
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/reports/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Reports" 
          value="146"
          description="Last 30 days" 
          icon={<FileText />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Approved" 
          value="98"
          description="67% approval rate" 
          icon={<CheckCircle />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard 
          title="Issues Identified" 
          value="53"
          description="32 high priority" 
          icon={<AlertTriangle />}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard 
          title="Pending Review" 
          value="15"
          description="Avg. 2 days wait time" 
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={issuesTrendData}
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subsystemIssuesData}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentReports.map((report) => (
            <ReportCard key={report.id} {...report} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
