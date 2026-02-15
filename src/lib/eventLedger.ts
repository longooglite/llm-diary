export interface DiaryEvent {
    id: string;
    raw_text: string;
    source: string;
    created_at: string;
    meta?: any;
}

const events: DiaryEvent[] = [];

export const recordEvent = async (text: string, meta?: any): Promise<DiaryEvent> => {
    const event: DiaryEvent = {
        id: Math.random().toString(36).substring(2, 9),
        raw_text: text,
        source: 'web-client',
        created_at: new Date().toISOString(),
        meta,
    };

    // Simulate persistent storage (DynamoDB/S3)
    events.push(event);
    console.log('[EventLedger] Recorded new fact:', event);

    return event;
};

export const getEvents = async (): Promise<DiaryEvent[]> => {
    return [...events];
};

// Placeholder for future S3/DynamoDB sync
export const syncToCloud = async () => {
    console.log('[EventLedger] Syncing to cloud...');
};

