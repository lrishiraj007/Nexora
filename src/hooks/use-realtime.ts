import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";

export function useRealtime<T = any>(
  channelName: string | null | undefined,
  eventName: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    if (!channelName) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(channelName);
    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
      pusher.unsubscribe(channelName);
    };
  }, [channelName, eventName, callback]);
}
