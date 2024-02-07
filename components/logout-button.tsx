"use client";

import { useClerk } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter();
  return (
    <Button
      size="icon"
      className="md:hidden"
      onClick={() => signOut(() => router.push("/"))}
    >
      <LogOut className="h-4 w-4"/>
    </Button>
  )
}