const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = process.argv[2] || '/workspaces/default/code/src/imports/CEDA_Capstone_2026__2_-1.pdf';

async function extractText() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();

    console.log(result.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

extractText();
