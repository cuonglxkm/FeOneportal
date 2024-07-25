import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService extends BaseService {

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }

  getConfigurations(
    name: string,
  ): Observable<any> {
    let url_ = `?name=${name}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.configurations + url_,
      this.getHeaders()
    );
  }

}
