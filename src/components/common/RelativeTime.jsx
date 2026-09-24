import { useEffect, useState } from "react";


function getRelativeTime(timestamp) {
    if (!timestamp) {
        return "";
    }

    const diffMs = Date.now() - new Date(timestamp).getTime();

    if (diffMs < 0) {
        return "just now";
    }

    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
        return "just now";
    }

    if (diffMinutes === 1) {
        return "1 min ago";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours === 1) {
        return "1 hr ago";
    }

    if (diffHours < 24) {
        return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 1) {
        return "1 day ago";
    }

    return `${diffDays} days ago`;
}


function RelativeTime({ timestamp }) {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!timestamp) {
            return;
        }

        const interval = setInterval(() => {
            setTick((current) => current + 1);
        }, 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [timestamp]);

    return getRelativeTime(timestamp);
}


export default RelativeTime;