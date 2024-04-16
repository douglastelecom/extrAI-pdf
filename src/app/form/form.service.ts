import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor(private http: HttpClient) { }

  async completion(formData: any){
    const x = this.http.post<any>('http://localhost:8080/completion', formData).subscribe((resp) => console.log(resp))
  }

}
