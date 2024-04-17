import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor(private http: HttpClient) { }

  async testApi(form: any){
    var response = this.http.post('http://localhost:8080/test', form)
    return await lastValueFrom(response)
  }

  async completion(formData: any){
    try{
      var response = this.http.post<any>('http://localhost:8080/completion', formData)
      return await lastValueFrom(response)
    } catch(error){
      throw error
    }
  }
}
