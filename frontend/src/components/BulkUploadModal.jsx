import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';

const BulkUploadModal = ({ isOpen, onClose, onSuccess, tournamentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'text/csv' &&
      selectedFile.type !== 'application/vnd.ms-excel'
    ) {
      toast.error('Invalid file type. Please upload a .csv file.');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter((row) => row.trim() !== '');
      if (rows.length < 2) {
        toast.error('CSV file must have a header and at least one data row.');
        return;
      }

      const header = rows[0].trim().split(',');
      const nameIndex = header.findIndex((h) => h.trim() === 'name');
      const acronymIndex = header.findIndex(
        (h) => h.trim() === 'department_acronym'
      );

      if (nameIndex === -1 || acronymIndex === -1) {
        toast.error(
          'Invalid CSV header. Must include "name" and "department_acronym" columns.'
        );
        return;
      }

      const data = rows.slice(1).map((row) => {
        const values = row.trim().split(',');
        return {
          name: values[nameIndex]?.trim(),
          department_acronym: values[acronymIndex]?.trim(),
        };
      });
      setParsedData(data);
    };
    reader.readAsText(file);
  };

  const previewData = useMemo(() => {
    return parsedData.slice(0, 5);
  }, [parsedData]);

  const onSubmit = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid data to upload.');
      return;
    }

    setIsLoading(true);
    try {
      const { message, skipped, skippedPlayers } = await api.bulkAddPlayers(
        tournamentId,
        parsedData
      );
      toast.success(message);
      if (skipped > 0) {
        console.warn('Skipped players:', skippedPlayers);
        toast.error(
          `${skipped} players were skipped. Check console for details.`
        );
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
    setFile(null);
    setParsedData([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Bulk Upload Roster</DialogTitle>
          <DialogDescription>
            Upload a .csv file with "name" and "department_acronym" columns.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <Input
            type='file'
            accept='.csv'
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {previewData.length > 0 && (
            <div>
              <h4 className='mb-2 text-sm font-medium text-foreground'>
                Data Preview (First 5 Rows)
              </h4>
              <div className='rounded-lg border bg-muted p-3'>
                <pre className='text-xs'>
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                Total players found: {parsedData.length}
              </p>
            </div>
          )}
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
          <Button
            type='button'
            onClick={onSubmit}
            disabled={isLoading || parsedData.length === 0}
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Uploading...' : 'Upload Roster'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
