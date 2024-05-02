import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MongoBody } from '../types/mongoBody.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {

  constructor(private http: HttpClient) { }

  async insertMany(mongoBody: MongoBody){
    const urlApi: string | undefined = mongoBody.urlApi;
    const apiKey: string | undefined = mongoBody.apiKey;
    delete mongoBody.urlApi;
    delete mongoBody.apiKey;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'apiKey': apiKey!
    });
    
    var response = this.http.post<any>(urlApi!, mongoBody, {headers})
    return await lastValueFrom(response)
}

}
