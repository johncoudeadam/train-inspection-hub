
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ReportForm from '@/components/reports/ReportForm';

const NewReport = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Report</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Train Inspection Report</CardTitle>
          <CardDescription>Fill out the form below to submit a new inspection report</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewReport;
