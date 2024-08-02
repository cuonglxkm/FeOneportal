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
import { AddDomainRequest, HttpsSettingRequest, SslCertDTO, SslCertRequest, WafDetailDTO, WafDomain, WafDTO, UpdatePolicies } from 'src/app/pages/waf/waf.model';
import { OfferItem } from 'src/app/pages/instances/instances.model';

@Injectable({
  providedIn: 'root',
})
export class WafService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }
  getWafs(
    pageSize: number,
    currentPage: number,
    status: string,
    name: string,
    wafPackage: string
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
      .get<BaseResponse<WafDetailDTO[]>>(
        this.baseUrl + this.ENDPOINT.provisions + '/waf/package',
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

  getDetail(id: number): Observable<WafDetailDTO> {
    return this.http.get<WafDetailDTO>(
      this.baseUrl + this.ENDPOINT.provisions + `/waf/package/${id}`,
      { headers: this.getHeaders().headers }
    );
  }

  getOffersById(id: number): Observable<OfferItem> {
    return this.http.get<OfferItem>(`${this.baseUrl}/catalogs/offers/${id}`);
  }

  getListSslCert(
    name: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        this.ENDPOINT.provisions +
        `/waf/certificate?name=${name}&pageSize=${pageSize}&currentPage=${currentPage}`
    );
  }

  getDetailSslCert(id: number): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + `/waf/certificate-detail/${id}`,
      { headers: this.getHeaders().headers }
    );
  }


  createSSlCert(data: SslCertRequest) {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + '/waf/add-cert',
      Object.assign(data),
      {
        headers: this.getHeaders().headers,
      }
    );
  }

  editSSlCert(id: number, data: SslCertRequest) {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + `/waf/edit-cert/${id}`,
      Object.assign(data),
      {
        headers: this.getHeaders().headers,
      }
    );
  }
  getWafDomains(
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
      .get<BaseResponse<WafDomain[]>>(
        this.baseUrl + this.ENDPOINT.provisions + '/waf/domain',
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

  deletePackage(id) {
    return this.http
      .delete(this.baseUrl + this.ENDPOINT.provisions + `/waf/package/${id}`)
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

  addDomain(data: AddDomainRequest): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + '/waf/domain',
      data,
      this.getHeaders()
    );
  }

  deleteDomain(id: number) {
    return this.http
      .delete(this.baseUrl + this.ENDPOINT.provisions + `/waf/domain/${id}`)
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

  updateDomain(id: number, data: any) {
    return this.http.put(
      this.baseUrl + this.ENDPOINT.provisions + `/waf/domain/${id}`,
      data,
      { headers: this.getHeaders().headers }
    );
  }

  disableAllPolicies(id: number){
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/waf/disable-all-policies/${id}`, {}, this.getHeaders())
  }

  settingHttps(data: HttpsSettingRequest, id: number){
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/waf/https-setting/${id}`, Object.assign(data), this.getHeaders())
  }

  deleteSslCert(id: number){
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/waf/certificate/${id}`)
  }

  getSslCertById(id: number){
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + `/waf/certificate/${id}`, {headers: this.getHeaders().headers})
  }

  associateDomains(){
    return
  }

  disAssociateCertificate(){
    return
  }

  getSslCertDetail(id: number){
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + `/waf/certificate-detail/${id}`, this.getHeaders())
  }
  updatePolicies(domainId: number, data: UpdatePolicies){
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/waf/policies/${domainId}`, data, {headers: this.getHeaders().headers})
  }
}
