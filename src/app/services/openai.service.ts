import { OpenaiBody, Message } from './../types/openaiBody.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import OpenAI from 'openai';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  constructor(private http: HttpClient) { }

  async completion(openaiBody: OpenaiBody){
    const openai = new OpenAI({ apiKey: openaiBody.apiKey })
    return await openai.chat.completions.create()

  }
  
  setMessagesForExtraction(openaiBody: OpenaiBody, article: string){
    openaiBody.messages = [{ role: "system", content: "Você será minha ferramenta para extração de dados." },
    { role: "user", content: openaiBody.instruction + "Extraia as informações em português (se não estiver em português, traduza) contidas no artigo abaixo respondendo com um json no formato: "
     + openaiBody.jsonArchitecture
     + " \n "  
     + "Recupere apenas o que está no artigo, não coloque informações que não estão explicitamente no artigo." + " \n " + article }]
  }

}
