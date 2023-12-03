import { OCRSpace } from "@/lib/ocrspace";
import { PDFLib } from "@/lib/pdflib";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { What } from "@/lib/aws/textract";

export const POST = async (request: NextRequest) => {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({}, { status: 400 });
  }

  const t = await What(file);
  return NextResponse.json({ t });

  const files = await new PDFLib(file).split(3);
  console.log(files.length);
  for (var i = 0; i < files.length; i++) {
    const bytes = await files[i].arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(`./split_${i}.pdf`, buffer);
  }

  const ocr = new OCRSpace(process.env.OCR_SPAEC_APIKEY!);
  await ocr.parseFile(files[0]);
};
