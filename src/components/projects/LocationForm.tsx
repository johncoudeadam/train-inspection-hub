
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';

interface LocationFormProps {
  projectId: string;
}

const locationSchema = z.object({
  name: z.string().min(2, { message: 'Location name must be at least 2 characters' }),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const LocationForm: React.FC<LocationFormProps> = ({ projectId }) => {
  const { addLocation } = useProjects();
  
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: LocationFormValues) {
    addLocation.mutate({
      name: data.name,
      projectId
    }, {
      onSuccess: () => {
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" size="sm" disabled={addLocation.isPending}>
          {addLocation.isPending ? 'Adding...' : 'Add Location'}
        </Button>
      </form>
    </Form>
  );
};

export default LocationForm;
