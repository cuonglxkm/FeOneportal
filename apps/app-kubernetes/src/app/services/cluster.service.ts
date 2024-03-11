import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { BaseService } from "../shared/services/base.service";

@Injectable({
  providedIn: 'root'
})

export class ClusterService extends BaseService {
  constructor(private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  baseUrl = 'http://127.0.0.1:16003';

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  searchCluster(
    clusterName: string,
    serviceStatus: string,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/search-cluster?cluster_name=${clusterName}&service_status=${serviceStatus}&page=${pageIndex}&size=${pageSize}`, {headers: this.getHeaders()});
  }

  createNewCluster(data) {
    return this.http.post(`${this.baseUrl}/k8s/create-cluster`, data, {headers: this.getHeaders()});
  }

  getDetailCluster(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/detail-cluster/${serviceOrderCode}`, {headers: this.getHeaders()});
  }

  viewProgressCluster(namespace: string, clusterName: string) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/view-progress/${namespace}/${clusterName}`, {headers: this.getHeaders()});
  }

  getListStatus() {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/list-status`, {headers: this.getHeaders()});
  }

  deleteCluster(clusterId: number) {
    return this.http.delete(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/delete-cluster/${clusterId}`, {headers: this.getHeaders()});
  }

  testCreateCluster(data) {
    return this.http.post(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/get-dto/create-cluster`, data, {headers: this.getHeaders()});
  }

  getListK8sVersion(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/k8s-versions`, {headers: this.getHeaders(), params: params});
  }

  getListWorkerTypes(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/worker-types`, {headers: this.getHeaders(), params: params});
  }

  getListVolumeTypes(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/volume-types`, {headers: this.getHeaders(), params: params});
  }

  getVPCNetwork(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/vpc-network`, {headers: this.getHeaders(), params: params});
  }

}
