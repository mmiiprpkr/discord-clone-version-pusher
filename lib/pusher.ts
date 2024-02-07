import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: "ap1",
  useTLS: true
});

export const pusherClient = new PusherClient(
  "40e123f17c5abf24bc83",
  {
    cluster: "ap1"
  }
);
