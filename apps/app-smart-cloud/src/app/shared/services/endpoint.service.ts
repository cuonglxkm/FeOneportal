import { Inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { AddDomainRequest, HttpsSettingRequest, SslCertDTO, SslCertRequest, WafDetailDTO, WafDomain, WafDTO, UpdatePolicies, QueryRequesBandwidthtSavingRatioRequestDto, QueryBacktoOriginTrafficAndRequestRequestDto, QueryTrafficRequestInTotalAndPeakValueRequestDto, QueryRequestHitRatioRequestDto, QueryStatusCodeDistributionRequestDto, QueryOriginStatusCodeDistributionRequestDto, QueryEventTrendRequestDto, QueryRequesBandwidthtSavingRatioResponse, QueryRequestHitRatioResponse } from 'src/app/pages/waf/waf.model';
import { OfferItem } from 'src/app/pages/instances/instances.model';
import { EndpointSmartIR } from 'src/app/pages/endpoint/endpoint.model';

@Injectable({
  providedIn: 'root',
})
export class EndpointService extends BaseService {
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }
  getEndpoints(
    pageSize: number,
    currentPage: number,
    status: string,
    name: string
  ) {
    let param = new HttpParams();
    if (status != undefined || status != null)
      param = param.append('status', status);
    if (name != undefined || name != null) param = param.append('name', name);
    if (pageSize != undefined || pageSize != null)
      param = param.append('pageSize', pageSize);
    if (currentPage != undefined || currentPage != null)
      param = param.append('currentPage', currentPage);

    return this.http
      .get<BaseResponse<EndpointSmartIR[]>>(
        this.baseUrl + this.ENDPOINT.provisions + '/endpoint/endpoints',
        {
          params: param,
          headers: this.getHeaders().headers,
        }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        })
      );
  }

  checkExitName(name: string): Observable<boolean> {
    return this.http.get<boolean>(
      this.baseUrl + this.ENDPOINT.provisions + `/endpoint/check-name-exist?name=${name}`,
      {
        headers: this.getHeaders().headers,
      }
    );
  }
  checkExitUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      this.baseUrl + this.ENDPOINT.provisions + `/endpoint/check-username-exist?username=${username}`,
      { headers: this.getHeaders().headers }
    );
  }
}
