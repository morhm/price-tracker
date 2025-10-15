'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import CreateTrackerModal from './createTracker/createTrackerModal';
import { useSession, signOut } from 'next-auth/react';
import { useTagFilter } from './hooks/useTagFilter';
import { TagFilter } from './components/tagFilter';

// Types
interface Tracker {
  id: number;
  title: string;
  description?: string;
  targetPrice?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  listings: Array<{
    id: number;
    title: string;
    url: string;
    domain: string;
    currentPrice: number;
    isAvailable: boolean;
    lastCheckedAt: string;
  }>;
  _count: {
    listings: number;
  };
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface FetchTrackersResponse {
  trackers: Tracker[];
  pagination: PaginationInfo;
}

export default function Dashboard() {
  const sortBy = 'createdAt';
  const sortOrder = 'desc' as const;
  const [offset, setOffset] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trackerToDelete, setTrackerToDelete] = useState<Tracker | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const limit = 10;

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

  const handleDeleteTracker = (tracker: Tracker) => {
    setTrackerToDelete(tracker);
    setDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleArchiveTracker = async (tracker: Tracker) => {
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
    <div className={`min-h-screen transition-colors ${showArchived ? 'bg-gray-200' : 'bg-gray-50'}`}>
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
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Tag Filter */}
              <TagFilter 
                allTags={allTags}
                selectedTags={selectedTags}
                clearTags={clearTags}
                toggleTag={toggleTag}
              />

              <button
                onClick={() => fetchTrackers()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Refresh
              </button>
            </div>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`${
                showArchived
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } px-4 py-2 rounded-md text-sm font-medium`}
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
          </div>
        </div>

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

        {/* Add Tracker Button */}
        {!loading && !error && (
          <div className="mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add Tracker
            </button>
          </div>
        )}

        {/* Trackers Grid */}
        {!loading && !error && (
          <>
            {trackers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg">No trackers found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Create your first tracker to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trackers.map((tracker) => (
                  <div
                    key={tracker.id}
                    className={`rounded-lg shadow hover:shadow-md transition-all p-6 group ${
                      showArchived ? 'bg-gray-100 border border-gray-300' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {tracker.title}
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === tracker.id ? null : tracker.id)}
                          className="text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Options"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                        {openDropdownId === tracker.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleArchiveTracker(tracker)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Archive
                              </button>
                              <button
                                onClick={() => handleDeleteTracker(tracker)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {tracker.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {tracker.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500">
                        <span className="block">
                          {tracker._count.listings} listing{tracker._count.listings !== 1 ? 's' : ''}
                        </span>
                        <span className="block">
                          {tracker.tags.length} tag{tracker.tags.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {tracker.targetPrice && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Target Price</p>
                          <p className="text-sm font-medium text-green-600">
                            ${tracker.targetPrice}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {tracker.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tracker.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {tracker.tags.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{tracker.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/tracker/${tracker.id}`}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm py-2 px-3 rounded-md"
                      >
                        View Details
                      </Link>
                      <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md">
                        Edit
                      </button>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 mt-3">
                      Updated {new Date(tracker.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {trackers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 mt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Showing {offset + 1} to{' '}
                    {Math.min(offset + limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={offset === 0}
                      className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-3 py-1 rounded-md text-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore}
                      className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-3 py-1 rounded-md text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}