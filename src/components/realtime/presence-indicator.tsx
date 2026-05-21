"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PresenceMember {
  id: string;
  name: string;
  image?: string | null;
  email: string;
}

interface PresenceIndicatorProps {
  workspaceId: string;
}

export function PresenceIndicator({ workspaceId }: PresenceIndicatorProps) {
  const [activeMembers, setActiveMembers] = useState<PresenceMember[]>([]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `presence-workspace-${workspaceId}`;
    const channel = pusher.subscribe(channelName) as any;

    const updateMembers = () => {
      const membersList: PresenceMember[] = [];
      channel.members.each((member: any) => {
        membersList.push({
          id: member.id,
          name: member.info.name,
          image: member.info.image,
          email: member.info.email,
        });
      });
      setActiveMembers(membersList);
    };

    channel.bind("pusher:subscription_succeeded", updateMembers);
    channel.bind("pusher:member_added", updateMembers);
    channel.bind("pusher:member_removed", updateMembers);

    return () => {
      channel.unbind("pusher:subscription_succeeded", updateMembers);
      channel.unbind("pusher:member_added", updateMembers);
      channel.unbind("pusher:member_removed", updateMembers);
      pusher.unsubscribe(channelName);
    };
  }, [workspaceId]);

  if (activeMembers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground/80 font-medium hidden sm:inline-block">
        Active now:
      </span>
      <div className="flex -space-x-1.5 overflow-hidden">
        {activeMembers.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger
              render={
                <div className="relative inline-block ring-2 ring-background rounded-full cursor-pointer hover:translate-y-[-2px] hover:z-10 transition-all duration-200">
                  <Avatar className="h-6 w-6 border border-border/40">
                    {member.image ? (
                      <AvatarImage src={member.image} alt={member.name} />
                    ) : null}
                    <AvatarFallback className="text-[9px] bg-violet-500/10 text-violet-500 font-bold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background animate-pulse" />
                </div>
              }
            />
            <TooltipContent>
              <div className="text-xs p-1">
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">{member.email}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
