import fs from 'fs';
import { parse } from 'pdf-parse/dist/pdf-parse/esm/index.js';

const pdfPath = process.argv[2] || '/workspaces/default/code/src/imports/CEDA_Capstone_2026__2_-1.pdf';

async function extractText() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await parse(dataBuffer);

    console.log(data.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    process.exit(1);
  }
}

extractText();
