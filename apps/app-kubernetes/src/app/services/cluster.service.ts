import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable, NgZone } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { Observable, Subject } from "rxjs";
import { UpgradeVersionClusterDto } from "../model/cluster.model";
import { BaseService } from "../shared/services/base.service";

@Injectable({
  providedIn: 'root'
})

export class ClusterService extends BaseService {
  constructor(private http: HttpClient,
    private zone: NgZone,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private progressSource = new Subject<any>();
  progressData = this.progressSource.asObservable();

  // baseUrl = 'http://127.0.0.1:16003';

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
    cloudProfileId: string,
    projectInfraId: number,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/search-cluster?cluster_name=${clusterName}&cloud_profile_id=${cloudProfileId}&project_infra_id=${projectInfraId}&service_status=${serviceStatus}&page=${pageIndex}&size=${pageSize}`, { headers: this.getHeaders() });
  }

  searchLogs(
    userAction: string,
    operation: string,
    resource: string,
    resourceType: string,
    fromDate: number,
    toDate: number,
    pageIndex: number,
    pageSize: number,
    serviceOrderCode: string
  ) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/search-logs?user_action=${userAction || ''}&operation=${operation || ''}&resource=${resource || ''}&resource_type=${resourceType || ''}&from_date=${fromDate || ''}&to_date=${toDate || ''}&service_order_code=${serviceOrderCode}&page=${pageIndex || 1}&size=${pageSize || 10}`,
    {headers: this.getHeaders()});
  }

  createNewCluster(data) {
    return this.http.post(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/create-cluster`, data, { headers: this.getHeaders() });
  }

  validateClusterInfo(data: any) {
    return this.http.post(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/validate-cluster`, data,
    {headers: this.getHeaders()});
  }

  getDetailCluster(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/detail-cluster/${serviceOrderCode}`, { headers: this.getHeaders() });
  }

  getProgressOfCluster(clusterName: string, namespace: string) {
    return new Observable<string>(obs => {
      const es = new EventSource(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/view-progress/${namespace}/${clusterName}`);
      es.addEventListener('message', (evt) => {
        let data = evt.data;
        obs.next(data);
        if (+data == 100) { // complete
          obs.unsubscribe();
        }

      });
      return () => es.close();
    });
  }

  getKubeConfig(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/get-kubeconfig/${serviceOrderCode}`,
    {headers: this.getHeaders()});
  }

  getWorkerGroupOfCluster(serviceOrderCode: string) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/${serviceOrderCode}/workers-name`, {headers: this.getHeaders()});
  }

  upgradeVersionCluster(data: UpgradeVersionClusterDto) {
    return this.http.put(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/upgrade-version`, data, { headers: this.getHeaders() });
  }

  getListStatus() {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/list-status`, { headers: this.getHeaders() });
  }

  deleteCluster(clusterId: number) {
    return this.http.delete(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/delete-cluster/${clusterId}`, { headers: this.getHeaders() });
  }

  getListPack(cloudProfileId: string) {
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/k8s/${cloudProfileId}/packs-service`, {headers: this.getHeaders()});
  }

  getListK8sVersion(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/k8s-versions`, { headers: this.getHeaders(), params: params });
  }

  getListWorkerTypes(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/worker-types`, { headers: this.getHeaders(), params: params });
  }

  getListVolumeTypes(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/volume-types`, { headers: this.getHeaders(), params: params });
  }

  getVPCNetwork(regionId: number, cloudProfileName: string) {
    let params = new HttpParams();
    if (regionId) {
      params = params.append('region_id', regionId);
    }
    if (cloudProfileName) {
      params = params.append('cp_name', cloudProfileName);
    }
    return this.http.get(`${this.baseUrl}${this.ENDPOINT.k8s}/cp/vpc-network`, { headers: this.getHeaders(), params: params });
  }

}
