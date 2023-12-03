import fs from "fs";
const PDFDocument = require("pdf-lib").PDFDocument;

export class PDFLib {
  pdf: File;
  constructor(pdf: File) {
    this.pdf = pdf;
  }

  async split(count: number): Promise<Blob[]> {
    const bytes = await this.pdf.arrayBuffer();

    const pdfDoc = await PDFDocument.load(bytes);

    const numberOfPages = pdfDoc.getPages().length;

    const files: Blob[] = [];

    for (let i = 0; i < numberOfPages; i += count) {
      const subDocument = await PDFDocument.create();
      const indexes = Array.from({ length: count })
        .map((_, j) => j + i)
        .filter((i) => i < numberOfPages);
      const pages = await subDocument.copyPages(pdfDoc, indexes);
      console.log(indexes, numberOfPages);

      await subDocument.addPage(pages[0]);
      console.log("page");
      const pdfBytes = await subDocument.save();
      console.log(pdfBytes);
      const pdfUint8Array = new Uint8Array(pdfBytes);
      const blob = new Blob([pdfUint8Array], { type: "application/pdf" });
      files.push(blob);
    }
    console.log("What");

    return files;
  }
}
