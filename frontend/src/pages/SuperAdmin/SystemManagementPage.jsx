import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alertDialog';
import { buttonVariants } from '@/components/ui/button';

const SystemManagementPage = () => {
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState(null);
  const [backupToDelete, setBackupToDelete] = useState(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBackups();
      setBackups(data);
    } catch (error) {
      toast.error('Failed to fetch backups.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const { message } = await api.createBackup();
      toast.success(message);
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create backup.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreClick = (backup) => {
    setBackupToRestore(backup);
    setIsRestoreAlertOpen(true);
  };

  const confirmRestore = async () => {
    if (!backupToRestore) return;
    setIsRestoring(backupToRestore.id);
    setIsRestoreAlertOpen(false);
    try {
      const { message } = await api.restoreBackup(backupToRestore.storage_path);
      toast.success(message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore backup.');
    } finally {
      setIsRestoring(null);
      setBackupToRestore(null);
    }
  };

  const handleDeleteClick = (backup) => {
    setBackupToDelete(backup);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!backupToDelete) return;
    setIsDeleting(backupToDelete.id);
    setIsDeleteAlertOpen(false);
    try {
      const { message } = await api.deleteBackup(backupToDelete.id);
      toast.success(message);
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete backup.');
    } finally {
      setIsDeleting(null);
      setBackupToDelete(null);
    }
  };

  return (
    <>
      <div className='p-8'>
        <h1 className='text-3xl font-bold text-foreground'>
          System Management
        </h1>
        <p className='mt-2 text-muted-foreground'>Manage database backups.</p>

        <div className='mt-8'>
          <div className='rounded-lg border border-border bg-card p-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-foreground'>
                Database Backups
              </h2>
              <Button onClick={handleCreateBackup} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Icon name='add' className='mr-2' />
                )}
                Create New Backup
              </Button>
            </div>
            <div className='mt-6 space-y-3'>
              {isLoading ? (
                <div className='flex h-32 items-center justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
              ) : backups.length === 0 ? (
                <p className='text-center text-muted-foreground'>
                  No backups found.
                </p>
              ) : (
                backups.map((backup) => (
                  <div
                    key={backup.id}
                    className='flex items-center justify-between rounded-lg border border-border p-4'
                  >
                    <div>
                      <p className='font-medium text-foreground'>
                        {backup.file_name}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Created on:{' '}
                        {new Date(backup.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleRestoreClick(backup)}
                        disabled={
                          isRestoring === backup.id || isDeleting === backup.id
                        }
                      >
                        {isRestoring === backup.id ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Icon name='restore' className='mr-2' />
                        )}
                        Restore
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeleteClick(backup)}
                        disabled={
                          isRestoring === backup.id || isDeleting === backup.id
                        }
                      >
                        {isDeleting === backup.id ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Icon name='delete' className='mr-2' />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isRestoreAlertOpen}
        onOpenChange={setIsRestoreAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently overwrite the
              current database with the data from{' '}
              <span className='font-bold'>{backupToRestore?.file_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestore}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Yes, Restore Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              backup file{' '}
              <span className='font-bold'>{backupToDelete?.file_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Yes, Delete Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SystemManagementPage;
