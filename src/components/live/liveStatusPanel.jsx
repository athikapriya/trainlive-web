function LiveStatusPanel({
    showLive,
    liveTrainNumber,
    liveCount,
    isLiveLoading,
    liveError,
    isSharing,
    sharingTrainNumber,
    isStarting,
    isStopping,
    sharingError,
    lastLocation,
    onStopLive,
    onStopSharing,
    onDismissError,
}) {
    const hasSharingError = Boolean(sharingError) && !isSharing;

    if (!showLive && !isSharing && !hasSharingError) {
        return null;
    }

    const sharingLocation =
        lastLocation && typeof lastLocation.latitude === "number" && typeof lastLocation.longitude === "number";

    return (
        <div className="live-status-panel">
            {showLive && (
                <div className="live-status-section">
                    <div className="live-status-heading">
                        <span className="live-status-dot" />

                        <div className="live-status-heading-text">
                            <strong>Live · {liveTrainNumber}</strong>

                            <span>
                                {isLiveLoading
                                    ? "Checking live locations..."
                                    : liveCount > 0
                                      ? `${liveCount} ${liveCount === 1 ? "person" : "people"} sharing live`
                                      : "No one is sharing live right now"}
                            </span>
                        </div>
                    </div>

                    {liveError && (
                        <div className="live-status-message error">
                            <span className="live-status-error-text">{liveError}</span>

                            <button
                                type="button"
                                className="live-status-error-close"
                                onClick={onDismissError}
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {!isLiveLoading && !liveError && liveCount === 0 && (
                        <div className="live-status-message">Be the first to share your location on this train.</div>
                    )}

                    <button type="button" className="live-status-stop" onClick={onStopLive}>
                        Stop Live
                    </button>
                </div>
            )}

            {isSharing && (
                <div className="live-status-section sharing">
                    <div className="live-status-heading">
                        <span className="live-status-sharing-dot" />

                        <div className="live-status-heading-text">
                            <strong>Sharing · {sharingTrainNumber}</strong>

                            <span>
                                {isStarting
                                    ? "Starting live sharing..."
                                    : isStopping
                                      ? "Stopping live sharing..."
                                      : sharingLocation
                                        ? "Your live location is being shared"
                                        : "Waiting for your location..."}
                            </span>
                        </div>
                    </div>

                    {sharingError && (
                        <div className="live-status-message error">
                            <span className="live-status-error-text">{sharingError}</span>

                            <button
                                type="button"
                                className="live-status-error-close"
                                onClick={onDismissError}
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {!sharingError && !isStarting && !sharingLocation && (
                        <div className="live-status-message">
                            Waiting for GPS. Make sure location access is allowed.
                        </div>
                    )}

                    <button
                        type="button"
                        className="live-status-stop sharing"
                        onClick={onStopSharing}
                        disabled={isStopping || isStarting}
                    >
                        {isStopping ? "Stopping..." : "Stop Sharing"}
                    </button>
                </div>
            )}

            {hasSharingError && (
                <div className="live-status-section sharing">
                    <div className="live-status-heading">
                        <span className="live-status-sharing-dot" />

                        <div className="live-status-heading-text">
                            <strong>Live sharing stopped</strong>

                            <span>{sharingTrainNumber ? `Train ${sharingTrainNumber}` : "Your live session"}</span>
                        </div>
                    </div>

                    <div className="live-status-message error">
                        <span className="live-status-error-text">{sharingError}</span>

                        <button
                            type="button"
                            className="live-status-error-close"
                            onClick={onDismissError}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveStatusPanel;