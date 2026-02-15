import { DiaryEvent } from "@/types";
import { storeEvent } from "./storeEvent";

const events: DiaryEvent[] = [];

export const recordEvent = async (text: string, meta?: any): Promise<DiaryEvent> => {
    const event: DiaryEvent = {
        id: Math.random().toString(36).substring(2, 9),
        raw_text: text,
        source: 'web-client',
        created_at: new Date().toISOString(),
        meta,
    };

    const result = await storeEvent(event);
    console.log('[EventLedger] Recorded new fact:', result);

    try {
        await storeEvent(event);
        console.log('[EventLedger] Fact persisted to AppSync.');
    } catch (err) {
        console.warn('[EventLedger] Failed to persist to AppSync, stored locally only:', err);
    }

    return event;
};


import { getEvents as fetchFromCloud } from "./getEvents";

// ... existing recordEvent code ...

export const getEvents = async (): Promise<DiaryEvent[]> => {
    try {
        const cloudEvents = await fetchFromCloud();
        if (cloudEvents && cloudEvents.length > 0) {
            return cloudEvents;
        }
    } catch (err) {
        console.warn('[EventLedger] Failed to fetch from cloud, returning local cache:', err);
    }
    return [...events];
};

