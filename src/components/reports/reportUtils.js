export function getEventLabel(eventType) {
    switch (eventType) {
        case "ARRIVED":
            return "Arrived";
        case "DEPARTED":
            return "Departed";
        case "PASSED":
            return "Passed";
        case "UPDATE":
            return "Update";
        default:
            return eventType;
    }
}

export function getEventClass(eventType, styles) {
    switch (eventType) {
        case "ARRIVED":
            return styles.arrived;
        case "DEPARTED":
            return styles.departed;
        case "PASSED":
            return styles.passed;
        default:
            return styles.update;
    }
}

export function getDelayInfo(report, styles) {
    const delayMinutes = Number(report.delay_minutes || 0);

    if (delayMinutes <= 0) {
        return {
            label: "On time",
            className: styles.onTime,
        };
    }

    if (delayMinutes < 45) {
        return {
            label: report.delay_display,
            className: styles.mediumDelay,
        };
    }

    return {
        label: report.delay_display,
        className: styles.highDelay,
    };
}