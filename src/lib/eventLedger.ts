import { DiaryEvent } from "@/types";
import { storeEvent } from "./storeEvent";

export const recordEvent = async (text: string, meta?: any): Promise<DiaryEvent> => {
    const event: DiaryEvent = {
        raw_text: text,
        source: 'web-client',
        created_at: new Date().toISOString(),
        meta,
    };

    try {
        const result = await storeEvent(event);
        console.log('[EventLedger] Recorded new fact:', result);
    } catch (err) {
        console.warn('[EventLedger] Failed to persist to AppSync, stored locally only:', err);
    }

    return event;
};
