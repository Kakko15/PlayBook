import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DEPARTMENT_COLORS = {
  CBAPA: '080e88',
  CCJE: '7d0608',
  CA: '174008',
  CED: '217580',
  COE: '4c0204',
  CCSICT: 'fda003',
  CON: 'd60685',
  SVM: '464646',
  CAS: 'dac607',
  IOF: '018d99',
  COM: '2c9103',
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Team name must be at least 2 characters.',
  }),
  department_id: z.string().min(1, {
    message: 'Please select a department.',
  }),
  logo_url: z.string().optional(),
});

const TeamModal = ({ isOpen, onClose, onSuccess, tournamentId, team }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const isEditMode = !!team;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      department_id: '',
      logo_url: '',
    },
  });

  const logoUrl = form.watch('logo_url');
  const selectedDeptId = form.watch('department_id');

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const acronym = selectedDept?.acronym || 'NA';
  const color = DEPARTMENT_COLORS[acronym] || '64748b';

  const displayImage =
    logoUrl ||
    (selectedDept
      ? `https://ui-avatars.com/api/?name=${acronym}&background=${color}&color=fff&rounded=true&bold=true&size=128&length=4`
      : null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await api.getDepartments();
        setDepartments(data);
      } catch (error) {
        toast.error('Failed to fetch departments.');
      }
    };

    if (isOpen) {
      fetchDepartments();
      if (isEditMode && team) {
        form.reset({
          name: team.name,
          department_id: team.department_id || '',
          logo_url: team.logo_url || '',
        });
      } else {
        form.reset({
          name: '',
          department_id: '',
          logo_url: '',
        });
      }
    }
  }, [isOpen, isEditMode, team, form]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('team-logos')
        .getPublicUrl(filePath);

      form.setValue('logo_url', data.publicUrl);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(
        'Failed to upload image. Ensure "team-logos" bucket exists and is public.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await api.updateTeam(team.id, values);
        toast.success('Team updated successfully!');
      } else {
        await api.addTeam(tournamentId, values);
        toast.success('Team added successfully!');
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
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Team' : 'Add Team'}</DialogTitle>
          <DialogDescription>
            Customize the team details and logo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='flex flex-col items-center gap-4'>
              <Avatar className='h-24 w-24 border-2 border-border shadow-sm'>
                <AvatarImage src={displayImage} className='object-cover' />
                <AvatarFallback className='bg-muted'>
                  {selectedDept ? (
                    <span className='text-xl font-bold text-muted-foreground'>
                      {selectedDept.acronym}
                    </span>
                  ) : (
                    <ImageIcon className='h-8 w-8 text-muted-foreground' />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className='flex items-center justify-center'>
                <Input
                  id='logo-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleLogoUpload}
                  disabled={isUploading || isLoading}
                  className='hidden'
                />
                <Label
                  htmlFor='logo-upload'
                  className={`flex cursor-pointer items-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {isUploading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Upload className='h-4 w-4' />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload Logo'}
                </Label>
              </div>
            </div>

            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., "College of Engineering"'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='department_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (!form.getValues('name')) {
                          const dept = departments.find((d) => d.id === val);
                          if (dept) form.setValue('name', dept.name);
                        }
                      }}
                      value={field.value}
                      disabled={isLoading || departments.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a department' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.acronym})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='logo_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='https://...' {...field} />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      The URL will be automatically filled if you upload an
                      image above, or you can paste a link.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading || isUploading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditMode ? 'Save Changes' : 'Add Team'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamModal;
