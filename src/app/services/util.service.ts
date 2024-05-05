import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker";
import { Injectable } from '@angular/core';
import { TextContent } from 'pdfjs-dist/types/src/display/api';
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
    const buffer = await file.arrayBuffer()
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
    var pdf = await pdfjsLib.getDocument(buffer).promise
    const numPages = pdf.numPages
    var text: any = ""
    for(let i = 1; i<=numPages; i++){
      var page = await pdf.getPage(i)
      var textContent = await page.getTextContent()
      textContent.items.forEach((item: any) => {
        text = text + " " + item.str
      });
    }
    return text
}

}
