import { FormOpenai} from './../types/openaiBody.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  constructor(private http: HttpClient) { }

  async completion(completionBody: ChatCompletionCreateParamsNonStreaming, apiKey: string){
      const openai = new OpenAI({apiKey: apiKey})
      const response = await openai.chat.completions.create(completionBody)
      return JSON.parse(response.choices[0].message.content!)
}

  setMessagesForExtraction(openaiForm: FormOpenai, article: string){
    openaiForm.messages = [{ role: "system", content: "Você será minha ferramenta para extração de dados." },
    { role: "user", content: openaiForm.instruction + "Extraia as informações em português (se não estiver em português, traduza) contidas no artigo abaixo respondendo com um json no formato: "
     + openaiForm.jsonArchitecture
     + " \n "  
     + "Recupere apenas o que está no artigo, não coloque informações que não estão explicitamente no artigo." + " \n " + article }]
  }

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

}
