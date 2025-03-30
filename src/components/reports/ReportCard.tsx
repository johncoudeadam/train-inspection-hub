
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FileText, Calendar, MapPin } from 'lucide-react';

export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

interface ReportCardProps {
  id: string;
  trainNumber: string;
  subsystem: string;
  location: string;
  status: ReportStatus;
  createdAt: string;
  hasPhotos?: boolean;
}

const ReportCard = ({
  id,
  trainNumber,
  subsystem,
  location,
  status,
  createdAt,
  hasPhotos = false
}: ReportCardProps) => {
  const statusColor = {
    Draft: 'bg-muted text-muted-foreground',
    Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    Approved: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">Train #{trainNumber}</CardTitle>
          <Badge className={statusColor[status]}>{status}</Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <FileText className="h-3.5 w-3.5 mr-1" />
          Report #{id}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">Subsystem:</span>
            <span className="text-sm ml-2">{subsystem}</span>
          </div>
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm">{createdAt}</span>
          </div>
          {hasPhotos && <Badge variant="outline" className="mt-2">Has photos</Badge>}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button asChild className="w-full">
          <Link to={`/reports/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportCard;
