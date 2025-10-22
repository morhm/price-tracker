import type { Listing } from '@/app/generated/prisma';
import { useCallback, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { format } from 'path';

interface ListingsViewProps {
  listings: Listing[];
  onDeleteListing: (listing: Listing) => void;
}

export default function ListingsView({ listings, onDeleteListing }: ListingsViewProps) {
  const [ detailsListingId, setDetailsListingId ] = useState<number | null>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    console.log('bloop formattedData', formattedDate)
    return formattedDate
  }

  console.log('bloop detailsListingId', detailsListingId)

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', detailsListingId, 'snapshots'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/listings/${detailsListingId}/snapshots`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing snapshots');
        }
        const data = await response.json();
        console.log('bloop listing snapshots data', data)
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

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg mb-2">No listings added yet</p>
        <p className="text-sm">Add your first listing to start tracking prices</p>
      </div>
    );
  }

  console.log('bloop data', data)

  return (
    <div className="grid gap-4">
      {listings.map((listing: Listing) => (
        <div key={listing.id} className="group relative border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          {/* Delete Icon - Top Right */}
          <button
            onClick={() => onDeleteListing(listing)}
            className="absolute top-4 right-4 text-red-600 hover:text-red-800 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete listing"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div className="flex items-start justify-between pr-8">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{listing.domain}</p>
              <div className="text-xs text-gray-500 mt-2">
                Last checked: {new Date(listing.lastCheckedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="flex items-center justify-end gap-2 mb-1">
                <div className="text-2xl font-bold text-gray-900">
                  ${listing.currentPrice.toString()}
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                listing.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {listing.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-4 flex items-center justify-between">
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Listing →
            </a>

            <button
              className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
              onClick={() => handleDetailClick(listing.id)}
            >
              { detailsListingId === listing.id ? "Hide Details ↑" : "View Details →" }
            </button>
          </div>

          {/* Listing Details - Chart */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              detailsListingId === listing.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
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