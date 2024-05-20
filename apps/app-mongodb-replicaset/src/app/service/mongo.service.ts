import { ApiResponse } from './../model/api-response.model';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { ListContentPage } from '../model/list-content-page.model';
import { MongodbInfor } from '../model/mongodb-infor.model';
import { MongodbStatus } from '../model/status.model';
import { AppDetail, MongodbDetail } from '../model/mongodb-detail.model';


@Injectable({
  providedIn: 'root',
})
export class MongoService extends BaseService {

  constructor(private http: HttpClient) {
    super();
  }

  //   override baseUrl = 'http://localhost:16008';


  prefix_url = "mongodb-replicaset-service"
  type = "mongodb"

  searchCluster(
    regionId: number,
    projectId : number,
    status: number,
    kw: string,
    pageIndex: number,
    pageSize: number): Observable<ApiResponse<ListContentPage<MongodbInfor>>> {

    return this.http.get(`${this.baseUrl}/${this.prefix_url}/clusters/search?regionId=${regionId || -1}&projectId=${projectId || -1}&status=${status || -1}&keyword=${kw || ''}&pageIndex=${pageIndex || ''}&pageSize=${pageSize || ''}`)
      .pipe(filter((r: any) => (r && r.data))
      );

  }

  getListServiceStatus(): Observable<ApiResponse<MongodbStatus[]>> {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/statuses`)
      .pipe(filter((r: any) => (r && r.data))
      );
  }

  getDetail(serviceCode : string) : Observable<ApiResponse<MongodbDetail>> {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/clusters/detail/${serviceCode}`)
      .pipe(filter((r: any) => (r && r.data))
      );
  }

  getAllServiePack() {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/clusters/service-pack`)
      .pipe(filter((r: any) => (r && r.data))
      );
  }

  getAllVersion(version : string){
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/clusters/version?version=${version}`)
      .pipe(filter((r: any) => (r && r.data))
      );
  }

  createMongodbCluster(data : any) {
    return this.http.post(`${this.baseUrl}/${this.prefix_url}/clusters/create`, data);
  }

  deleteMongodbCluster(serviceCode:string){
    return this.http.delete(`${this.baseUrl}/${this.prefix_url}/clusters/${serviceCode}`);
  }

  getSubnetByNamespaceAndNetwork(projectInfraId: number, networkId: number): Observable<any> {
    return null;
  }

  getCatalogsOffer(regionID? : number) {
    return this.http.get(`${this.apiGwUrl}/catalogs/offers?regionId=${!regionID ? '':regionID}&unitOfMeasureProduct=`+this.type)
  }

  upgrade(data : any) {
    return this.http.put(`${this.baseUrl}/${this.prefix_url}/clusters/upgrade`, data);
  }

  upgradeVersion(data: any) {
    return this.http.put(`${this.baseUrl}/${this.prefix_url}/clusters/upgrade-version`, data);
  }

  getPricePackMongo(data : any) {
    return this.http.post(`${this.apiGwUrl}/orders/totalamount`, data);
  }
  
}
