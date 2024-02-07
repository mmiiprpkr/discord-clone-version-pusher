"use client";

import { pusherClient } from "@/lib/pusher";
import { useEffect, useState } from "react";

export const Test = () => {
  const [IncomingMessage, setIncomingMessage] = useState<string[]>([]);

  console.log("test")
  return (
    <div>
      haha
    </div>
  )
}