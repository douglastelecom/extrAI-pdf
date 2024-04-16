import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor(private http: HttpClient) { }

  async completion(formData: any){
    var response = this.http.post<any>('http://localhost:8080/completion', formData)
    response = await lastValueFrom(response)
    return response
  }

}
