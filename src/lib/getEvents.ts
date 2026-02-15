import { DiaryEvent } from "@/types";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

export const getEvents = async (): Promise<DiaryEvent[]> => {
    // 1. Create new apollo client
    // 1.a create a new link from env variable NEXT_PUBLIC_APPSYNC_ENDPOINT
    const link = new HttpLink({
        uri: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
        headers: {
            'x-api-key': process.env.APPSYNC_API_KEY || '',
        }
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
        const { data } = await client.query<{ getDiaryEvents: any[] }>({
            query: GET_DIARY_EVENTS,
            fetchPolicy: 'no-cache', // Ensure we get fresh data from the ledger
        });

        // 4. Return result
        return (data?.getDiaryEvents || []).map(item => ({
            id: item.eventtimeid,
            raw_text: item.raw_text,
            source: item.source,
            created_at: item.created_at,
            meta: {} // Placeholder or map other fields if they exist
        }));
    } catch (error) {
        console.log('[getEvents] Error fetching from AppSync:', error);
        return [];
    }
};