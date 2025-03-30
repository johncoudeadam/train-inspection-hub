
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
import { PlusCircle, Search, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReports } from '@/hooks/useReports';
import { ReportStatus } from '@/lib/supabase';

const Reports = () => {
  const { 
    reports, 
    isLoading, 
    error, 
    searchParams, 
    setSearchParams 
  } = useReports();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, trainNumber: e.target.value }));
  };
  
  const handleStatusFilter = (value: string) => {
    setSearchParams(prev => ({ ...prev, status: value }));
  };
  
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
            value={searchParams.trainNumber}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select 
              defaultValue="all" 
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="text-center py-12 text-destructive">
          <p>Failed to load reports</p>
          <p className="text-sm mt-1">{(error as Error).message}</p>
        </div>
      )}
      
      {/* Reports Grid */}
      {!isLoading && reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard 
              key={report.id} 
              id={report.id}
              trainNumber={report.train_number}
              subsystem={report.subsystem}
              location={report.location}
              status={report.status as ReportStatus}
              createdAt={new Date(report.created_at).toISOString().split('T')[0]}
              hasPhotos={report.has_photos}
            />
          ))}
        </div>
      ) : !isLoading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No reports found</h3>
          <p className="text-muted-foreground mt-1">Try changing your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
