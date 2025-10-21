import { useEffect } from 'react';
import Link from 'next/link';
import { Tracker } from '../types';

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface TrackersGridProps {
  trackers: Tracker[];
  handleAddTracker: () => void;
  handleOpenTrackerDropdown: (id: number) => void;
  pagination: PaginationInfo;
  offset: number;
  limit: number;
  showArchived: boolean;
  openDropdownId: number | null;
  setOpenDropdownId: (id: number | null) => void;
  handleArchiveTracker: (tracker: Tracker) => void;
  handleDeleteTracker: (tracker: Tracker) => void;
  handleNextPage: () => void;
  handlePrevPage: () => void;
}

export const TrackersGrid = ({
  trackers,
  handleAddTracker,
  handleOpenTrackerDropdown,
  pagination,
  offset,
  limit,
  showArchived,
  openDropdownId,
  setOpenDropdownId,
  handleArchiveTracker,
  handleDeleteTracker,
  handleNextPage,
  handlePrevPage,
}: TrackersGridProps) => {
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const dropdownElement = document.querySelector(`[data-dropdown-id="${openDropdownId}"]`);
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId, setOpenDropdownId]);

  return (
    <>
      {trackers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No trackers found</p>
          {!showArchived && (
            <>
              <p className="text-gray-400 text-sm mt-1">
                Create your first tracker to get started
              </p>
              <button
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                onClick={handleAddTracker}
              >
                Add Tracker
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackers.map((tracker) => (
              <Link
                key={tracker.id}
                href={`/tracker/${tracker.id}`}
                className={`rounded-lg shadow hover:shadow-lg transition-all p-6 group cursor-pointer ${showArchived ? 'bg-gray-100 border border-gray-300' : 'bg-white'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {tracker.title}
                  </h3>
                  <div className="relative" data-dropdown-id={tracker.id}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenTrackerDropdown(tracker.id);
                      }}
                      className={`hover:text-gray-700 transition-opacity ${openDropdownId === tracker.id
                        ? 'text-gray-900 opacity-100'
                        : 'text-gray-500 opacity-0 group-hover:opacity-100'
                        }`}
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleArchiveTracker(tracker);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Archive
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTracker(tracker);
                              setOpenDropdownId(null);
                            }}
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

                {/* Timestamp */}
                <p className="text-xs text-gray-400 mt-3">
                  Updated {new Date(tracker.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>

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
        </div>
      )}
    </>
  )
}