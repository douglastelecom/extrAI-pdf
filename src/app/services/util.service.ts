import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker";
import { Injectable } from '@angular/core';
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
    const buffer = await file.arrayBuffer()
    debugger
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
    debugger
    var pdf = pdfjsLib.getDocument(buffer).promise.then((pdf) => {debugger; console.log(pdf)})
    // debugger
    // const page = await pdf.getPage(1)
    // const tokenizedText = await page.getTextContent();
    // const pageText = tokenizedText.items.map(token => token).join("");
    // console.log(pageText)
    // return pageText;
    return "fsdfsd"
  }catch(error: any){
    debugger
    console.log(error)
    return "fsdfsd"
  }
}

}
