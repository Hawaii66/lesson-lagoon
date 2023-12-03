"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

function Page() {
  const [file, setFile] = useState<File>();

  const submit = async () => {
    if (!file) {
      return;
    }

    const data = new FormData();
    data.set("file", file);

    const result = await fetch("/api/ocr", {
      method: "POST",
      body: data,
    });

    console.log(result);
  };

  return (
    <div>
      <Input type="file" onChange={(e) => setFile(e.target.files![0])} />
      <Button onClick={submit}>Submit</Button>
    </div>
  );
}

export default Page;
