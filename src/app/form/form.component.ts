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
  ) { }

  ngOnInit(): void {
    this.openaiForm = this.fb.group({
      apiKey: ['', Validators.required],
      model: ['gpt-3.5-turbo-0125', Validators.required],
      projectName: ['TCC', Validators.required],
      jsonArchitecture: [
        "{'nome_artigo': '', 'autores': [''], 'ano': '', 'universidade': '', 'lesoes': [{'descricao_lesao': '', 'fatores_de_risco':[''], 'cuidados_de_enfermagem': ['']}}",
        Validators.required,
      ],
      instruction: [
        "Colete informações referentes aos fatores de risco para lesões e cuidados de enfermagem com a pele do recém-nascido na unidade de terapia intensiva neonatal.",
        Validators.required,
      ],
    });
    this.mongoForm = this.fb.group({
      dataSource: ['extractor-cluster', Validators.required],
      database: ['meu_tcc_db', Validators.required],
      collection: ['tcc', Validators.required],
      urlApi: ['https://sa-east-1.aws.data.mongodb-api.com/app/data-tzppnhx/endpoint/data/v1', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.openaiForm.valueChanges.subscribe((val) => {
      this.checkButton();
    });
    this.mongoForm.valueChanges.subscribe((val) => {
      if (this.mongoCheckbox) {
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
    this.showLoadingComponents = false;
    this.checkButton();
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

  showError(failedFiles: string[]) {
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

  showSuccess(successFiles: number, totalFiles: number) {
    'Arquivo(s) extraído(s) com sucesso: ' + successFiles + ' de ' + totalFiles;
    this.showSuccessAlert = true;
  }

  downloadJson(results: any) {
    const json = JSON.stringify(results);
    var blob = new Blob([json], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = this.mongoForm.value.collection;
    a.click();
  }

  async startExtraction() {
    try {
      debugger
      this.showLoading();
      var promises: Promise<any>[] = [];
      var failedFiles: string[] = []
      this.loadingMessage = 'Testando conexão...';
      debugger
      await this.openaiService.testApi(this.openaiForm.value)
      var accessToken: string = ""
      if (this.mongoCheckbox) {
        accessToken = await this.mongodbService.getTokenAccess(this.mongoForm.value);
      }
      debugger
      this.loadingMessage = this.promiseResolvedCount + ' de ' + this.files.length + ' arquivos extraídos.';
      this.files.forEach((file, index) => {
        debugger
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
        try {
          debugger
          results = results.filter((element) => element !== null);
          this.downloadJson(results)
          if (this.mongoCheckbox) {
            await this.mongodbService.insertMany(this.mongoForm.value, results, accessToken!)
          }
          debugger
          if (failedFiles.length > 0) {
            this.showError(failedFiles)
          }
          this.showSuccess(results.length, this.files.length)
          this.hideLoading();
        } catch (error: any) {
          this.hideLoading();
          this.errorMessage = error.message + 'Resposta do servidor: ' + error.error;
          this.showErrorAlert = true;
        }
      })
    } catch (error: any) {
      debugger
      this.hideLoading();
      this.errorMessage = error.message + 'Resposta do servidor: ' + error.error;
      this.showErrorAlert = true;
    }
  }
}
