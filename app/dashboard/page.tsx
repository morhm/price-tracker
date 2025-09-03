'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import CreateTrackerModal from './createTracker/createTrackerModal';

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [offset, setOffset] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trackerToDelete, setTrackerToDelete] = useState<Tracker | null>(null);
  const limit = 10;

  // Fetch trackers with React Query
  const {
    data,
    isLoading: loading,
    error,
    refetch: fetchTrackers
  } = useQuery<FetchTrackersResponse>({
    queryKey: ['trackers', { sortBy, sortOrder, selectedTags, offset, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder,
        limit: limit.toString(),
        offset: offset.toString(),
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
            <div className="flex space-x-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Add Tracker
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="updatedAt">Last Updated</option>
              </select>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Tags:</label>
              <input
                type="text"
                placeholder="Filter by tags (comma-separated)"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  setSelectedTags(tags);
                }}
              />
            </div>

            <button
              onClick={() => fetchTrackers()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Refresh
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
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-4">
                {"Are you sure you want to delete the tracker \"{trackerToDelete.title}\"? This action cannot be undone."}
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
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {tracker.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteTracker(tracker)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Tracker"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h1v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 3v9a1 1 0 102 0V5a1 1 0 10-2 0zm4 0v9a1 1 0 102 0V5a1 1 0 10-2 0z" clipRule="evenodd" />
                        </svg>
                      </button>
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