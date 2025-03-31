
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useReports } from '@/hooks/useReports';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  
  const handleApprove = () => {
    const comments = form.getValues().comments;
    updateReportStatus.mutate(
      { 
        reportId, 
        status: 'Approved',
        comments
      },
      {
        onSuccess: () => {
          toast({
            title: "Report approved",
            description: "The report has been approved successfully",
          });
          if (onClose) onClose();
        }
      }
    );
  };
  
  const handleReject = () => {
    const comments = form.getValues().comments;
    if (!comments) {
      form.setError('comments', { 
        type: 'manual', 
        message: 'Please provide rejection comments' 
      });
      return;
    }
    
    updateReportStatus.mutate(
      { 
        reportId, 
        status: 'Rejected',
        comments
      },
      {
        onSuccess: () => {
          toast({
            title: "Report rejected",
            description: "The report has been rejected",
          });
          if (onClose) onClose();
        }
      }
    );
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
            Reject
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={updateReportStatus.isPending}
            type="button"
          >
            Approve
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReportApprovalForm;
