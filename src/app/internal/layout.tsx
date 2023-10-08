"use client";

import { Button } from "@/components/ui/button";
import { ClerkLoaded, ClerkLoading, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function layout({ children }: Props) {
  const { signOut } = useClerk();
  const router = useRouter();

  const logout = () => {
    signOut();
    router.push("/");
  };

  return (
    <>
      <ClerkLoading>
        <div className="w-screen h-screen flex justify-center items-center ">
          <h1 className="text-3xl font-semibold">Laddar profil...</h1>
          <div className="absolute right-0 bottom-0 p-4">
            <Button onClick={() => logout()} variant={"destructive"}>
              Sign out
            </Button>
          </div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </>
  );
}

export default layout;
