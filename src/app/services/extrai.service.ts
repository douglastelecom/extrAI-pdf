import { FormOpenai } from './../types/openaiBody.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PdfParse from 'pdf-parse';
import { OpenaiService } from './openai.service';
import { FormMongo } from '../types/mongoBody.interface';
import { UtilService } from './util.service';
import { MongodbService } from './mongodb.service';

@Injectable({
  providedIn: 'root'
})
export class ExtraiService {

  constructor(private http: HttpClient, private openaiService: OpenaiService, private utilService: UtilService, private mongodbService: MongodbService) { }

  async extractData(formOpenai: FormOpenai, file: File): Promise<any>{
      const article = await this.utilService.extractTextFromFile(file)
      this.openaiService.setMessagesForExtraction(formOpenai, article)
      return await this.openaiService.completion(formOpenai, formOpenai.apiKey!, article)
  }

  async testConnections(formOpenai: FormOpenai, useMongo: boolean, formMongo?: FormMongo){
    await this.openaiService.testApi(formOpenai)
    if(useMongo){
      await this.mongodbService.testApi(formMongo!)
    }
  }

}
