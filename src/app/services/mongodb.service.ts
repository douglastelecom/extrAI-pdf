import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormMongo } from '../types/mongoBody.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MongodbService {
  constructor(private http: HttpClient) {}

  async insertMany(formMongo: FormMongo, documents: any[]) {
    try {
      formMongo.documents = documents
      const urlApi: string | undefined = formMongo.urlApi + "/action/insertMany";
      const apiKey: string | undefined = formMongo.apiKey;
      delete formMongo.urlApi;
      delete formMongo.apiKey;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        apiKey: apiKey!,
      });
      var response = this.http.post<any>(urlApi!, formMongo, { headers });
      return await lastValueFrom(response);
    } catch (error: any) {
      throw new Error(
        'Não foi possível salvar os arquivos na API MongoDB Atlas.'
      );
    }
  }
  async testApi(formMongo: FormMongo) {
    try {
      debugger
      const urlApi: string | undefined = formMongo.urlApi + "/action/insertMany";
      const apiKey: string | undefined = formMongo.apiKey;
      formMongo.documents = [{ doc1: 1 }, { doc2: 2 }];
      formMongo.collection = 'test';
      debugger
      delete formMongo.urlApi;
      delete formMongo.apiKey;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        apiKey: apiKey!,
      });
      var response = this.http.post<any>(urlApi!, formMongo, { headers });
      return await lastValueFrom(response);
    } catch (error: any) {
      console.log(error)
      debugger
      throw new Error(
        'Não foi possível estabelecer uma conexão com a API MongoDB Atlas.'
      );
    }
  }
}
