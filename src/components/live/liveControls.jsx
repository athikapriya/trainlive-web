import { useEffect, useState } from "react";

import { CiStreamOn } from "react-icons/ci";
import { TbLiveView } from "react-icons/tb";

import LiveTrainPicker from "./liveTrainPicker";
import LiveShareConfirm from "./liveShareConfirm";
import LiveStatusPanel from "./liveStatusPanel";

function LiveControls({
    isAuthenticated,
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
    liveAction,
    onLiveActionHandled,
    onShowLive,
    onStopLive,
    onShareLive,
    onStopSharing,
    onRequireAuth,
}) {
    const [pickerMode, setPickerMode] = useState(null);
    const [confirmTrain, setConfirmTrain] = useState(null);
    const [dismissedError, setDismissedError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || (liveAction !== "show" && liveAction !== "share")) {
            return;
        }

        if (isSharing || isStarting) {
            return;
        }

        setConfirmTrain(null);
        setPickerMode(liveAction);

        onLiveActionHandled();
    }, [isAuthenticated, isSharing, isStarting, liveAction, onLiveActionHandled]);

    useEffect(() => {
        const currentError = liveError || sharingError;

        if (currentError) {
            setDismissedError(null);
        }
    }, [liveError, sharingError]);

    const handleShowLiveClick = () => {
        if (!isAuthenticated) {
            onRequireAuth("show");
            return;
        }

        if (isSharing || isStarting) {
            return;
        }

        setConfirmTrain(null);
        setPickerMode("show");
    };

    const handleShareLiveClick = () => {
        if (!isAuthenticated) {
            onRequireAuth("share");
            return;
        }

        if (isSharing || isStarting) {
            return;
        }

        setConfirmTrain(null);
        setPickerMode("share");
    };

    const handleTrainSelect = (train) => {
        setPickerMode(null);

        if (pickerMode === "show") {
            onShowLive(train);
            return;
        }

        if (pickerMode === "share") {
            setConfirmTrain(train);
        }
    };

    const handleConfirmShare = async () => {
        if (!confirmTrain || isStarting) {
            return;
        }

        const train = confirmTrain;

        setConfirmTrain(null);

        await onShareLive(train);
    };

    const handleCancelConfirmation = () => {
        if (isStarting) {
            return;
        }

        setConfirmTrain(null);
    };

    const handleDismissError = () => {
        setDismissedError(liveError || sharingError);
    };

    const visibleLiveError = liveError && dismissedError !== liveError ? liveError : null;

    const visibleSharingError = sharingError && dismissedError !== sharingError ? sharingError : null;

    return (
        <>
            <div className="live-controls">
                <button
                    type="button"
                    className={`live-control ${showLive ? "active" : ""}`}
                    onClick={showLive ? onStopLive : handleShowLiveClick}
                    disabled={isStopping}
                >
                    <TbLiveView className="live-control-icon" />

                    <span>{showLive ? `Live ${liveTrainNumber}` : "Show Live"}</span>
                </button>

                <button
                    type="button"
                    className={`live-control ${isSharing ? "active sharing" : ""}`}
                    onClick={isSharing ? onStopSharing : handleShareLiveClick}
                    disabled={isStarting || isStopping}
                >
                    <CiStreamOn className="live-control-icon" />

                    <span>{isSharing ? `Sharing ${sharingTrainNumber}` : "Share Live"}</span>
                </button>
            </div>

            <LiveStatusPanel
                showLive={showLive}
                liveTrainNumber={liveTrainNumber}
                liveCount={liveCount}
                isLiveLoading={isLiveLoading}
                liveError={visibleLiveError}
                isSharing={isSharing}
                sharingTrainNumber={sharingTrainNumber}
                isStarting={isStarting}
                isStopping={isStopping}
                sharingError={visibleSharingError}
                lastLocation={lastLocation}
                onStopLive={onStopLive}
                onStopSharing={onStopSharing}
                onDismissError={handleDismissError}
            />

            {pickerMode && (
                <LiveTrainPicker mode={pickerMode} onSelect={handleTrainSelect} onClose={() => setPickerMode(null)} />
            )}

            {confirmTrain && (
                <LiveShareConfirm
                    train={confirmTrain}
                    onConfirm={handleConfirmShare}
                    onCancel={handleCancelConfirmation}
                    isStarting={isStarting}
                />
            )}
        </>
    );
}

export default LiveControls;