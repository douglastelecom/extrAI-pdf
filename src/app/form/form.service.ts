import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor(private http: HttpClient) { }

  async testApi(form: any){
      var response = this.http.post<any>('https://meu-tcc-back.onrender.com/test', form)
      return await lastValueFrom(response)
  }

  async completion(formData: any){
      var response = this.http.post<any>('https://meu-tcc-back.onrender.com/completion', formData)
      return await lastValueFrom(response)
  }

  async healthCheck(){
    var response = this.http.get<any>('https://meu-tcc-back.onrender.com/').subscribe()
}

}
