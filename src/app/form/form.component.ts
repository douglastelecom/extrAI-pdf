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
  files: File[]=[];
  failedFiles: string[]=[];
  showError: boolean = false;
  showSuccess: boolean = false;
  failedFilesString: string = ""
  successFilesString: string = ""
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
    this.files.forEach((file, index) => {
      const formData = new FormData();
      formData.append('json', JSON.stringify(this.formGroup.value));
      formData.append('file', file);
      var promise = this.formService.completion(formData).catch(error => this.failedFiles.push(this.files[index].name))
      promises.push(promise)
    });
    Promise.all(promises).then(() => {
      debugger
      if (this.failedFiles.length > 0) {
        this.showError = true;
        this.failedFilesString = ""
        this.failedFiles.forEach((fileName, index) => {
          if (index === this.failedFilesString.length) {
            this.failedFilesString = this.failedFilesString + ".";
          } else {
            this.failedFilesString = this.failedFilesString + ", "
          }
        })
      }
      debugger
      this.showSuccess = true;
      this.successFilesString = (this.files.length + this.failedFiles.length).toString + "arquivos extraídos."
      console.log(this.successFilesString)
    })
  }
}

