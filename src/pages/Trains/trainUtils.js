/* =========================================================
   Train time helpers
========================================================= */
function getTimeParts(timeString) {
    if (!timeString) {
        return null;
    }

    const parts = String(timeString).split(":");

    if (parts.length < 2) {
        return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2] || 0);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
        return null;
    }

    return {
        hours,
        minutes,
        seconds,
    };
}

/* =========================================================
   Date helpers
========================================================= */
function startOfDay(date) {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
}

function createDateWithTime(date, timeString) {
    const parts = getTimeParts(timeString);

    if (!parts) {
        return null;
    }

    const result = new Date(date);

    result.setHours(parts.hours, parts.minutes, parts.seconds, 0);

    return result;
}

/* =========================================================
   Weekday / off-day
========================================================= */

export function isOffDay(train, date) {
    if (!train?.off_day) {
        return false;
    }

    const dayName = date
        .toLocaleDateString("en-US", {
            weekday: "long",
        })
        .trim()
        .toLowerCase();

    return String(train.off_day).trim().toLowerCase() === dayName;
}

/* =========================================================
   Journey window
=========================================================

   The service date is the date on which the train starts
   from its origin station.

   Overnight stops are moved to the following calendar day
   when their scheduled time is earlier than the origin
   departure time.
========================================================= */

export function getJourneyWindowForDate(train, serviceDate) {
    const stops = Array.isArray(train?.stops)
        ? [...train.stops].sort((a, b) => Number(a.stop_order) - Number(b.stop_order))
        : [];

    if (!stops.length) {
        return null;
    }

    const originStop = stops[0];

    if (!originStop?.scheduled_departure) {
        return null;
    }

    const originParts = getTimeParts(originStop.scheduled_departure);

    if (!originParts) {
        return null;
    }

    const journeyStart = createDateWithTime(serviceDate, originStop.scheduled_departure);

    if (!journeyStart) {
        return null;
    }

    let journeyEnd = journeyStart;

    let lastStopArrival = null;

    for (const stop of stops) {
        const scheduledTimes = [stop.scheduled_arrival, stop.scheduled_departure];

        for (const timeString of scheduledTimes) {
            if (!timeString) {
                continue;
            }

            const timeParts = getTimeParts(timeString);

            if (!timeParts) {
                continue;
            }

            const stopDate = new Date(serviceDate);

            const isNextDay =
                timeParts.hours < originParts.hours ||
                (timeParts.hours === originParts.hours && timeParts.minutes < originParts.minutes) ||
                (timeParts.hours === originParts.hours &&
                    timeParts.minutes === originParts.minutes &&
                    timeParts.seconds < originParts.seconds);

            if (isNextDay) {
                stopDate.setDate(stopDate.getDate() + 1);
            }

            const scheduledDateTime = createDateWithTime(stopDate, timeString);

            if (scheduledDateTime && scheduledDateTime > journeyEnd) {
                journeyEnd = scheduledDateTime;
            }
        }

        /*
         * Completion should preferably be based on the
         * LAST STOP'S ARRIVAL, not simply the maximum time.
         */
        if (stop.scheduled_arrival) {
            const arrivalParts = getTimeParts(stop.scheduled_arrival);

            if (arrivalParts) {
                const arrivalDate = new Date(serviceDate);

                const isNextDay =
                    arrivalParts.hours < originParts.hours ||
                    (arrivalParts.hours === originParts.hours && arrivalParts.minutes < originParts.minutes) ||
                    (arrivalParts.hours === originParts.hours &&
                        arrivalParts.minutes === originParts.minutes &&
                        arrivalParts.seconds < originParts.seconds);

                if (isNextDay) {
                    arrivalDate.setDate(arrivalDate.getDate() + 1);
                }

                const arrivalDateTime = createDateWithTime(arrivalDate, stop.scheduled_arrival);

                if (arrivalDateTime) {
                    lastStopArrival = arrivalDateTime;
                }
            }
        }
    }

    /*
     * Fallback to journeyEnd if the last stop has no
     * scheduled arrival.
     */
    const scheduledCompletion = lastStopArrival || journeyEnd;

    return {
        serviceDate,
        journeyStart,
        journeyEnd,
        lastStopArrival,
        scheduledCompletion,
    };
}

/* =========================================================
   Current journey
========================================================= */

export function getCurrentJourney(train, now) {
    const today = startOfDay(now);

    /*
     * IMPORTANT:
     *
     * Today's off day takes priority.
     *
     * We deliberately return null here instead of looking
     * at yesterday's overnight journey.
     *
     * This prevents:
     *
     * Friday + off_day Friday
     *        ↓
     * yesterday journey
     *        ↓
     * "Journey completed"
     *
     * from ever happening.
     */
    if (isOffDay(train, today)) {
        return null;
    }

    const todayJourney = getJourneyWindowForDate(train, today);

    if (todayJourney) {
        if (now < todayJourney.journeyStart) {
            return {
                ...todayJourney,
                state: "SCHEDULED",
            };
        }

        if (now >= todayJourney.journeyStart) {
            return {
                ...todayJourney,
                state: "ACTIVE",
            };
        }
    }

    /*
     * Check yesterday only for a possible overnight journey.
     *
     * This is useful when a train starts late yesterday and
     * its final stop is after midnight.
     */
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    if (isOffDay(train, yesterday)) {
        return null;
    }

    const yesterdayJourney = getJourneyWindowForDate(train, yesterday);

    if (!yesterdayJourney) {
        return null;
    }

    const isOvernight = yesterdayJourney.journeyEnd > yesterdayJourney.journeyStart;

    if (isOvernight && now >= yesterdayJourney.journeyStart && now < yesterdayJourney.journeyEnd) {
        return {
            ...yesterdayJourney,
            state: "ACTIVE",
        };
    }

    return null;
}

