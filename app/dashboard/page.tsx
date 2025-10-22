'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CreateTrackerModal from './createTracker/createTrackerModal';
import { useSession, signOut } from 'next-auth/react';
import { useTagFilter } from './hooks/useTagFilter';
import { Tabs } from './components/tabs';
import { TrackersGrid } from './components/trackersGrid';
import { TrackerData } from './types';

// Types

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface FetchTrackersResponse {
  trackers: TrackerData[];
  pagination: PaginationInfo;
}

enum DefaultTabs {
  All = 'all',
  Archived = 'archived',
}

type TabName = (typeof DefaultTabs)[keyof typeof DefaultTabs] | (string & {});

export default function Dashboard() {
  const sortBy = 'createdAt';
  const sortOrder = 'desc' as const;
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<TabName>(DefaultTabs.All);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trackerToDelete, setTrackerToDelete] = useState<TrackerData | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const limit = 10;

  const showArchived = activeTab === 'archived';

  // Fetch tags
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

  const allTags = tagsData?.tags || [];

  // Use custom hook for tag filtering
  const {
    selectedTags,
    toggleTag,
    clearTags,
    isFiltering
  } = useTagFilter();

  // Fetch trackers with React Query
  const {
    data,
    isLoading: loading,
    error,
    refetch: fetchTrackers
  } = useQuery<FetchTrackersResponse>({
    queryKey: ['trackers', { sortBy, sortOrder, selectedTags, offset, limit, showArchived }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder,
        limit: limit.toString(),
        offset: offset.toString(),
        archived: showArchived.toString(),
      });

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/trackers?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch trackers');
      }

      return response.json();
    }
  });

  const trackers = data?.trackers || [];
  const pagination = data?.pagination || { total: 0, limit, offset, hasMore: false };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      setOffset(prev => prev + limit);
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(prev => Math.max(0, prev - limit));
    }
  };

  const handleDeleteTracker = (tracker: TrackerData) => {
    setTrackerToDelete(tracker);
    setDeleteModalOpen(true);
  };

  const handleArchiveTracker = async (tracker: TrackerData) => {
    try {
      const response = await fetch(`/api/trackers/${tracker.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: true }),
      });

      if (response.ok) {
        fetchTrackers();
        setOpenDropdownId(null);
      } else {
        console.error('Failed to archive tracker');
      }
    } catch (error) {
      console.error('Error archiving tracker:', error);
    }
  };

  const confirmDeleteTracker = async () => {
    if (!trackerToDelete) return;

    try {
      const response = await fetch(`/api/trackers/${trackerToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteModalOpen(false);
        setTrackerToDelete(null);
        fetchTrackers();
      } else {
        console.error('Failed to delete tracker');
      }
    } catch (error) {
      console.error('Error deleting tracker:', error);
    }
  };

  const cancelDeleteTracker = () => {
    setDeleteModalOpen(false);
    setTrackerToDelete(null);
  };

  const onOpenTrackerDropdown = (trackerId: number) => {
    setOpenDropdownId(prevId => (prevId === trackerId ? null : trackerId));
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"/>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Price Tracker Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and monitor your price trackers
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <Tabs
          activeTab={activeTab}
          setActiveTab={(tab: TabName) => {
            setActiveTab(tab);
            setOffset(0);
          }}
          onAddTracker={() => setIsCreateModalOpen(true)}
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          clearTags={clearTags}
        />

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading trackers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error.message}</p>
            <button 
              onClick={() => fetchTrackers()}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Modals */}
        {!loading && !error && isCreateModalOpen && (
          <CreateTrackerModal handleCloseModal={() => setIsCreateModalOpen(false)} />
        )}

        {!loading && !error && deleteModalOpen && trackerToDelete && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border border-gray-300">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-4">
                {`Are you sure you want to delete the tracker \"${trackerToDelete.title}\"? This action cannot be undone.`}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDeleteTracker}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTracker}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trackers Grid */}
        {!loading && !error && (
          <TrackersGrid
            trackers={trackers}
            handleAddTracker={() => setIsCreateModalOpen(true)}
            handleOpenTrackerDropdown={onOpenTrackerDropdown}
            pagination={pagination}
            offset={offset}
            limit={limit}
            showArchived={showArchived}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            handleArchiveTracker={handleArchiveTracker}
            handleDeleteTracker={handleDeleteTracker}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
          />
        )}
      </main>
    </div>
  );
}