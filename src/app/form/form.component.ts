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
  errorString: string = ""
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
    this.errorString = "";
    this.successFilesString = "";
    this.showError = false;
    this.showSuccess = false;
    var canConnect = true;
    await this.formService.testApi(this.formGroup.value).catch(httpError => {
      console.log(httpError)
      this.errorString = httpError.error.message + "Resposta do servidor: "+ httpError.error.error
      this.showError = true
      canConnect = false})
    if(canConnect){
      this.files.forEach((file, index) => {
        const formData = new FormData();
        formData.append('json', JSON.stringify(this.formGroup.value));
        formData.append('file', file);
        var promise = this.formService.completion(formData).catch(error => this.failedFiles.push(this.files[index].name))
        promises.push(promise)
      });
      Promise.all(promises).then(() => {
        if (this.failedFiles.length > 0) {
          this.failedFiles.forEach((fileName, index) => {
            if (index === this.failedFiles.length - 1) {
              this.errorString =  this.errorString.slice(0, -2) + " e " + "'" + fileName + "'" + ".";
            } else {
              this.errorString = this.errorString + "'" + fileName + "'" + ", ";
            }
          })
          this.errorString = "Os seguintes arquivos não foram extraídos: " + this.errorString + "\n Verifique se o tamanho do(s) arquivo(s) é compatível com o modelo escolhido."
          this.showError = true;
        }
        this.successFilesString = (this.files.length - this.failedFiles.length) + " arquivo(s) extraído(s) com sucesso.  "
        this.showSuccess = true;
      })
    }
  }
}

