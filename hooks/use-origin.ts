import { useEffect, useState } from "react"

export const useOrigin = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  },[]);

  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : ""

  if (!isClient) {
    return null;
  }

  return origin;
}