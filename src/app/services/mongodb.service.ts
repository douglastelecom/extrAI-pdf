import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormMongo } from '../types/mongoBody.interface';
import { lastValueFrom } from 'rxjs';
import * as Realm from "realm-web";

@Injectable({
  providedIn: 'root',
})
export class MongodbService {
  constructor(private http: HttpClient) { }

  async insertMany(formMongo: FormMongo, documents: any[], accessToken: string) {
    try {
      formMongo.documents = documents
      const urlApi: string | undefined = formMongo.urlApi + "/action/insertMany";
      delete formMongo.urlApi;
      delete formMongo.password;
      delete formMongo.email;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  accessToken
      });
      var response = this.http.post<any>(urlApi!, formMongo, { headers });
      return await lastValueFrom(response);
    } catch (error: any) {
      throw new Error(
        'Não foi possível salvar os arquivos na API MongoDB Atlas.'
      );
    }
  }

  async getTokenAccess(formMongo: FormMongo) {
    try{
      debugger
      const match = formMongo.urlApi!.match(/\/app\/([^\/]+)/)
      const dataId = match ? match[1] : null;
      if(!match){
        throw new Error()
      }
      const app = new Realm.App({ id: dataId! });
      const credentials = Realm.Credentials.emailPassword(formMongo.email!, formMongo.password!);
      const user = await app.logIn(credentials);
      console.assert(user.id === app.currentUser!.id);
      return user.accessToken!;
    } catch(error: any){
      throw new Error ("Falha na autenticação do Mongodb Atlas. Verifique suas credenciais e tente novamente.")
    }
  }

}
