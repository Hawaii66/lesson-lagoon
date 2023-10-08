import { AnswerFormat } from "@/interface/Answer";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function Answer({ answer }: { answer: Props["answers"][number] }) {
  return (
    <AccordionItem value={answer.question}>
      <AccordionTrigger>{answer.question}</AccordionTrigger>
      <AccordionContent>{answer.answer}</AccordionContent>
    </AccordionItem>
  );
}

type Props = {
  answers: AnswerFormat[];
};

function Answers({ answers }: Props) {
  return (
    <Accordion
      className="w-full px-4"
      type="multiple"
      defaultValue={answers.map((i) => i.question)}
    >
      {answers.map((answer) => (
        <Answer answer={answer} />
      ))}
    </Accordion>
  );
}

export default Answers;
