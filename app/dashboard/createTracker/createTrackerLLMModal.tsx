import { useMutation } from "@tanstack/react-query";
import { Button } from '@/app/components';
import React from "react";
import { useRouter } from "next/navigation";

interface CreateTrackerLLMModalProps {
  handleCloseModal: () => void;
}

export default function CreateTrackerLLMModal({ handleCloseModal }: CreateTrackerLLMModalProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const createTrackerWithLLMMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tracker');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log('Tracker created:', data);
      if (data.tracker?.id) {
        handleCloseModal();
        router.push(`/tracker/${data.tracker.id}`);
      }
    },
    onError: (error) => {
      console.error('Error creating tracker:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputRef.current?.value || '';
    if (prompt.trim()) {
      createTrackerWithLLMMutation.mutate(prompt);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md min-w-1/3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Tracker with AI</h1>
        <p className="text-gray-600 mb-4">Describe what you want to track and AI will find listings for you</p>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col max-w-3/4">
              <label className="text-md font-bold text-gray-700">
                What would you like to track?
              </label>
              <textarea
                name="llmPrompt"
                ref={inputRef}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="e.g., 'DJI drones under $800' or 'Japanese selvedge jeans'"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific about brands, features, or price ranges you're interested in
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleCloseModal()}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={createTrackerWithLLMMutation.isPending}
              type="submit"
            >
              {createTrackerWithLLMMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}