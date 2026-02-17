import { DiaryEvent } from "@/types";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

export const storeEvent = async (event: DiaryEvent, token?: string) => {
    console.log('[AppSync Request] storeEvent:', {
        endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
        hasToken: !!token,
        event: {
            source: event.source,
            created_at: event.created_at,
            raw_text_preview: event.raw_text.substring(0, 50) + '...'
        }
    });

    // 1. Create apollo client
    // 1.a create new link for apollo client from env variable NEXT_PUBLIC_APPSYNC_ENDPOINT
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = token;
    } else {
        headers['x-api-key'] = process.env.APPSYNC_API_KEY || '';
    }

    const link = new HttpLink({
        uri: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
        headers
    });

    // 1.b create new cache
    const cache = new InMemoryCache();

    // 1.c create new client
    const client = new ApolloClient({
        link,
        cache,
    });

    // 2. Create mutation
    const LOG_DIARY_EVENT = gql`
        mutation logDiaryEvent($logDiaryEventInput: LogDiaryEventInput!) {
            logDiaryEvent(input: $logDiaryEventInput) {
                eventtimeid
                user
                raw_text
                source
                created_at
            }
        }
    `;

    // 3. Execute mutation
    try {
        const result = await client.mutate<{ logDiaryEvent: any }>({
            mutation: LOG_DIARY_EVENT,
            variables: {
                logDiaryEventInput: {
                    raw_text: event.raw_text,
                    source: event.source,
                    created_at: event.created_at,
                }
            }
        });

        console.log('[AppSync Response] storeEvent success:', result.data?.logDiaryEvent);

        // 4. Return result
        return result.data?.logDiaryEvent;
    } catch (error: any) {
        console.error('[AppSync Error] storeEvent failed:', {
            message: error.message,
            networkError: error.networkError,
            graphQLErrors: error.graphQLErrors,
            stack: error.stack
        });
        throw error;
    }
};