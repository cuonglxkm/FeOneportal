import {Inject, Injectable} from "@angular/core";
import {FormSearchNetwork, FormSearchSubnet, NetWorkModel, Port, Subnet} from "../model/vlan.model";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { BaseService } from "../shared/services/base.service";
import { BaseResponse } from "../shared/models/base-response";

@Injectable({
  providedIn: 'root',
})

export class VlanService extends BaseService {

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getVlanNetworks(formSearch: FormSearchNetwork) {
    let params = new HttpParams()
    if (formSearch.vlanName != undefined || formSearch.vlanName != null) {
      params = params.append('vlanName', formSearch.vlanName)
    }
    if (formSearch.networktAddress != undefined || formSearch.networktAddress != null) {
      params = params.append('networktAddress', formSearch.networktAddress)
    }
    if (formSearch.region != undefined || formSearch.region != null) {
      params = params.append('region', formSearch.region)
    }
    if (formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId);
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.pageNumber != undefined || formSearch.pageNumber != null) {
      params = params.append('pageNumber', formSearch.pageNumber)
    }
    return this.http.get<BaseResponse<NetWorkModel[]>>(this.apiGwUrl + this.ENDPOINT.provisions + '/vlans/vlannetworks', {
      headers: this.getHeaders(),
      params: params
    })
  }

  getVlanById(vlanId: number) {
    return this.http.get<BaseResponse<NetWorkModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/' + vlanId, {
      headers: this.getHeaders()
    });
  }

  getPortByNetwork(networkId: string, region: number) {
    let params = new HttpParams()
    if (networkId != undefined || networkId != null) {
      params = params.append('networkId', networkId)
    }
    if (region != undefined || region != null) {
      params = params.append('region', region)
    }
    return this.http.get<Port[]>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/listallportbynetworkid', {
      headers: this.getHeaders(),
      params: params
    })
  }

  getListSubnet(formSearchSubnet: FormSearchSubnet) {
    let params = new HttpParams()
    if (formSearchSubnet.pageSize != undefined || formSearchSubnet.pageSize != null) {
      params = params.append('pageSize', formSearchSubnet.pageSize)
    }
    if (formSearchSubnet.pageNumber != undefined || formSearchSubnet.pageNumber != null) {
      params = params.append('pageNumber', formSearchSubnet.pageNumber)
    }
    if (formSearchSubnet.region != undefined || formSearchSubnet.region != null) {
      params = params.append('region', formSearchSubnet.region)
    }
    if (formSearchSubnet.vlanName != undefined || formSearchSubnet.vlanName != null) {
      params = params.append('vlanName', formSearchSubnet.vlanName)
    }
    if (formSearchSubnet.customerId != undefined || formSearchSubnet.customerId != null) {
      params = params.append('customerId', formSearchSubnet.customerId)
    }
    if (formSearchSubnet.networkId != undefined || formSearchSubnet.networkId != null) {
      params = params.append('networkId', formSearchSubnet.networkId);
    }
    if (formSearchSubnet.vpcId != undefined || formSearchSubnet.vpcId != null) {
      params = params.append('vpcId', formSearchSubnet.vpcId);
    }
    return this.http.get<BaseResponse<Subnet[]>>(this.apiGwUrl + this.ENDPOINT.provisions + '/vlans/vlansubnets', {
      headers: this.getHeaders(),
      params: params
    })
  }

}
