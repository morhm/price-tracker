import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from 'react-hook-form';

type FormInputs = {
  title: string;
  description: string;
  tags: string;
  targetPrice: string;
}

interface CreateTrackerModalProps {
  handleCloseModal: () => void;
}

export default function CreateTrackerModal({handleCloseModal}: CreateTrackerModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      targetPrice: ''
    }
  });
  const router = useRouter(); 

  const handleCreateNewTracker: SubmitHandler<FormInputs> = async (data) => {
    const { title, description, tags, targetPrice } = data;
    try {
      const tagArray = tags.split(',').map(tag => ({ name: tag.trim() })).filter(tag => tag.name);
      
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
        }),
      });

      const responseJson = await response.json();

      if (response.ok) {
        handleCloseModal();
        router.push('/tracker/' + responseJson.id);
      } else {
        console.error('Failed to create tracker');
      }
    } catch (error) {
      console.error('Error creating tracker:', error);
    }
  };
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
      <h1>Create Tracker Modal</h1>
      <p>This is a placeholder for the create tracker modal.\n\n\n\n\n\n\n\n</p>

      <form onSubmit={handleSubmit(handleCreateNewTracker)} className="mt-4">
        <div className="flex flex-col gap-4 mb-4 ">
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Title
            <input
              {...register('title', { required: true }) }
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tracker title"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Description
            <textarea
              {...register('description')}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tracker description"
              rows={3}
            ></textarea>
          </label>
          <label className="flex flex-col text-sm font-medium text-gray-700">
              Tags
              <input
                {...register('tags', { })}
                defaultValue={""}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas"
                />
          </label>
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Target Price
            <input
              {...register('targetPrice')}
              type="number"
              step="0.01"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter target price (optional)"
            />
          </label>
        </div>
      </form>

      <div className="flex justify-end space-x-2">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          onClick={() => handleCloseModal() }
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          type="submit"
        >
          Create
        </button>
    </div>
    </div>
  );
}
