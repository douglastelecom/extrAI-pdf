import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { MongodbService } from '../services/mongodb.service';
import { ExtraiService } from '../services/extrai.service';
import { OpenaiService } from '../services/openai.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.sass'
})
export class FormComponent {
  openaiForm!: FormGroup
  mongoForm!: FormGroup
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
  mongoCheckbox: boolean = false;
  promiseResolvedCount: number = 0 
  constructor(private fb: FormBuilder, private extraiService: ExtraiService, private openaiService: OpenaiService, private mongodbService: MongodbService) { }

  ngOnInit(): void {
    this.openaiForm = this.fb.group({
      apiKey: [''],
      model: ['gpt-3.5-turbo-0125'],
      projectName: [''],
      jsonArchitecture: [''],
      instruction: ['']
    });
    this.mongoForm = this.fb.group({
      dataSource: [''],
      database: [''],
      collection: [''],
      urlApi: [''],
      apiKey: ['']
    });
    this.openaiForm.valueChanges.subscribe(val => {
      this.checkButton()
    })
  }

  checkButton(){
    if(this.openaiForm.valid && this.files.length > 0){
      this.disableButton = false
    } else{
      this.disableButton = true
    }
  }

  setFiles(e: any) {
    this.files = Array.from(e.target.files);
    this.checkButton();
  }

  disableForms(){
    this.openaiForm.disable()
    this.mongoForm.disable()
  }
  enableForms(){
    this.openaiForm.enable()
    this.mongoForm.enable()
  }
  
  async extract() {
    try{
      this.openaiForm.disable()
      this.showLoading = true
      this.disableButton = true
      var promises: Promise<any>[] = [];
      this.failedFiles = [];
      this.errorString = "";
      this.successFilesString = "";
      this.showError = false;
      this.showSuccess = false;
      this.loadingMessage = "Testando conexão..."
      await this.extraiService.testConnections(this.openaiForm.value, this.mongoCheckbox, this.mongoForm.value)
        this.loadingMessage = this.promiseResolvedCount + " de "+ this.files.length +" arquivos extraídos."
        this.files.forEach((file, index) => {
          var promise = this.extraiService.extractData(this.openaiForm.value, file).then((resp)=> {this.promiseResolvedCount += 1; return resp})
          .catch((error) => {
            this.promiseResolvedCount += 1
            this.failedFiles.push(this.files[index].name)
            return null
          })
          promises.push(promise)
        });
        Promise.all(promises).then(async (results) => {
          debugger
          results = results.filter(element => element !== null);
          await this.mongodbService.insertMany(this.mongoForm.value, results)
          if(this.jsonCheckbox){
            const json = JSON.stringify(results)
            var blob = new Blob([json], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = this.mongoForm.value.collection;
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
        })
      } 
    catch(error: any){
      debugger
        this.errorString = error.message + "Resposta do servidor: "+ error.error
        this.showError = true
    } finally {
      this.enableForms()
      this.showLoading = false
      this.promiseResolvedCount = 0
      this.disableButton = false
    }
  }
}

