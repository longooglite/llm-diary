import { DiaryEvent } from "@/types";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

export const storeEvent = async (event: DiaryEvent) => {
    // 1. Create apollo client
    // 1.a create new link for apollo client from env variable NEXT_PUBLIC_APPSYNC_ENDPOINT
    const link = new HttpLink({
        uri: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
        headers: {
            'x-api-key': process.env.APPSYNC_API_KEY || '',
        }
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
        const { data } = await client.mutate<{ logDiaryEvent: any }>({
            mutation: LOG_DIARY_EVENT,
            variables: {
                logDiaryEventInput: {
                    raw_text: event.raw_text,
                    source: event.source,
                    created_at: event.created_at,
                }
            }
        });

        // 4. Return result
        return data?.logDiaryEvent;
    } catch (error) {
        console.log('[storeEvent] Error persisting to AppSync:', error);
        throw error;
    }
};