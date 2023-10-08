import { openai } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

type AnswerFormat = {
  question: string;
  answer: string;
};

export const POST = async (request: NextRequest) => {
  const { text, background }: { text: string; background: string } =
    await request.json();

  const message = `A person studying something is requesting help with answering some questions. Answer in the same language as the background information is given. The person studying these questions has given this information about the text that will come: ${background}. Here is the questions you should answer: ${text}. Answer the questions with the json format: type AnswerFormat = {
	question:string,
	answer:string
}[]`;

  const result = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const response = result.choices[0].message.content;

  console.log(result);

  return NextResponse.json({
    answers: JSON.parse(response || "[]") as AnswerFormat[],
  });
};
