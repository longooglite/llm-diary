import { DiaryEvent } from "@/types";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

export const getEvents = async (token?: string): Promise<DiaryEvent[]> => {
    console.log('[AppSync Request] getEvents:', {
        endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
        hasToken: !!token
    });

    // 1. Create new apollo client
    // 1.a create a new link from env variable NEXT_PUBLIC_APPSYNC_ENDPOINT
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

    // 1.b create a new cache
    const cache = new InMemoryCache();

    // 1.c create a new client
    const client = new ApolloClient({
        link,
        cache,
    });

    // 2. Create query
    const GET_DIARY_EVENTS = gql`
        query getDiaryEvents {
            getDiaryEvents {
                eventtimeid
                user
                raw_text
                source
                created_at
            }
        }
    `;

    // 3. Execute query
    try {
        const result = await client.query<{ getDiaryEvents: any[] }>({
            query: GET_DIARY_EVENTS,
            fetchPolicy: 'no-cache', // Ensure we get fresh data from the ledger
        });

        console.log('[AppSync Response] getEvents success:', result.data?.getDiaryEvents?.length || 0, 'events');

        // 4. Return result
        return (result.data?.getDiaryEvents || []).map(item => ({
            id: item.eventtimeid,
            raw_text: item.raw_text,
            source: item.source,
            created_at: item.created_at,
            meta: {} // Placeholder or map other fields if they exist
        }));
    } catch (error: any) {
        console.error('[AppSync Error] getEvents failed:', {
            message: error.message,
            networkError: error.networkError,
            graphQLErrors: error.graphQLErrors,
            stack: error.stack
        });
        return [];
    }
};