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
  constructor(private fb: FormBuilder, private formService: FormService) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      openaiKey: [''],
      model: [''],
      mongoUrl: [''],
      db: [''],
      collection: [''],
      json: ['']
    })
  }

  setFiles(e: any) {
    this.files = Array.from(e.target.files);
  }

  async extract() {
    var promises: Promise<any>[] = [];
    for (const file of this.files) {
      const formData = new FormData();
      formData.append('json', JSON.stringify(this.formGroup.value));
      formData.append('file', file);
      var promise = this.formService.completion(formData);
      promises.push(promise)
    }
    Promise.all(promises).then((responses) => {
      const error = ""
      responses.forEach((response, indice) => {
        const fileError = "";
        if(response === "error"){

        }
      }
      )
    })
  }
}
