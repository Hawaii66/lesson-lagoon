import { Textract } from "@aws-sdk/client-textract";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
var pdf2png = require("pdf2png-mp");

export const What = async (file: File) => {
  const computerVisionKey =
    process.env["computerVisionKey"] || "<computerVisionKey>";
  const computerVisionEndPoint =
    process.env["computerVisionEndPoint"] || "<computerVisionEndPoint>";
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(
    computerVisionKey
  );
  const client = new ComputerVisionClient(
    cognitiveServiceCredentials,
    computerVisionEndPoint
  );

  await new Promise((res) => {
    pdf2png.convert(file, (t: any) => {
      console.log(t);
      res(undefined);
    });
  });

  //const what = await client.recognizePrintedText(true, encodeed);
  /*console.log(
    what.regions?.map((i) =>
      i.lines?.map((i) => i.words?.map((i) => i.text).join(" "))?.join(" ")
    )
  );*/

  return;

  /*const textract = new AWS.Textract({
    region: "us-west-2",
  });
  const textract = new Textract({
    region: "us-west-2",
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  console.log(file.type);
  const res = await textract.detectDocumentText({
    Document: {
      Bytes: buffer,
    },
  });

  console.log(res);*/
};
