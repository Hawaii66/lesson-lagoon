"use client";

import { Button } from "@/components/ui/button";
import { UserButton, UserProfile, useUser } from "@clerk/nextjs";
import React from "react";

function page() {
  const { user } = useUser();

  const t = async () => {
    const j = await fetch(`/api/`);
    console.log(await j.json());
  };
  return (
    <div>
      <h1>Account - {user?.primaryEmailAddress?.emailAddress || ""}</h1>
      <Button onClick={t}>Click </Button>
      <UserButton />
    </div>
  );
}

export default page;
