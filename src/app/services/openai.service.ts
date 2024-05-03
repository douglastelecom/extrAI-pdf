import { FormOpenai} from './../types/openaiBody.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  constructor(private http: HttpClient, private utilService: UtilService) { }

  async completion(formOpenai: FormOpenai, apiKey: string, article: string): Promise<any>{
    try{ 
    const openai = new OpenAI({apiKey: apiKey})
      this.setMessagesForExtraction(formOpenai, article)
      const response = await openai.chat.completions.create(formOpenai)
      return JSON.parse(response.choices[0].message.content!)
    } catch (error: any) {
      if (error.message.substring(0, 10) === "Rate limit") {
        const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await pause(30000);
        return await this.completion(formOpenai, apiKey, article)
      } else if (error.message.substring(0, 20) === "This model's maximum") {
        var { maxContextLength, resultedTokens } = this.extractValuesFromErrorMaximumContent(error.message)
        if ((maxContextLength / resultedTokens) < 0.75) {
          throw new Error("Arquivo muito grande.")
        } else {
          article = this.utilService.reduceTextLength(maxContextLength, resultedTokens, article)
          return await this.completion(formOpenai, apiKey, article)
        }
      }
      throw new Error("Problemas com a API GPT")
    }
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

  async testApi(reqBody: any) {
    try {
        const openai = new OpenAI({ apiKey: reqBody.openaiKey });
        openai.apiKey = reqBody.openaiKey
        await openai.chat.completions.create({
            messages: [{ role: "system", content: "Isso é um teste." },
            { role: "user", content: "Isso é um teste de conexão. Responda apenas com um json {'resposta': 'ok'}" }],
            model: reqBody.model,
            response_format: { type: "json_object" }
        });
    } catch (error: any) {
        throw new Error("Não foi possível se comunicar com a API da OpenAI. Verifique a Api Key e os demais parâmetros.")
    }
}

}
