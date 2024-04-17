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
  formGroup!: FormGroup
  files: File[] = []
  failedFiles: string[] = []
  showError: boolean = false
  showSuccess: boolean = false
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
    this.failedFiles = [];
    this.failedFilesString = "";
    this.successFilesString = "";
    this.showError = false;
    this.showSuccess = false;
    debugger
    await this.formService.testApi(this.formGroup.value).catch(error => console.log(error.message))
    debugger
    this.files.forEach((file, index) => {
      debugger
      const formData = new FormData();
      formData.append('json', JSON.stringify(this.formGroup.value));
      formData.append('file', file);
      debugger
      var promise = this.formService.completion(formData).catch(error => this.failedFiles.push(this.files[index].name))
      promises.push(promise)
    });
    Promise.all(promises).then(() => {
      debugger
      if (this.failedFiles.length > 0) {
        this.failedFiles.forEach((fileName, index) => {
          if (index === this.failedFiles.length - 1) {
            this.failedFilesString =  this.failedFilesString.slice(0, -2) + " e " + "'" + fileName + "'" + ".";
          } else {
            this.failedFilesString = this.failedFilesString + "'" + fileName + "'" + ", ";
          }
        })
        this.failedFilesString = "Os seguintes arquivos não foram extraídos: " + this.failedFilesString + "\n Verifique se o tamanho do(s) arquivo(s) é compatível com o modelo escolhido."
        this.showError = true;
      }
      debugger
      this.successFilesString = (this.files.length - this.failedFiles.length) + " arquivo(s) extraído(s) com sucesso.  "
      this.showSuccess = true;
      console.log(this.successFilesString)
    })
  }
}

