import { HttpClient, HttpHeaders } from "@angular/common/http";
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

  baseUrl = 'http://127.0.0.1:16003/k8s-service';

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
    return this.http.get(`${this.baseUrl}/k8s/search-cluster?cluster_name=${clusterName}&service_status=${serviceStatus}&page=${pageIndex}&size=${pageSize}`);
  }

  createNewCluster(data) {
    // return this.http.post(`${this.baseUrl}/k8s/create-cluster`, data, {headers: this.getHeaders()});
    return this.http.post(`${this.baseUrl}/k8s/create-cluster`, data);
  }

  testCreateCluster(data) {
    return this.http.post(`${this.baseUrl}/k8s/get-dto/create-cluster`, data);
  }

  getListK8sVersion(cloudProfileName: string) {
    // return this.http.get(`${this.baseUrl}/cp/${cloudProfileName}/k8s-versions`, { headers: this.getHeaders() });
    return this.http.get(`${this.baseUrl}/cp/${cloudProfileName}/k8s-versions`);
  }

  getListWorkerTypes(cloudProfileName: string) {
    // return this.http.get(`${this.baseUrl}/cp/${cloudProfileName}/worker-types`, {headers: this.getHeaders()});
    return this.http.get(`${this.baseUrl}/cp/${cloudProfileName}/worker-types`);
  }

  getListVolumeTypes(cloudProfilenName: string) {
    // return this.http.get(`${this.baseUrl}/cp/${cloudProfilenName}/volume-types`, {headers: this.getHeaders()});
    return this.http.get(`${this.baseUrl}/cp/${cloudProfilenName}/volume-types`);
  }

  getVPCNetwork(cloudProfileName: string) {
    // return this.http.get(`${this.baseUrl}/cp/${cloudProfileName}/vpc-network`, {headers: this.getHeaders()});
    return this.http.get(`${this.baseUrl}/cp/${cloudProfileName}/vpc-network`);
  }

  // websocket


}
