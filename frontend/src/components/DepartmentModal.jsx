import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(5, {
    message: 'Department name must be at least 5 characters.',
  }),
  acronym: z.string().min(2, {
    message: 'Acronym must be at least 2 characters.',
  }),
});

const DepartmentModal = ({ isOpen, onClose, onSuccess, department }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!department;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      acronym: '',
    },
  });

  useEffect(() => {
    if (isEditMode && department) {
      form.reset({
        name: department.name,
        acronym: department.acronym,
      });
    } else {
      form.reset({
        name: '',
        acronym: '',
      });
    }
  }, [isEditMode, department, form]);

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await api.updateDepartment(department.id, values);
        toast.success('Department updated successfully!');
      } else {
        await api.createDepartment(values);
        toast.success('Department created successfully!');
      }
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Department' : 'Create New Department'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this department.'
              : 'Add a new department to the system.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 pt-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., "College of Arts and Sciences"'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='acronym'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acronym</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., "CAS"'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditMode ? 'Save Changes' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentModal;