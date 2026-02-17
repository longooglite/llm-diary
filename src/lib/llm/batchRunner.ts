import { extractMetadata } from './extractor';
import { groupEventsByDay, groupEventsByWeek } from './aggregator';
import { generateNarrative } from './summarizer';
import { writeArtifact } from './artifactWriter';
import { getEvents } from '../getEvents';

export const runFullBatchProcess = async () => {
    console.log('[BatchRunner] Starting full processing loop...');

    // 1. Fetch raw events
    const rawEvents = await getEvents();
    if (rawEvents.length === 0) {
        console.log('[BatchRunner] No events to process.');
        return;
    }

    // 2. Extract structured metadata
    console.log(`[BatchRunner] Extracting metadata for ${rawEvents.length} events...`);
    const eventsWithMetadata = await extractMetadata(rawEvents);

    // 3. Group by Day
    console.log('[BatchRunner] Aggregating into daily windows...');
    const dailyWindows = groupEventsByDay(eventsWithMetadata);

    // 4. Summarize and Write Daily Artifacts
    for (const window of dailyWindows) {
        console.log(`[BatchRunner] Summarizing day: ${window.id}`);
        const narrative = await generateNarrative(window);
        writeArtifact('daily', window.id, narrative);
    }

    // 5. Group by Week (Optional: could also do monthly)
    console.log('[BatchRunner] Aggregating into weekly windows...');
    const weeklyWindows = groupEventsByWeek(eventsWithMetadata);
    for (const window of weeklyWindows) {
        console.log(`[BatchRunner] Summarizing week: ${window.id}`);
        const narrative = await generateNarrative(window);
        writeArtifact('weekly', window.id, narrative);
    }

    console.log('[BatchRunner] Batch processing complete.');
};
