import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RouterUpdate } from '../models/router.model';

@Injectable({
  providedIn: 'root',
})
export class RouterService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      user_root_id: this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  getListRouter(
    regionId: number,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    let url_ = `routers/list-router?regionId=${regionId}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getRouterById(id: string, vpcId: number, regionId: number): Observable<any> {
    let url_ = `routers/${id}?vpcId=${vpcId}&regionId=${regionId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  deleteRouter(id: string, regionId: number, vpcId: number): Observable<any> {
    let url_ = `routers/${id}?regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createRouter(data: any): Observable<any> {
    let url_ = `/routers`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      this.httpOptions
    );
  }

  updateRouter(data: RouterUpdate): Observable<any> {
    let url_ = `/routers/${data.id}`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      this.httpOptions
    );
  }

  getRouterInterfaces(
    routerId: number,
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `router-interfaces?routerId=${routerId}&regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getRouterStatics(
    routerId: number,
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `route-static?routerId=${routerId}&regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }
}
