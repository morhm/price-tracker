'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import LoadingTrackerPage from './loading';
import AddListingModal from '../addListingModal';
import ListingsView from '../components/listingsView';
import { useQuery } from '@tanstack/react-query';
import type { Listing, Tag } from '@/app/generated/prisma';
import { TagInput } from '@/components';

export default function TrackerPage() {
  const params = useParams();
  const trackerId = params.trackerId as string;

  const [showAddListingModal, setShowAddListingModal] = useState<boolean>(false);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [isEditingTargetPrice, setIsEditingTargetPrice] = useState<boolean>(false);
  const [editedTargetPrice, setEditedTargetPrice] = useState<string>('');
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

  const {
    data: trackerData,
    isLoading: loading,
    error,
    refetch: refetchTracker,
  } = useQuery({
    queryKey: ['tracker', trackerId],
    queryFn: async () => {
      if (!trackerId || isNaN(Number(trackerId))) {
        throw new Error('Invalid tracker ID');
      }

      const response = await fetch(`/api/trackers/${trackerId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tracker not found');
        }
        if (response.status === 400) {
          throw new Error('Invalid tracker ID');
        }
        throw new Error(`Failed to fetch tracker: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!trackerId,
  });

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


  const handleAddListing = async (data: { url: string; title: string }) => {
    try {
      const { url, title } = data;
      const response = await fetch(`/api/trackers/${trackerId}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, title }),
      });

      if (response.ok) {
        setShowAddListingModal(false);
        refetchTracker();
      } else {
        console.error('Failed to add listing');
      }
    } catch (error) {
      console.error('Error adding listing:', error);
    }
  }

  const handleEditDescription = () => {
    setEditedDescription(trackerData?.description || '');
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    try {
      const response = await fetch(`/api/trackers/${trackerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: editedDescription }),
      });

      console.log('Response from updating description:', response);

      if (response.ok) {
        setIsEditingDescription(false);
        refetchTracker();
      } else {
        console.error('Failed to update description');
      }
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription('');
  };

  const handleEditTitle = () => {
    setEditedTitle(trackerData?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    try {
      const response = await fetch(`/api/trackers/${trackerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editedTitle }),
      });

      if (response.ok) {
        setIsEditingTitle(false);
        refetchTracker();
      } else {
        console.error('Failed to update title');
      }
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleEditTargetPrice = () => {
    setEditedTargetPrice(trackerData?.targetPrice?.toString() || '');
    setIsEditingTargetPrice(true);
  };

  const handleSaveTargetPrice = async () => {
    try {
      const targetPrice = editedTargetPrice ? parseFloat(editedTargetPrice) : null;
      const response = await fetch(`/api/trackers/${trackerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetPrice }),
      });

      if (response.ok) {
        setIsEditingTargetPrice(false);
        refetchTracker();
      } else {
        console.error('Failed to update target price');
      }
    } catch (error) {
      console.error('Error updating target price:', error);
    }
  };

  const handleCancelEditTargetPrice = () => {
    setIsEditingTargetPrice(false);
    setEditedTargetPrice('');
  };

  const handleEditTags = () => {
    setSelectedTags(trackerData?.tags?.map((tag: Tag) => tag.name) || []);
    setIsEditingTags(true);
  };

  const handleSaveTags = async () => {
    try {
      const tags = selectedTags.map(name => ({ name }));
      const response = await fetch(`/api/trackers/${trackerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      });

      if (response.ok) {
        setIsEditingTags(false);
        setSelectedTags([]);
        refetchTracker();
      } else {
        console.error('Failed to update tags');
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const handleCancelEditTags = () => {
    setIsEditingTags(false);
    setSelectedTags([]);
  };

  const handleDeleteListing = (listing: Listing) => {
    setListingToDelete(listing);
    setDeleteModalOpen(true);
  };

  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;

    try {
      const response = await fetch(`/api/trackers/listings/${listingToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteModalOpen(false);
        setListingToDelete(null);
        refetchTracker();
      } else {
        console.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const cancelDeleteListing = () => {
    setDeleteModalOpen(false);
    setListingToDelete(null);
  };

  if (loading) {
    return <LoadingTrackerPage />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="text-green-600 hover:text-green-700 p-1"
                  title="Save title"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEditTitle}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Cancel edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">
                  {trackerData?.title}
                </h1>
                <button
                  onClick={handleEditTitle}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Edit title"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Details & Tags */}
        <div className="w-1/3 bg-white border-r p-6 overflow-y-auto">
          {/* Tracker Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  {!isEditingDescription && (
                    <button
                      onClick={handleEditDescription}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Edit description"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter description..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditDescription}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {trackerData?.description || 'No description provided'}
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Target Price</label>
                  {!isEditingTargetPrice && (
                    <button
                      onClick={handleEditTargetPrice}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Edit target price"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {isEditingTargetPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-gray-600">$</span>
                      <input
                        type="number"
                        value={editedTargetPrice}
                        onChange={(e) => setEditedTargetPrice(e.target.value)}
                        className="text-2xl font-bold text-green-600 bg-transparent border-b-2 border-green-500 focus:outline-none focus:border-green-600 w-32"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTargetPrice}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditTargetPrice}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {trackerData?.targetPrice ? `$${trackerData.targetPrice}` : 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
              {!isEditingTags && (
                <button
                  onClick={handleEditTags}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Edit tags"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
            {isEditingTags ? (
              <div className="space-y-3">
                <TagInput
                  tags={selectedTags}
                  onChange={(newTags) => setSelectedTags(newTags)}
                  availableTags={availableTags}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTags}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditTags}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trackerData?.tags?.length > 0 ? (
                  trackerData.tags.map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No tags assigned</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Listings */}
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Listings ({trackerData?.listings?.length || 0})
            </h2>
            <button
              onClick={() => setShowAddListingModal(true)}
              className="bg-white border-2 border-blue-500 hover:bg-gray-300 text-black px-6 py-2 rounded-md"
            >
              Add Listing
            </button>
          </div>

          <ListingsView
            listings={trackerData?.listings || []}
            onDeleteListing={handleDeleteListing}
          />
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddListingModal && (
        <AddListingModal
          handleAddListing={handleAddListing}
          handleClose={() => setShowAddListingModal(false)}
        />
      )}

      {/* Delete Listing Modal */}
      {deleteModalOpen && listingToDelete && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border border-gray-300">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-4">
              {`Are you sure you want to delete the listing "${listingToDelete.title}"? This action cannot be undone.`}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDeleteListing}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteListing}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}