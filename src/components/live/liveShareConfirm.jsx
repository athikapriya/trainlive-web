function LiveShareConfirm({ train, onConfirm, onCancel, isStarting = false }) {
    if (!train) {
        return null;
    }

    return (
        <div className="live-confirm-backdrop">
            <section className="live-confirm" role="dialog" aria-modal="true" aria-labelledby="live-confirm-title">
                <div className="live-confirm-icon">
                    <span className="live-confirm-dot" />
                </div>

                <div className="live-confirm-content">
                    <h2 id="live-confirm-title">Share your live location?</h2>

                    <p>Are you currently on this train?</p>

                    <div className="live-confirm-train">
                        <span className="live-confirm-train-number">{train.number}</span>

                        <div className="live-confirm-train-info">
                            <strong>{train.name}</strong>

                            {train.name_bn && <span>{train.name_bn}</span>}
                        </div>

                        <span className="live-confirm-direction">{train.direction}</span>
                    </div>

                    <p className="live-confirm-note">
                        Your location will be shared with TrainLive users while you are sharing your journey.
                    </p>
                </div>

                <div className="live-confirm-actions">
                    <button type="button" className="live-confirm-cancel" onClick={onCancel} disabled={isStarting}>
                        Cancel
                    </button>

                    <button type="button" className="live-confirm-submit" onClick={onConfirm} disabled={isStarting}>
                        {isStarting ? "Starting..." : "Yes, I'm on this train"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default LiveShareConfirm;