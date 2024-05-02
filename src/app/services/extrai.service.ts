import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PdfParse from 'pdf-parse';
import { OpenaiService } from './openai.service';
import { FormOpenai } from '../types/openaiBody.interface';
import { FormMongo } from '../types/mongoBody.interface';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class ExtraiService {

  constructor(private http: HttpClient, private openaiService: OpenaiService, private utilService: UtilService) { }

  async extractData(formOpenai: FormOpenai, formMongo: FormMongo, article: string, useMongo: boolean): Promise<any>{
    try {
      // const article = await this.extractTextFromFile(file)
      this.openaiService.setMessagesForExtraction(formOpenai, article)
      return await this.openaiService.completion(formOpenai, formOpenai.apiKey!)
    } catch (error: any) {
      if (error.message.substring(0, 10) === "Rate limit") {
        const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await pause(30000);
        return await this.extractData(formOpenai, formMongo, article, useMongo)
      } else if (error.message.substring(0, 20) === "This model's maximum") {
        var { maxContextLength, resultedTokens } = this.openaiService.extractValuesFromErrorMaximumContent(error.message)
        if ((maxContextLength / resultedTokens) < 0.75) {
          throw new Error("Arquivo muito grande.")
        } else {
          article = this.utilService.reduceTextLength(maxContextLength, resultedTokens, article)
          return await this.extractData(formOpenai, formMongo, article, useMongo)
        }
      }
    }
  }

  async extractTextFromFile(file: File): Promise<string> {
    var article: string = ""
    file.arrayBuffer().then(async (pdfBuffer) => {
      const pdf = await PdfParse(Buffer.from(pdfBuffer))
      article = pdf.text
    })
    return article;
  }

  reduceTextLength(maxToken: number, currentToken: number, text: string): string {
    const ratioToken = (maxToken / currentToken) - 0.05
    const textReduced = text.slice(0, Math.ceil(text.length * ratioToken))
    console.log("Tamanho do texto reduzido para " + (ratioToken * 100) + "%")
    return textReduced
  }
}
