import { ListingSnapshot, EventType } from "../generated/prisma";
import { SnapshotData } from "./types";

export const extractListingEvents = (
  currentSnapshot: SnapshotData,
  listingSnapshots: ListingSnapshot[]
): { eventType: EventType; metadata?: any }[] => {
  const events: { eventType: EventType; metadata?: any }[] = [];

  if (listingSnapshots.length === 0) {
    return events; // Not enough data to extract events
  }

  const previousSnapshot = listingSnapshots[0];
  const currentPrice = currentSnapshot.price;
  const previousPrice = typeof previousSnapshot.price === 'number'
    ? previousSnapshot.price
    : previousSnapshot.price?.toNumber();

  // Check for price drop (only if both prices are valid numbers)
  if (currentPrice !== null && previousPrice !== null && previousPrice !== undefined) {
    if (currentPrice < previousPrice) {
      events.push({ eventType: EventType.PRICE_DROP, metadata: { oldPrice: previousPrice, newPrice: currentPrice } });
    }

    // Check for price increase
    if (currentPrice > previousPrice) {
      events.push({ eventType: EventType.PRICE_INCREASE, metadata: { oldPrice: previousPrice, newPrice: currentPrice } });
    }
  }

  // Check for back in stock
  if (currentSnapshot.isAvailable === true && previousSnapshot.isAvailable === false) {
    events.push({ eventType: EventType.BACK_IN_STOCK });
  }

  // Check for out of stock
  if (currentSnapshot.isAvailable === false && previousSnapshot.isAvailable === true) {
    events.push({ eventType: EventType.OUT_OF_STOCK });
  }

  return events
}