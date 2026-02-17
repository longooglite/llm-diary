import fs from 'fs';
import path from 'path';
import { callClaude } from './claudeClient';
import { TimeWindow } from './aggregator';

const promptPath = path.join(process.cwd(), 'src/lib/llm/prompts/summarization.md');

export const generateNarrative = async (window: TimeWindow): Promise<string> => {
    if (window.events.length === 0) return '';

    const systemPrompt = fs.readFileSync(promptPath, 'utf8');

    const userPrompt = `
Generate a ${window.type} summary for ${window.id}.

Events:
${JSON.stringify(window.events, null, 2)}
    `;

    try {
        const narrative = await callClaude(systemPrompt, userPrompt);
        return narrative.trim();
    } catch (error) {
        console.error('[Summarizer] Failed to generate narrative:', error);
        return `Default Summary for ${window.id}: Error during generation.`;
    }
};
