export type EventCategory = 'media' | 'meal' | 'expense' | 'todo' | 'work' | 'learning' | 'admin' | 'decision' | 'other';

export interface ExtractedMetadata {
    category: EventCategory;
    tags: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';

    // Category specific fields
    expense?: {
        amount: number;
        currency: string;
    };
    todo?: {
        status: 'open' | 'completed';
        deadline?: string;
    };
    work?: {
        project?: string;
        hours?: number;
    };
    media?: {
        type: 'game' | 'book' | 'podcast' | 'movie' | 'show' | 'episode' | 'series' | 'album' | 'track' | 'podcast' | 'podcast-episode' | 'podcast-series' | 'podcast-show';
        rating?: number;
        genre?: string;
        release_date?: string;
        duration?: string;
        platform?: string;
    };
    decision?: {
        rationale?: string;
        outcome?: string;
    };
}

export interface DiaryEventWithMetadata {
    event_id: string;
    raw_text: string;
    metadata: ExtractedMetadata;
}