/* =========================================================
   Completion ETA
========================================================= */

export function getCompletionEta(train) {
    if (!train?.completion_eta) {
        return null;
    }

    const eta = new Date(train.completion_eta);

    if (Number.isNaN(eta.getTime())) {
        return null;
    }

    return eta;
}

/* =========================================================
   Delay
========================================================= */

function getDelayMinutes(train) {
    if (typeof train?.delay_minutes !== "number" || !Number.isFinite(train.delay_minutes)) {
        return null;
    }

    return train.delay_minutes;
}

/* =========================================================
   Display status
========================================================= */

export function getTrainDisplayStatus(train, now = new Date()) {
    const today = startOfDay(now);

    /*
     * =====================================================
     * 1. OFF DAY MUST ALWAYS WIN
     * =====================================================
     */
    if (isOffDay(train, today)) {
        return {
            status: "OFF_DAY",
            label: "Off day",
            secondaryLabel: "No scheduled journey today",
            delayMinutes: null,
            journeyStart: null,
            completionEta: null,
        };
    }

    const journey = getCurrentJourney(train, now);

    /*
     * completion_eta comes from the latest live report
     * when available.
     */
    const completionEta = getCompletionEta(train);

    /*
     * =====================================================
     * 2. SCHEDULED
     * =====================================================
     */
    if (journey?.state === "SCHEDULED") {
        return {
            status: "SCHEDULED",
            label: "Scheduled",
            secondaryLabel: null,
            delayMinutes: null,
            journeyStart: journey.journeyStart,
            completionEta: completionEta || journey.scheduledCompletion || journey.journeyEnd,
        };
    }

    /*
     * If there is no current journey, don't manufacture
     * "completed" from an old completion_eta.
     */
    if (!journey) {
        return {
            status: "SCHEDULED",
            label: "Scheduled",
            secondaryLabel: null,
            delayMinutes: null,
            journeyStart: null,
            completionEta: null,
        };
    }

    /*
     * =====================================================
     * 3. DETERMINE ACTUAL COMPLETION TIME
     * =====================================================
     */
    const effectiveCompletionEta =
        completionEta || journey.scheduledCompletion || journey.lastStopArrival || journey.journeyEnd;

    /*
     * =====================================================
     * 4. COMPLETED
     * =====================================================
     */
    if (effectiveCompletionEta && now >= effectiveCompletionEta) {
        return {
            status: "COMPLETED",
            label: "Journey completed",
            secondaryLabel: completionEta ? "Based on latest report ETA" : "Scheduled arrival time passed",
            delayMinutes: null,
            journeyStart: journey.journeyStart,
            completionEta: effectiveCompletionEta,
        };
    }

    /*
     * =====================================================
     * 5. ACTIVE — DELAYED
     * =====================================================
     */
    const delayMinutes = getDelayMinutes(train);

    if (delayMinutes !== null && delayMinutes > 0) {
        return {
            status: "DELAYED",
            label: "Delayed",
            secondaryLabel: null,
            delayMinutes,
            journeyStart: journey.journeyStart,
            completionEta: effectiveCompletionEta,
        };
    }

    /*
     * =====================================================
     * 6. ACTIVE — ON TIME
     * =====================================================
     */
    return {
        status: "ON_TIME",
        label: "On time",
        secondaryLabel: null,
        delayMinutes: delayMinutes ?? 0,
        journeyStart: journey.journeyStart,
        completionEta: effectiveCompletionEta,
    };
}

/* =========================================================
   Sorting
========================================================= */
export function getJourneyGroup(status) {
    switch (status) {
        case "ON_TIME":
        case "DELAYED":
            return 1;

        case "SCHEDULED":
            return 2;

        case "COMPLETED":
            return 3;

        case "OFF_DAY":
            return 4;

        default:
            return 5;
    }
}

export function sortTrainsByJourneyStart(trains) {
    return [...trains].sort((a, b) => {
        const groupA = getJourneyGroup(a.displayStatus.status);

        const groupB = getJourneyGroup(b.displayStatus.status);

        if (groupA !== groupB) {
            return groupA - groupB;
        }

        const startA = a.displayStatus.journeyStart;
        const startB = b.displayStatus.journeyStart;

        if (!startA && !startB) {
            return 0;
        }

        if (!startA) {
            return 1;
        }

        if (!startB) {
            return -1;
        }

        return startA.getTime() - startB.getTime();
    });
}