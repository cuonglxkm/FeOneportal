import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormSearchRouter, RouterModel, RouterUpdate, StaticRouter } from '../models/router.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';

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


  getListRouter(formSearch: FormSearchRouter) {
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    if (formSearch.routerName != undefined || formSearch.routerName != null) {
      params = params.append('routerName', formSearch.routerName)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }
    if (formSearch.status != undefined || formSearch.status != null) {
      params = params.append('status', formSearch.status)
    }
    return this.http.get<BaseResponse<RouterModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/routers/list_router', {
      params: params
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  getListNetwork(
    regionId: number,
    projectId: number,
  ): Observable<any> {
    let url_ = `/routers/list_network?regionId=${regionId}&projectId=${projectId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getRouterById(id: string, vpcId: number, regionId: number): Observable<any> {
    let url_ = `/routers/${id}?vpcId=${vpcId}&regionId=${regionId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  deleteRouter(id: string, regionId: number, vpcId: number): Observable<any> {
    let url_ = `/routers/${id}?regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.delete<any>(
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
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      this.httpOptions
    );
  }

  getRouterInterfaces(
    routerId: string,
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `/router_interfaces?routerId=${routerId}&regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createRouterInterface(data: any): Observable<any> {
    let url_ = `/router_interfaces`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      this.httpOptions
    );
  }

  deleteRouterInterface(
    id: string,
    regionId: number,
    subnetId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `/router_interfaces/${id}?regionId=${regionId}&subnetId=${subnetId}&vpcId=${vpcId}`;
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getRouterStatics(
    routerId: string,
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `/route_static?routerId=${routerId}&regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createStaticRouter(data: any): Observable<any> {
    let url_ = `/route_static`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,data,
      this.httpOptions
    );
  }

  deleteStaticRouter(
    id: string,
    destinationCIDR: string,
    nextHop: string,
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `/route_static/${id}?destinationCIDR=${destinationCIDR}&nextHop=${nextHop}&regionId=${regionId}&vpcId=${vpcId}`;
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getListSubnet(
    routerId: string,
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `/router_interfaces/list_subnet?routerId=${routerId}&regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }
}
