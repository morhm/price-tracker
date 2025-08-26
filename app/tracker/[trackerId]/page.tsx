'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LoadingTrackerPage from './loading';

export default function TrackerPage() {
    const params = useParams();
    const trackerId = params.trackerId as string;
    
    const [trackerData, setTrackerData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddListingModal, setShowAddListingModal] = useState<boolean>(false);
    
    useEffect(() => {
        const fetchTracker = async () => {
            try {
                setLoading(true);
                setError(null);

                // Validate trackerId
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

                const data = await response.json();
                setTrackerData(data);
            } catch (err) {
                console.error('Error fetching tracker:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTracker();
    }, [trackerId]);

    if (loading) {
        return <LoadingTrackerPage />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
                    <div className="text-gray-600">{error}</div>
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
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {trackerData?.title}
                    </h1>
                </div>

                {/* Tracker Details */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <p className="mt-1 text-gray-900">{trackerData?.description || 'No description provided'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Price</label>
                            <p className="mt-1 text-gray-900">
                                {trackerData?.targetPrice ? `$${trackerData.targetPrice}` : 'Not set'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {trackerData?.tags?.length > 0 ? (
                            trackerData.tags.map((tag: any) => (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                    {tag.name}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-500">No tags assigned</p>
                        )}
                    </div>
                </div>

                {/* Listings Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Listings ({trackerData?.listings?.length || 0})
                        </h2>
                        <button 
                            onClick={() => setShowAddListingModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                            Add Listing
                        </button>
                    </div>
                    
                    {trackerData?.listings?.length > 0 ? (
                        <div className="space-y-4">
                            {trackerData.listings.map((listing: any) => (
                                <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-1">{listing.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{listing.domain}</p>
                                            <a 
                                                href={listing.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                View Listing
                                            </a>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900">
                                                ${listing.currentPrice}
                                            </div>
                                            <div className={`text-sm ${listing.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                {listing.isAvailable ? 'Available' : 'Unavailable'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Last checked: {new Date(listing.lastCheckedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No listings added yet</p>
                            <p className="text-sm">Add your first listing to start tracking prices</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Listing Modal */}
            {showAddListingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Listing</h2>
                        <p className="text-gray-600 mb-4">Add a new listing to track for this tracker.</p>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowAddListingModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowAddListingModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}