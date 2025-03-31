
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

interface SubsystemFormProps {
  projectId: string;
}

const subsystemSchema = z.object({
  name: z.string().min(2, { message: 'Subsystem name must be at least 2 characters' }),
});

type SubsystemFormValues = z.infer<typeof subsystemSchema>;

const SubsystemForm: React.FC<SubsystemFormProps> = ({ projectId }) => {
  const { addSubsystem } = useProjects();
  
  const form = useForm<SubsystemFormValues>({
    resolver: zodResolver(subsystemSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: SubsystemFormValues) {
    addSubsystem.mutate({
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
              <FormLabel>Subsystem Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter subsystem name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" size="sm" disabled={addSubsystem.isPending}>
          {addSubsystem.isPending ? 'Adding...' : 'Add Subsystem'}
        </Button>
      </form>
    </Form>
  );
};

export default SubsystemForm;
