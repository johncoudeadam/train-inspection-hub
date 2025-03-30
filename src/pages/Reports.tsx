
import React, { useState } from 'react';
import ReportCard from '@/components/reports/ReportCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for reports
const mockReports = [
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
  },
  {
    id: "TR2023-004",
    trainNumber: "D3456",
    subsystem: "HVAC",
    location: "Car 2",
    status: "Rejected" as const,
    createdAt: "2023-06-04",
    hasPhotos: true
  },
  {
    id: "TR2023-005",
    trainNumber: "E7890",
    subsystem: "Electrical",
    location: "Yard",
    status: "Approved" as const,
    createdAt: "2023-06-05",
    hasPhotos: false
  },
  {
    id: "TR2023-006",
    trainNumber: "F1234",
    subsystem: "Suspension",
    location: "Car 3",
    status: "Submitted" as const,
    createdAt: "2023-06-06",
    hasPhotos: true
  }
];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filter reports based on search term and status filter
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = 
      report.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subsystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button asChild>
          <Link to="/reports/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by train number, ID, subsystem..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select 
              defaultValue="all" 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} {...report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No reports found</h3>
          <p className="text-muted-foreground mt-1">Try changing your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
