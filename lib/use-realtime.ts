"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Subscribe to real-time changes on a Supabase table,
 * filtered by a column value. Calls `onUpdate` for any change.
 */
export function useRealtimeSubscription(
    table: string,
    filterColumn: string,
    filterValue: string | null,
    onUpdate: () => void
) {
    useEffect(() => {
        if (!filterValue) return;

        const supabase = createClient();
        const channel = supabase
            .channel(`${table}-${filterValue}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table,
                    filter: `${filterColumn}=eq.${filterValue}`,
                },
                () => {
                    onUpdate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table, filterColumn, filterValue]);
}
