import { FormOpenai } from './../types/openaiBody.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpenaiService } from './openai.service';
import { UtilService } from './util.service';
import { MongodbService } from './mongodb.service';

@Injectable({
  providedIn: 'root'
})
export class ExtraiService {

  constructor(private http: HttpClient, private openaiService: OpenaiService, private utilService: UtilService, private mongodbService: MongodbService) { }

  async extractData(formOpenai: FormOpenai, file: File): Promise<any>{
      const article = await this.utilService.extractTextFromFile(file)
      if(article.length <= 400){
        throw new Error("Arquivo muito pequeno para extração. Verifique se o arquivo possui caracteres.")
      }
      return await this.openaiService.completion(formOpenai, formOpenai.apiKey!, article)
  }

}
