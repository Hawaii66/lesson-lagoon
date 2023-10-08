"use client";

import Answers from "@/components/answer/Answer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import CopyArray from "@/components/utils/CopyArray";
import { AnswerFormat } from "@/interface/Answer";
import React, { useState } from "react";

function page() {
  const [background, setBackground] = useState("");
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<AnswerFormat[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const analyze = async () => {
    setLoading(true);
    const result = await fetch("/api/analyze/answer", {
      method: "POST",
      body: JSON.stringify({
        text,
        background,
      }),
    });
    const answers = (await result.json()).answers;
    setAnswers(answers);
    setLoading(false);
  };

  return (
    <div className="h-full w-1/2 flex flex-col justify-center items-center gap-4">
      <h1 className="font-bold text-3xl">Answer Questions</h1>
      <h2 className="font-semibold text-2xl">Background information</h2>
      <Textarea
        className="h-16"
        value={background}
        onChange={(e) => setBackground(e.target.value)}
      />
      <Label>What should the AI know about the questions</Label>
      <h2 className="font-semibold text-2xl">Questions</h2>
      <Textarea
        className="h-32"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Label>The questions to be answered</Label>
      <Button variant={"default"} onClick={analyze}>
        Analyze
      </Button>
      {loading ? (
        "Laddar svar..."
      ) : answers.length === 0 ? (
        <></>
      ) : (
        <div className="w-full flex flex-row gap-4 justify-center items-start">
          <Answers answers={answers} />
          <CopyArray data={answers} />
        </div>
      )}
    </div>
  );
}

export default page;
