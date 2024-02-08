import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: "1753198",
  key: "40e123f17c5abf24bc83",
  secret: "9df3e8496f9d2cfb4669",
  cluster: "ap1",
  useTLS: true
});

export const pusherClient = new PusherClient(
  "40e123f17c5abf24bc83",
  {
    cluster: "ap1"
  }
);
