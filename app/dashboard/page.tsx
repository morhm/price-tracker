'use client';

import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch trackers
  const fetchTrackers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sort: sortBy,
        order: sortOrder,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/trackers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trackers');
      }

      const data = await response.json();
      setTrackers(data.trackers);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTrackers();
  }, [sortBy, sortOrder, selectedTags, pagination.offset]);

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
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
              onClick={fetchTrackers}
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
            <p className="text-red-800">Error: {error}</p>
            <button 
              onClick={fetchTrackers}
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
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {tracker.title}
                      </h3>
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
                    Showing {pagination.offset + 1} to{' '}
                    {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
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