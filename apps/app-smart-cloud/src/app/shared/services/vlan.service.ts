import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {FormSearchNetwork, FormSearchSubnet, NetWorkModel, Port, Subnet} from "../models/vlan.model";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BaseResponse} from "../../../../../../libs/common-utils/src";

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
      'user_root_id': this.tokenService.get()?.userId,
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
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.pageNumber != undefined || formSearch.pageNumber != null) {
      params = params.append('pageNumber', formSearch.pageNumber)
    }
    return this.http.get<BaseResponse<NetWorkModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlannetworks', {
      headers: this.getHeaders(),
      params: params
    })
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
    return this.http.get<BaseResponse<Subnet[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlansubnets', {
      headers: this.getHeaders(),
      params: params
    })
  }

}
