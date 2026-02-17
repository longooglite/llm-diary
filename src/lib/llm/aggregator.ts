import { format, startOfDay, startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { DiaryEventWithMetadata } from './schema';

export interface TimeWindow {
    type: 'daily' | 'weekly' | 'monthly';
    id: string; // e.g., "2026-02-16", "2026-W07", "2026-02"
    events: DiaryEventWithMetadata[];
}

export const groupEventsByDay = (events: DiaryEventWithMetadata[]): TimeWindow[] => {
    const groups: { [key: string]: DiaryEventWithMetadata[] } = {};

    events.forEach(event => {
        const date = parseISO(event.metadata.todo?.deadline || event.event_id); // Fallback to event_id (timestamp)
        const key = format(startOfDay(date), 'yyyy-MM-dd');
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
    });

    return Object.entries(groups).map(([id, events]) => ({
        type: 'daily',
        id,
        events: events.sort((a, b) => a.event_id.localeCompare(b.event_id))
    }));
};

export const groupEventsByWeek = (events: DiaryEventWithMetadata[]): TimeWindow[] => {
    const groups: { [key: string]: DiaryEventWithMetadata[] } = {};

    events.forEach(event => {
        const date = parseISO(event.event_id);
        const key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-'W'II");
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
    });

    return Object.entries(groups).map(([id, events]) => ({
        type: 'weekly',
        id,
        events: events.sort((a, b) => a.event_id.localeCompare(b.event_id))
    }));
};

export const groupEventsByMonth = (events: DiaryEventWithMetadata[]): TimeWindow[] => {
    const groups: { [key: string]: DiaryEventWithMetadata[] } = {};

    events.forEach(event => {
        const date = parseISO(event.event_id);
        const key = format(startOfMonth(date), 'yyyy-MM');
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
    });

    return Object.entries(groups).map(([id, events]) => ({
        type: 'monthly',
        id,
        events: events.sort((a, b) => a.event_id.localeCompare(b.event_id))
    }));
};
