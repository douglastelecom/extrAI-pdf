import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormMongo } from '../types/mongoBody.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {

  constructor(private http: HttpClient) { }

  async insertMany(formMongo: FormMongo){
    const urlApi: string | undefined = formMongo.urlApi;
    const apiKey: string | undefined = formMongo.apiKey;
    delete formMongo.urlApi;
    delete formMongo.apiKey;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'apiKey': apiKey!
    });
    var response = this.http.post<any>(urlApi!, formMongo, {headers})
    return await lastValueFrom(response)
}

}
