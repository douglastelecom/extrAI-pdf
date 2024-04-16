import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormService } from './form.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.sass'
})
export class FormComponent {
  formGroup!: FormGroup;
  files!: any;
  constructor(private fb: FormBuilder, private formService: FormService){}

  ngOnInit(): void {
  this.formGroup = this.fb.group({
    openaiKey: [''],
    model: [''],
    mongoUrl:[''],
    db:[''],
    collection:[''],
    json:['']
  })   
}

  setFiles(e: any){
    debugger
    this.files = Array.from(e.target.files);
    debugger
  }

  async extract(){
    const formData = new FormData();
    this.files.forEach(async (file: any) => {
      formData.append('json', JSON.stringify(this.formGroup.value));
      formData.append('file', file);
      await this.formService.completion(formData);
    })
  }
}
