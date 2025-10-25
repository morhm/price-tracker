import type { Listing } from '@/app/generated/prisma';
import { useCallback, useState, useEffect, useRef } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { format } from 'path';

interface ListingsViewProps {
  listings: Listing[];
  onDeleteListing: (listing: Listing) => void;
}

export default function ListingsView({ listings, onDeleteListing }: ListingsViewProps) {
  const [detailsListingId, setDetailsListingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    return formattedDate
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', detailsListingId, 'snapshots'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/listings/${detailsListingId}/snapshots`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing snapshots');
        }
        const data = await response.json();
        return data.listingSnapshots;
      } catch (error) {
        console.error('Error fetching listing snapshots:', error);
        return [];
      }
    },
    enabled: detailsListingId !== null,
  })

  const handleDetailClick = useCallback((listingId: number) => {
    setDetailsListingId((prevId) => (prevId === listingId ? null : listingId));
  }, []);

  const handleRefreshListingClick = useCallback(async (listingId: number) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/refresh`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to refresh listing');
      }
      // Optionally, you can refetch data or show a success message here
    } catch (error) {
      console.error('Error refreshing listing:', error);
    }
  }, []);

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg mb-2">No listings added yet</p>
        <p className="text-sm">Add your first listing to start tracking prices</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {listings.map((listing: Listing) => (
        <div key={listing.id} className="group relative border border-gray-200 rounded-lg p-6 pt-2 hover:shadow-md transition-shadow">
          {/* Menu Button - Top Right */}
          <div className="absolute top-2 right-2" ref={openMenuId === listing.id ? menuRef : null}>
            <button
              onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)}
              className="text-gray-600 hover:text-gray-800 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Options"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {openMenuId === listing.id && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    onDeleteListing(listing);
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between pt-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
              <div className="flex items-center">
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm "
                >
                  {listing.domain}
                </a>
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="flex items-center justify-end gap-2 mb-1">
                <div className="text-2xl font-bold text-gray-900">
                  ${listing.currentPrice.toString()}
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${listing.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {listing.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-4 flex items-center justify-between ali">
            <div className="flex flex-row items-center text-xs text-gray-500 mt-2">
              <span>Last checked: {new Date(listing.lastCheckedAt).toLocaleDateString()}</span>
              <button
                className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium ml-2"
                onClick={() => handleRefreshListingClick(listing.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
              </button>
            </div>
            <button
              className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
              onClick={() => handleDetailClick(listing.id)}
            >
              {detailsListingId === listing.id ? "Hide Details ↑" : "View Details ↓"}
            </button>
          </div>

          {/* Listing Details - Chart */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${detailsListingId === listing.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            {detailsListingId === listing.id && data && (
              <div className="border-t border-gray-200 mt-4 pt-4 w-full">
                <div className="text-sm text-gray-500 mb-2">Price History (Last 7 Days)</div>
                <div className="h-full mt-4 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <LineChart width={600} height={300} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="createdAt" tickFormatter={formatDate} padding={{ left: 20, right: 20 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
                  </LineChart>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}