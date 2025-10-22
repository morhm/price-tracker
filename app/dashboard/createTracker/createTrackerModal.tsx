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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md min-w-1/3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Tracker</h1>
        <p className="text-gray-600 mb-4">Add a new tracker to monitor prices</p>

        <form onSubmit={handleSubmit(handleCreateNewTracker, handleInvalidForm)}>
        <div className="flex flex-col gap-4 mb-4 ">
          <div className="flex flex-col max-w-3/4">
            <label className="text-md font-bold text-gray-700">
              Title
            </label>
            <input
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 1, message: 'Title is required' }
              })}
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none"
              placeholder="Title for your new tracker"
            />
            {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>}
          </div>
          <div className="flex flex-col max-w-3/4">
            <label className="text-md font-bold text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none"
              placeholder="Describe what you are tracking (optional)"
              rows={3}
            ></textarea>
          </div>
          <div className="flex flex-col max-w-3/4">
            <label className="text-md font-bold text-gray-700">
              Tags
            </label>
            <p className="text-sm text-gray-500">
              Add tags to help organize your trackers (e.g, "clothing", "electronics")
            </p>
            <div className="mt-1">
              <TagInput
                tags={tagsArray}
                onChange={(newTags) => {
                  setValue('tags', newTags.join(','));
                }}
                availableTags={availableTags}
                placeholder="Type a tag and press Enter"
              />
            </div>
          </div>
          <div className="flex flex-col max-w-3/4">
            <label className="text-md font-bold text-gray-700">
              Target Price
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                {...register('targetPrice', {
                  validate: (value) => {
                    if (!value || value === '') return true;
                    const num = Number(value);
                    return (!isNaN(num) && num > 0) || 'Target price must be a valid positive number';
                  }
                })}
                type="number"
                step="any"
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && !isNaN(Number(value))) {
                    const formatted = parseFloat(value).toFixed(2);
                    setValue('targetPrice', formatted);
                  }
                }}
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter target price (optional)"
              />
            </div>
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
    </div>
  );
}
