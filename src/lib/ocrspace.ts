import fs from "fs";

export class OCRSpace {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async parseFile(file: Blob) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("apikey", this.apiKey);
    formData.append("filetype", "PDF");
    console.log(formData);

    const response = await fetch(`https://api.ocr.space/parse/image`, {
      method: "POST",
      body: formData,
    });

    console.log(response.status);
    if (response.status === 200) {
      const t = await response.json();
      console.log(t);
    }
  }
}
