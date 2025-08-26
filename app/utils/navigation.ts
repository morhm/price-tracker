import { useReducer } from "react";

export const navigateToTrackerPage = (trackerId: string) => {
    if (!trackerId) return;
    if (typeof window !== 'undefined') {
        window.location.href = `/tracker/${trackerId}`;
    }
}