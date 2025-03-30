
import React, { useState } from 'react';
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
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

// Form schema
const reportSchema = z.object({
  trainNumber: z.string().min(1, "Train number is required"),
  subsystem: z.string().min(1, "Subsystem is required"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const defaultValues: Partial<ReportFormValues> = {
  trainNumber: "",
  subsystem: "",
  location: "",
  notes: "",
};

const ReportForm = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues,
  });

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 10) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 10 photos per report",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit`,
          variant: "destructive",
        });
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

  const onSubmit = (data: ReportFormValues) => {
    // In a real app, this would send the form data and photos to an API
    console.log("Form data:", data);
    console.log("Photos:", photos);
    
    toast({
      title: "Report submitted",
      description: "Your report has been saved as a draft",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subsystem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="brakes">Brakes</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="doors">Doors</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
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
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="car1">Car 1</SelectItem>
                  <SelectItem value="car2">Car 2</SelectItem>
                  <SelectItem value="car3">Car 3</SelectItem>
                  <SelectItem value="station1">Station 1</SelectItem>
                  <SelectItem value="depot">Depot</SelectItem>
                  <SelectItem value="yard">Yard</SelectItem>
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
          <Button type="button" variant="outline">Save as Draft</Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </Form>
  );
};

export default ReportForm;
