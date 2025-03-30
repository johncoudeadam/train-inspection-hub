
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useProjects } from '@/hooks/useProjects';

// Form schema
const reportSchema = z.object({
  trainNumber: z.string().min(1, "Train number is required"),
  subsystem: z.string().min(1, "Subsystem is required"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const ReportForm = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createReport, submitReport, uploadPhoto } = useReports();
  const { projects, projectsLoading } = useProjects();
  const { data: subsystems, isLoading: subsystemsLoading } = useProjects().useSubsystems(selectedProjectId);
  const { data: locations, isLoading: locationsLoading } = useProjects().useLocations(selectedProjectId);
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      trainNumber: "",
      subsystem: "",
      location: "",
      notes: "",
    },
  });

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 10) {
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPhotoUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setPhotos(prev => [...prev, ...validFiles]);
    setPhotoPreviewUrls(prev => [...prev, ...newPhotoUrls]);
  };

  const removePhoto = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReportFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the report
      const reportResult = await createReport.mutateAsync({
        trainNumber: data.trainNumber,
        subsystem: data.subsystem,
        location: data.location,
        notes: data.notes,
      });
      
      // Upload photos if any
      if (photos.length > 0 && reportResult) {
        await Promise.all(
          photos.map(photo => 
            uploadPhoto.mutateAsync({ 
              reportId: reportResult.id, 
              file: photo 
            })
          )
        );
      }
      
      // Submit the report for review
      await submitReport.mutateAsync(reportResult.id);
      
      // Navigate back to reports list
      navigate('/reports');
      
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    form.setValue('subsystem', '');
    form.setValue('location', '');
  };
  
  const saveAsDraft = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    
    try {
      setIsSubmitting(true);
      
      // Get form data
      const data = form.getValues();
      
      // Create the report
      const reportResult = await createReport.mutateAsync({
        trainNumber: data.trainNumber,
        subsystem: data.subsystem,
        location: data.location,
        notes: data.notes,
      });
      
      // Upload photos if any
      if (photos.length > 0 && reportResult) {
        await Promise.all(
          photos.map(photo => 
            uploadPhoto.mutateAsync({ 
              reportId: reportResult.id, 
              file: photo 
            })
          )
        );
      }
      
      // Navigate back to reports list
      navigate('/reports');
      
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Selection */}
        <FormItem>
          <FormLabel>Project</FormLabel>
          <Select onValueChange={handleProjectChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                projects?.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormDescription>
            Select a project to load its subsystems and locations
          </FormDescription>
        </FormItem>
        
        {/* Train Number */}
        <FormField
          control={form.control}
          name="trainNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Train Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. TR-2023-01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Subsystem */}
        <FormField
          control={form.control}
          name="subsystem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subsystem</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedProjectId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subsystem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subsystemsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    subsystems?.map(subsystem => (
                      <SelectItem key={subsystem.id} value={subsystem.name}>
                        {subsystem.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedProjectId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locationsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    locations?.map(location => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter detailed notes about the inspection..." 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about the inspection findings
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Photo Upload */}
        <div className="space-y-3">
          <FormLabel>Photos</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photoPreviewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="h-40 w-full object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {photos.length < 10 && (
              <div className="h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handlePhotosChange}
                />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium text-center">Upload Photo</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    Max 5MB per image
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {photos.length}/10 photos
                  </span>
                </label>
              </div>
            )}
          </div>
          <FormDescription>
            Upload up to 10 photos of the inspection (JPEG or PNG, max 5MB each)
          </FormDescription>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-between pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={saveAsDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : "Save as Draft"}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : "Submit Report"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReportForm;
