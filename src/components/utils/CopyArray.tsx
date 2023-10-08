import { Copy } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { useToast } from "../ui/use-toast";

type Props = {
  data: { question: string; answer: string }[];
};

const copyWord = (data: Props["data"]) => {
  const text =
    `<html>
			  <body>
			  <!--StartFragment--><ol>` +
    data
      .map((i) => `<li>${i.question} <ul><li>${i.answer}</li></ul></li>`)
      .join("") +
    `</ol><!--EndFragment-->
			  </body>
			  </html>`;
  const blob = new Blob([text], {
    type: "text/html",
  });

  navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
};

const copySimple = (data: Props["data"]) => {
  const text = data
    .map((i, idx) => `${idx + 1} ${i.question}:\n\t${i.answer}`)
    .join("\n");
  navigator.clipboard.writeText(text);
};

const copyNo = (data: Props["data"]) => {
  const text = data.map((i) => `${i.question}: ${i.answer}`).join("\n");
  navigator.clipboard.writeText(text);
};

function CopyArray({ data }: Props) {
  const { toast } = useToast();
  const copyAnswers = (format: "no" | "simple" | "word") => {
    switch (format) {
      case "no":
        copyNo(data);
        break;
      case "simple":
        copySimple(data);
        break;
      case "word":
        copyWord(data);
        break;
      default:
        const _: never = format;
    }
    toast({
      title: "Copied",
      description: "The answers have been copied to your clipboard",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Button onClick={() => copyAnswers("simple")} variant={"ghost"}>
          <Copy />
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => copyAnswers("no")}>
          Basic format
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copyAnswers("word")}>
          Microsoft Word
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default CopyArray;
