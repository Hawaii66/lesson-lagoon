"use client";

import { Button } from "@/components/ui/button";
import { UserButton, UserProfile, useUser } from "@clerk/nextjs";
import React from "react";

function page() {
  const { user } = useUser();

  return (
    <div>
      <h1>Account - {user?.primaryEmailAddress?.emailAddress || ""}</h1>
      <UserButton />
    </div>
  );
}

export default page;
