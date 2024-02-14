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

  baseUrl = 'http://10.1.127.93:16003/k8s-service';

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  createNewCluster(data) {
    return this.http.post(`${this.baseUrl}`, data, {headers: this.getHeaders()});
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
    // return this.http.get(``, {headers: this.getHeaders()});
    return this.http.get(`${this.baseUrl}/cp/${cloudProfilenName}/volume-types`);
  }

}
