import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { directMessageId: string }}
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID Missing", { status: 400 });
    }

    if (!params.directMessageId) {
      return new NextResponse("Message ID Missing");
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id
            }
          },
          {
            memberTwo: {
              profileId: profile.id
            }
          }
        ]
      },
      include: {
        memberOne: {
          include: {
            profile: true
          }
        },
        memberTwo: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: params.directMessageId,
        conversationId: conversationId as string
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!directMessage || directMessage.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = directMessage.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!directMessage || directMessage.deleted) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    directMessage = await db.directMessage.update({
      where: {
        id: params.directMessageId,
      },
      data: {
        fileUrl: null,
        content: "This message has been deleted.",
        deleted: true
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    await pusherServer.trigger(conversationId,'chat:update', directMessage);
    
    return NextResponse.json(directMessage, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { directMessageId: string }}
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const { content, fileUrl } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID Missing", { status: 400 });
    }

    if (!params.directMessageId) {
      return new NextResponse("Message ID Missing");
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id
            }
          },
          {
            memberTwo: {
              profileId: profile.id
            }
          }
        ]
      },
      include: {
        memberOne: {
          include: {
            profile: true
          }
        },
        memberTwo: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: params.directMessageId,
        conversationId: conversationId as string
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!directMessage || directMessage.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = directMessage.memberId === member.id;


    if (!isMessageOwner || directMessage.deleted) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    directMessage = await db.directMessage.update({
      where: {
        id: params.directMessageId,
      },
      data: {
        fileUrl: fileUrl,
        content: content,
        deleted: false
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    await pusherServer.trigger(conversationId,'chat:update', directMessage);
    
    return NextResponse.json(directMessage, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

