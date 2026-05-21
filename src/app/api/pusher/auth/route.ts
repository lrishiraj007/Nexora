import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const text = await req.text();
    const params = new URLSearchParams(text);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      return new Response("Missing socket_id or channel_name", { status: 400 });
    }

    let authResponse;
    if (channelName.startsWith("presence-")) {
      const userData = {
        user_id: session.user.id,
        user_info: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
      };
      authResponse = pusherServer.authorizeChannel(socketId, channelName, userData);
    } else {
      authResponse = pusherServer.authorizeChannel(socketId, channelName);
    }

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher Auth Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
