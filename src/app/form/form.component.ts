import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  styleUrl: './form.component.sass',
})
export class FormComponent {
  openaiForm!: FormGroup;
  mongoForm!: FormGroup;
  files: File[] = [];
  showErrorAlert: boolean = false;
  showSuccessAlert: boolean = false;
  errorMessage: string = '';
  successFilesString: string = '';
  loadingMessage: string = '';
  disableButton: boolean = true;
  showLoadingComponents: boolean = false;
  jsonsExtracted: string[] = [];
  jsonCheckbox: boolean = true;
  mongoCheckbox: boolean = false;
  promiseResolvedCount: number = 0;
  constructor(
    private fb: FormBuilder,
    private extraiService: ExtraiService,
    private openaiService: OpenaiService,
    private mongodbService: MongodbService
  ) {}

  ngOnInit(): void {
    this.openaiForm = this.fb.group({
      apiKey: ['', Validators.required],
      model: ['gpt-3.5-turbo-0125', Validators.required],
      projectName: ['TCC', Validators.required],
      jsonArchitecture: [
        "{'nome_artigo': '', 'nome_artigo_traduzido':'', 'autores': [''], 'ano': '', 'universidade': '', 'resumo_artigo': '', 'assuntos_relacionados': [{'nome_assunto': '', 'descricao_assunto':'', 'breve_resumo_citacao':''}]}",
        Validators.required,
      ],
      instruction: [
        'O meu tcc é sobre a criação de um sistema que extrai dados de artigos através de LLMs como o chatgpt. Procure no artigo que postarei logo abaixo o que ele tem a ver com o meu trabalho.',
        Validators.required,
      ],
    });
    this.mongoForm = this.fb.group({
      dataSource: ['extractor-cluster', Validators.required],
      database: ['meu_tcc_db', Validators.required],
      collection: ['tcc', Validators.required],
      urlApi: ['https://sa-east-1.aws.data.mongodb-api.com/app/data-tzppnhx/endpoint/data/v1', Validators.required],
      apiKey: ['', Validators.required],
    });
    this.openaiForm.valueChanges.subscribe((val) => {
      this.checkButton();
    });
    this.mongoForm.valueChanges.subscribe((val) => {
      if (this.mongoCheckbox) {
        debugger;
        this.checkButton();
      }
    });
  }

  showLoading() {
    this.openaiForm.disable;
    this.mongoForm.disable;
    this.disableButton = true;
    this.showLoadingComponents = true;
  }

  hideLoading() {
    this.openaiForm.enable;
    this.mongoForm.enable;
    this.disableButton = false;
    this.showLoadingComponents = false;
  }

  checkButton() {
    if (this.mongoCheckbox) {
      if (this.openaiForm.valid && this.mongoForm.valid && this.files.length > 0) {
        this.disableButton = false;
      } else {
        this.disableButton = true;
      }
    } else {
      if (this.openaiForm.valid && this.files.length > 0) {
        this.disableButton = false;
      } else {
        this.disableButton = true;
      }
    }
  }

  setFiles(e: any) {
    this.files = Array.from(e.target.files);
    this.checkButton();
  }

  disableForms() {
    this.openaiForm.disable();
    this.mongoForm.disable();
  }
  enableForms() {
    this.openaiForm.enable();
    this.mongoForm.enable();
  }

  showError(failedFiles: string[]){
    if (failedFiles.length > 0) {
      failedFiles.forEach((fileName, index) => {
        if (index === failedFiles.length - 1) {
          this.errorMessage = this.errorMessage.slice(0, -2) + ' e ' + "'" + fileName + "'" + '.';
        } else {
          this.errorMessage = this.errorMessage + "'" + fileName + "'" + ', ';
        }
      });
      this.errorMessage =
        'Os seguintes arquivos não foram extraídos: ' +
        this.errorMessage +
        '\n Verifique se o tamanho do(s) arquivo(s) é compatível com o modelo escolhido.';
      this.showErrorAlert = true;
    }
  }

  showSuccess(successFiles: number, totalFiles: number){
    'Arquivo(s) extraído(s) com sucesso: ' + successFiles + ' de ' + totalFiles;
    this.showSuccessAlert = true;
  }

  downloadJson(results: any){
    const json = JSON.stringify(results);
    var blob = new Blob([json], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = this.mongoForm.value.collection;
    a.click();
}

  async extract() {
    try {
      this.showLoading();
      var promises: Promise<any>[] = [];
      var failedFiles: string[];
      this.loadingMessage = 'Testando conexão...';
      await this.extraiService.testConnections(this.openaiForm.value, this.mongoCheckbox, this.mongoForm.value);
      this.loadingMessage = this.promiseResolvedCount + ' de ' + this.files.length + ' arquivos extraídos.';
      this.files.forEach((file, index) => {
        var promise = this.extraiService
          .extractData(this.openaiForm.value, file)
          .then((resp) => {
            this.promiseResolvedCount += 1;
            return resp;
          })
          .catch((error) => {
            this.promiseResolvedCount += 1;
            failedFiles.push(this.files[index].name);
            return null;
          });
        promises.push(promise);
      });
      Promise.all(promises).then(async (results) => {
        debugger;
        results = results.filter((element) => element !== null);
        if(this.mongoCheckbox){
          await this.mongodbService.insertMany(this.mongoForm.value, results).catch((error) => {this.downloadJson(results); debugger; throw new Error("Não foi possível salvar os arquivos no banco MongoDB. \n" + "Mensagem do servidor:" + error.message)})
        }
        this.downloadJson(results)
        this.showError(failedFiles)
        this.showSuccess(results.length, this.files.length)
      });
      debugger;
    } catch (error: any) {
      debugger;
      this.hideLoading();
      this.errorMessage = error.message + 'Resposta do servidor: ' + error.error;
      this.showErrorAlert = true;
      debugger
    }
  }
}
