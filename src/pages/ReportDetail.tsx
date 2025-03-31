
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Download, Edit, MapPin, FileText, Camera, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportStatus } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReportApprovalForm from '@/components/reports/ReportApprovalForm';
import { useAuth } from '@/context/AuthContext';
import { useReports } from '@/hooks/useReports';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const { submitReport } = useReports();

  // Fetch report details
  const { 
    data: report, 
    isLoading: reportLoading, 
    error: reportError,
    refetch: refetchReport
  } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch photos for the report
  const { 
    data: photos, 
    isLoading: photosLoading 
  } = useQuery({
    queryKey: ['report-photos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('report_id', id);
        
      if (error) throw error;
      return data;
    },
    enabled: !!report?.has_photos,
  });

  // Submit report for review
  const handleSubmitReport = () => {
    if (!id) return;
    
    submitReport.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Report submitted",
          description: "Your report has been submitted for review",
        });
        refetchReport();
      }
    });
  };

  // Status badge styling
  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-muted text-muted-foreground';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Check user permissions
  const canReview = userRole === 'Manager' && report?.status === 'Submitted';
  const canSubmit = userRole === 'Technician' && report?.status === 'Draft';
  const canEdit = userRole === 'Technician' && report?.status === 'Draft';

  if (reportLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Report Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-medium text-destructive mb-2">Error Loading Report</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't load the report details. The report may have been deleted or you may not have permission to view it.
            </p>
            <Button asChild>
              <Link to="/reports">Go back to Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Report Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-medium mb-2">No Report Found</h2>
            <p className="text-muted-foreground mb-4">
              The report you're looking for doesn't exist or may have been deleted.
            </p>
            <Button asChild>
              <Link to="/reports">Go back to Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Train #{report.train_number}</h1>
        </div>
        <Badge className={getStatusBadgeClass(report.status as ReportStatus)}>
          {report.status}
        </Badge>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Report Details
          </CardTitle>
          <CardDescription>Report #{id}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subsystem</h3>
                <p className="text-lg">{report.subsystem}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-1 mr-1 text-muted-foreground" />
                  <p className="text-lg">{report.location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p>{new Date(report.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {report.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <div className="p-4 bg-muted rounded-md">
                  <p>{report.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {report.has_photos && photos && photos.length > 0 && (
            <div className="pt-4">
              <Separator className="mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                Photos ({photos.length})
              </h3>
              
              <Carousel className="w-full">
                <CarouselContent>
                  {photos.map((photo) => (
                    <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
                          <img 
                            src={photo.url} 
                            alt="Report photo"
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/reports">
              Back to Reports
            </Link>
          </Button>
          
          <div className="flex gap-2">
            {canSubmit && (
              <Button onClick={handleSubmitReport} disabled={submitReport.isPending}>
                {submitReport.isPending ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
            
            {canEdit && (
              <Button asChild>
                <Link to={`/reports/edit/${report.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Report
                </Link>
              </Button>
            )}
            
            {canReview && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Review Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Report</DialogTitle>
                    <DialogDescription>
                      Approve or reject this report with comments
                    </DialogDescription>
                  </DialogHeader>
                  <ReportApprovalForm 
                    reportId={id as string} 
                    onClose={() => {
                      refetchReport();
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <Button variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReportDetail;
