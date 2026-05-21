import PusherClient from "pusher-js";

export const getPusherClient = () => {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    console.warn("Pusher client keys are missing in env vars.");
    return null;
  }

  const globalWindow = window as any;
  if (!globalWindow.pusherClient) {
    globalWindow.pusherClient = new PusherClient(key, {
      cluster,
      forceTLS: true,
      authEndpoint: "/api/pusher/auth",
    });
  }

  return globalWindow.pusherClient as PusherClient;
};
