import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PdfParse from 'pdf-parse';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class ExtraiService {

  constructor(private http: HttpClient) { }


  async extractJsonFromPdf(pdfFile: File): Promise<string> {
    var article: string = ""
    pdfFile.arrayBuffer().then(async (pdfBuffer) => {
      const pdf = await PdfParse(Buffer.from(pdfBuffer))
      article = pdf.text
    })
    return article;
} 

  reduceTextLength(maxToken: number, currentToken: number, text: string): string {
    const ratioToken = (maxToken / currentToken) - 0.05
    const textReduced = text.slice(0, Math.ceil(text.length * ratioToken))
    console.log("Tamanho do texto reduzido para " + (ratioToken*100)+ "%")
    return textReduced
  }
}
