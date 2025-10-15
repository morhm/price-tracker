import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { TagInput, useToast } from "@/components";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type FormData = {
  title: string;
  description?: string;
  tags?: string;
  targetPrice?: string;
};

interface CreateTrackerModalProps {
  handleCloseModal: () => void;
}

export default function CreateTrackerModal({ handleCloseModal }: CreateTrackerModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      targetPrice: ''
    }
  });
  const router = useRouter();
  const { showError } = useToast();
  const queryClient = useQueryClient();

  // Fetch available tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      return response.json();
    }
  });

  const availableTags = tagsData?.tags || [];

  const tagsValue = watch('tags') || '';
  const tagsArray = tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(Boolean) : [];

  // Define mutation at component level
  const createTrackerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { title, description, tags, targetPrice } = data;
      const tagArray = tags ? tags.split(',').map(tag => ({ name: tag.trim() })).filter(tag => tag.name) : [];

      const response = await fetch('/api/trackers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
          tags: tagArray,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tracker');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trackers'] });
      handleCloseModal();
      router.push('/tracker/' + data.id);
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create tracker');
      console.error('Failed to create tracker:', error);
    }
  });

  const handleCreateNewTracker: SubmitHandler<FormData> = async (data) => {
    createTrackerMutation.mutate(data);
  };

  const handleInvalidForm: SubmitErrorHandler<FormData> = (errors) => {
    console.log('Form validation errors:', errors);
    showError('Please fix the form errors before submitting.');
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
      <h1>Create Tracker Modal</h1>
      <p>This is a placeholder for the create tracker modal.\n\n\n\n\n\n\n\n</p>

      <form onSubmit={handleSubmit(handleCreateNewTracker, handleInvalidForm)} className="mt-4">
        <div className="flex flex-col gap-4 mb-4 ">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 1, message: 'Title is required' }
              })}
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tracker title"
            />
            {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tracker description"
              rows={3}
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Tags
            </label>
            <TagInput
              tags={tagsArray}
              onChange={(newTags) => {
                setValue('tags', newTags.join(','));
              }}
              availableTags={availableTags}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Target Price
            </label>
            <input
              {...register('targetPrice', {
                validate: (value) => {
                  if (!value || value === '') return true;
                  const num = Number(value);
                  return (!isNaN(num) && num > 0) || 'Target price must be a valid positive number';
                }
              })}
              type="number"
              step="0.01"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter target price (optional)"
            />
            {errors.targetPrice && <span className="text-red-500 text-sm mt-1">{errors.targetPrice.message}</span>}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            onClick={() => handleCloseModal()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={createTrackerMutation.isPending}
          >
            {createTrackerMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
