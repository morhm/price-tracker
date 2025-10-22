import { useEffect } from 'react';
import { TrackerData } from '../types';
import { Tracker as TrackerComponent } from './tracker';

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface TrackersGridProps {
  trackers: TrackerData[];
  handleAddTracker: () => void;
  handleOpenTrackerDropdown: (id: number) => void;
  pagination: PaginationInfo;
  offset: number;
  limit: number;
  showArchived: boolean;
  openDropdownId: number | null;
  setOpenDropdownId: (id: number | null) => void;
  handleArchiveTracker: (tracker: TrackerData) => void;
  handleDeleteTracker: (tracker: TrackerData) => void;
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
              <TrackerComponent
                key={tracker.id}
                id={tracker.id}
                title={tracker.title}
                description={tracker.description}
                targetPrice={tracker.targetPrice}
                tags={tracker.tags}
                count={tracker._count}
                updatedAt={tracker.updatedAt}
                showArchived={showArchived}
                handleOpenTrackerDropdown={handleOpenTrackerDropdown}
                openDropdownId={openDropdownId}
                handleArchiveTracker={handleArchiveTracker}
                handleDeleteTracker={handleDeleteTracker}
              />
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