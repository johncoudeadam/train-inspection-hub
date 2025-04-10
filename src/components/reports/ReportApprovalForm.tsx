
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useReports } from '@/hooks/useReports';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

interface ReportApprovalFormProps {
  reportId: string;
  onClose?: () => void;
}

const reviewSchema = z.object({
  comments: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const ReportApprovalForm: React.FC<ReportApprovalFormProps> = ({ reportId, onClose }) => {
  const { updateReportStatus } = useReports();
  const { toast } = useToast();
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comments: '',
    },
  });
  
  const handleApprove = async () => {
    try {
      const comments = form.getValues().comments;
      await updateReportStatus.mutateAsync(
        { 
          reportId, 
          status: 'Approved',
          comments
        }
      );
      
      toast({
        title: "Report approved",
        description: "The report has been approved successfully",
      });
      
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message || "An error occurred during approval",
        variant: "destructive"
      });
    }
  };
  
  const handleReject = async () => {
    const comments = form.getValues().comments;
    if (!comments) {
      form.setError('comments', { 
        type: 'manual', 
        message: 'Please provide rejection comments' 
      });
      return;
    }
    
    try {
      await updateReportStatus.mutateAsync(
        { 
          reportId, 
          status: 'Rejected',
          comments
        }
      );
      
      toast({
        title: "Report rejected",
        description: "The report has been rejected",
      });
      
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Rejection failed",
        description: error.message || "An error occurred during rejection",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add your review comments here..."
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={updateReportStatus.isPending}
            type="button"
          >
            {updateReportStatus.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : "Reject"}
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={updateReportStatus.isPending}
            type="button"
          >
            {updateReportStatus.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : "Approve"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReportApprovalForm;
