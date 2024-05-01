import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MongoBody } from '../types/mongoBody.interface';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {

  constructor(private http: HttpClient) { }

  async insertMany(mongoBody: MongoBody, apiKey: string){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'apiKey': apiKey
    });
    var response = this.http.post<any>('https://extrai-pdf-back-homologa.onrender.com/completion', mongoBody, {headers})
    return await lastValueFrom(response)
}

}
