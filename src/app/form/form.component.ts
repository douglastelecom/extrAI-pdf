import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from './form.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';

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
  loadingMessage: string = ""
  disableButton: boolean = true
  showLoading: boolean = false
  jsonsExtracted: string[] = [];
  jsonCheckbox: boolean = true;
  promiseResolvedCount: number = 0 
  constructor(private fb: FormBuilder, private formService: FormService) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      openaiKey: [''],
      model: [''],
      mongoUrl: [''],
      db: [''],
      collection: ['', Validators.required],
      json: ["{'nome_artigo': '', 'autores': [''], 'ano': '', 'universidade': '', 'lesoes': [{'descricao_lesao': '', 'fatores_de_risco':[''], 'cuidados_de_enfermagem': ['']}}"],
      instruction: ['Colete informações referentes aos fatores de risco para lesões e cuidados de enfermagem com a pele do recém-nascido na unidade de terapia intensiva neonatal.']
    })
    this.formGroup.valueChanges.subscribe(val => {
      this.checkButton()
    })
    this.formService.healthCheck();
  }

  checkButton(){
    if(this.formGroup.valid && this.files.length > 0){
      this.disableButton = false
    } else{
      this.disableButton = true
    }
  }

  setFiles(e: any) {
    this.files = Array.from(e.target.files);
    this.checkButton();
  }
  
  async extract() {
    this.formGroup.disable()
    this.showLoading = true
    this.disableButton = true
    var promises: Promise<any>[] = [];
    this.failedFiles = [];
    this.errorString = "";
    this.successFilesString = "";
    this.showError = false;
    this.showSuccess = false;
    var canConnect = true;
    this.loadingMessage = "Testando conexão..."
    await this.formService.testApi(this.formGroup.value).catch(httpError => {
      console.log(httpError)
      this.showLoading = false
      this.disableButton = false;
      this.errorString = httpError.error.message + "Resposta do servidor: "+ httpError.error.error
      this.showError = true
      this.formGroup.enable()
      canConnect = false})
    if(canConnect){
      console.log("Teste de conexão aprovado.")
      this.loadingMessage = this.promiseResolvedCount + " de "+ this.files.length +" arquivos extraídos."
      this.files.forEach((file, index) => {
        const formData = new FormData();
        formData.append('json', JSON.stringify(this.formGroup.value));
        formData.append('file', file);
        var promise = this.formService.completion(formData).then((resp)=> {this.promiseResolvedCount += 1; return resp}).catch((error) => {
          this.promiseResolvedCount += 1
          this.failedFiles.push(this.files[index].name)
          return null
        })
        promises.push(promise)
      });
      Promise.all(promises).then((results) => {
        results = results.filter(element => element !== null);
        if(this.jsonCheckbox){
          const json = JSON.stringify(results)
          var blob = new Blob([json], {type: 'application/json'});
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = this.formGroup.value.collection;
          a.click();
        }
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
        this.successFilesString = "Arquivo(s) extraído(s) com sucesso: " + (results.length) + " de " + this.files.length
        this.showSuccess = true
        this.formGroup.enable()
        this.disableButton = false
        this.showLoading = false
        this.promiseResolvedCount = 0
      })
    }
  }
}

