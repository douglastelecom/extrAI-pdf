import pdfjsLib from 'pdfjs-dist';
import PDFJSWorker from "pdfjs-dist/build/pdf.worker";
import { Injectable } from '@angular/core';
import PdfParse from 'pdf-parse';
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  extractValuesFromErrorMaximumContent(errorMessage: any) {
    const regex = /This model's maximum context length is (\d+) tokens\. However, your messages resulted in (\d+) tokens\./;
    const match = errorMessage.match(regex);
    if (!match || match.length < 3) {
        throw new Error('Erro ao extrair valores da mensagem de erro');
    }
    const maxContextLength = parseInt(match[1], 10);
    const resultedTokens = parseInt(match[2], 10);
    return { maxContextLength, resultedTokens };
}

reduceTextLength(maxToken: number, currentToken: number, text: string) {
    const ratioToken = (maxToken / currentToken) - 0.05
    const textReduced = text.slice(0, Math.ceil(text.length * ratioToken))
    console.log("Tamanho do texto reduzido para " + (ratioToken*100)+ "%")
    return textReduced
}

async extractTextFromFile(file: File): Promise<string> {
  try{
    debugger
    var pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise
    debugger
    const page = await pdf.getPage(1)
    debugger
    const tokenizedText = await page.getTextContent();
    debugger
    const pageText = tokenizedText.items.map(token => token).join("");
    debugger
    return pageText;
  }catch(error: any){
    console.log(error)
    return "fsdfsd"
  }
}

}
