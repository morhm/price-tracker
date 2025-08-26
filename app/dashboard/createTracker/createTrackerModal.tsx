import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateTrackerModalProps {
  handleCloseModal: () => void;
}

export default function CreateTrackerModal({handleCloseModal}: CreateTrackerModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const router = useRouter(); 

  const handleCreateNewTracker = async () => {
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
          targetPrice: null,
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

      <div className="flex flex-col gap-4 mb-4 ">
        <label className="flex flex-col text-sm font-medium text-gray-700">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tracker title"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-gray-700">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tracker description"
            rows={3}
          ></textarea>
        </label>
        <label className="flex flex-col text-sm font-medium text-gray-700">
            Tags
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tags separated by commas"
              />
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          onClick={() => handleCloseModal() }
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          onClick={handleCreateNewTracker}
        >
          Create
        </button>
    </div>
    </div>
  );
}
