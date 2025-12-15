import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  baseUrl: string;
  baseUrlConvocatoriaDoc: string;
  apiUbigeoDpto: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private config!: AppConfig;

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    this.config = await firstValueFrom(
      this.http.get<AppConfig>('assets/config.json')
    );
  }

  get baseUrl() {
    return this.config.baseUrl;
  }

  get baseUrlConvocatoriaDoc() {
    return this.config.baseUrlConvocatoriaDoc;
  }

  get apiUbigeoDpto() {
    return this.config.apiUbigeoDpto;
  }
}
