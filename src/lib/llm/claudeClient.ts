import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || '',
});

export const callClaude = async (system: string, prompt: string) => {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: system,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0, // Deterministic extraction
        });

        if (message.content[0].type === 'text') {
            return message.content[0].text;
        }
        return '';
    } catch (error) {
        console.error('[ClaudeClient] Error calling Claude:', error);
        throw error;
    }
};
