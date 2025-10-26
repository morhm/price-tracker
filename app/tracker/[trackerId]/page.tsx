'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import LoadingTrackerPage from './loading';
import AddListingModal from '../addListingModal';
import ListingsView from '../components/listingsView';
import { useQuery } from '@tanstack/react-query';
import type { Listing, Tag } from '@/app/generated/prisma';
import { TagInput, Tag as TagComponent  } from '@/components';
import { useQueryClient } from '@tanstack/react-query';

export default function TrackerPage() {
  const params = useParams();
  const trackerId = params.trackerId as string;

  const [showAddListingModal, setShowAddListingModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedTargetPrice, setEditedTargetPrice] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const queryClient = useQueryClient();

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

  const handleSaveTracker = async () => {
    try {
      const isTitleDirty = editedTitle !== trackerData?.title;
      const isDescriptionDirty = editedDescription !== trackerData?.description;
      const isEditingTargetPriceDirty = editedTargetPrice !== (trackerData?.targetPrice?.toString() || '');
      const isEditingTagsDirty = selectedTags.sort().toString() !== trackerData?.tags?.map((tag: Tag) => tag.name).sort().toString();

      const editedFields = {
        ...(isTitleDirty && { title: editedTitle }),
        ...(isDescriptionDirty && { description: editedDescription }),
        ...(isEditingTargetPriceDirty && { targetPrice: editedTargetPrice ? parseFloat(editedTargetPrice) : null }),
        ...(isEditingTagsDirty && { tags: selectedTags.map(name => ({ name })) }),
      }

      const response = await fetch(`/api/trackers/${trackerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedFields),
      });

      if (response.ok) {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ['trackers'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] });
      } else {
        console.error('Failed to update tracker');
      }
    } catch (error) {
      console.error('Error updating tracker:', error);
    }
  }

  const handleCancelEditTracker = () => {
    setEditedTitle('');
    setEditedDescription('');
    setEditedTargetPrice('');
    setSelectedTags([]);

    setIsEditing(false);
  }

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
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                  autoFocus
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">
                  {trackerData?.title}
                </h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 self-end">
            {isEditing ? (
              <>
                <button onClick={handleCancelEditTracker} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  Cancel
                </button>
                <button
                  onClick={handleSaveTracker}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button className="bg-white border-2 border-blue-500 hover:bg-gray-100 text-gray-900 font-medium px-4 py-1 rounded-md" onClick={() => {
                setEditedTitle(trackerData?.title || '');
                setEditedDescription(trackerData?.description || '');
                setEditedTargetPrice(trackerData?.targetPrice?.toString() || '');
                setSelectedTags(trackerData?.tags?.map((tag: Tag) => tag.name) || []);
                setIsEditing(true);
              }}>
                Edit
              </button>
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
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter description..."
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 p-3 rounded-md">
                    {trackerData?.description || 'No description provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Price</label>
                {isEditing ? (
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
              <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
            {isEditing ? (
              <div className="space-y-3">
                <TagInput
                  tags={selectedTags}
                  onChange={(newTags) => setSelectedTags(newTags)}
                  availableTags={availableTags}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-3">
                {trackerData?.tags?.length > 0 ? (
                  trackerData.tags.map((tag: Tag) => (
                    <TagComponent
                      name={tag.name}
                      color={tag.color}
                      key={tag.id}
                    />
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