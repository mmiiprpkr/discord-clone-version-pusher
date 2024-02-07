import { pusherClient } from "@/lib/pusher";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatPusherProps = {
  RoomKey: string;
  addKey: string;
  updateKey: string;
  queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  }
}

export const useChatPusher = ({
  RoomKey,
  addKey,
  updateKey,
  queryKey
}: ChatPusherProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    pusherClient.subscribe(RoomKey)

    pusherClient.bind(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            })
          }
        });

        return {
          ...oldData,
          pages: newData
        }
      })
    });

    pusherClient.bind(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              items: [message],
            }]
          }
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [
            message,
            ...newData[0].items,
          ]
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      pusherClient.unsubscribe(RoomKey);
      pusherClient.unbind(updateKey);
      pusherClient.unbind(addKey);
    }
  }, [RoomKey, addKey, queryKey, updateKey, queryClient]);
}