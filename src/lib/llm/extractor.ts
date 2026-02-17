import fs from 'fs';
import path from 'path';
import { callClaude } from './claudeClient';
import { DiaryEvent } from '@/types';
import { DiaryEventWithMetadata } from './schema';

const promptPath = path.join(process.cwd(), 'src/lib/llm/prompts/extraction.md');

export const extractMetadata = async (events: DiaryEvent[]): Promise<DiaryEventWithMetadata[]> => {
    if (events.length === 0) return [];

    const systemPrompt = fs.readFileSync(promptPath, 'utf8');

    const userPrompt = `
Extract metadata for the following events:
${JSON.stringify(events, null, 2)}
    `;

    try {
        const responseText = await callClaude(systemPrompt, userPrompt);

        // Clean response text in case Claude adds markdown markers
        const jsonText = responseText.replace(/```json\n?/, '').replace(/\n?```/, '').trim();

        const extracted = JSON.parse(jsonText);

        // Map back to our structure ensuring IDs match
        return events.map((event, index) => ({
            event_id: event.created_at, // Assuming created_at as a fallback ID for now if id is missing
            raw_text: event.raw_text,
            metadata: extracted[index] || { category: 'other', tags: [] }
        }));
    } catch (error) {
        console.error('[Extractor] Failed to extract metadata:', error);
        return events.map(event => ({
            event_id: event.created_at,
            raw_text: event.raw_text,
            metadata: { category: 'other', tags: [] }
        }));
    }
};
