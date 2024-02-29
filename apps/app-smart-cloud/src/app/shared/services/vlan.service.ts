import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {
  FormCreateNetwork, FormCreatePort, FormCreateSubnet,
  FormSearchNetwork,
  FormSearchSubnet, FormUpdateSubnet,
  NetWorkModel,
  Port,
  Subnet
} from '../models/vlan.model';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class VlanService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

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

  getPortByNetwork(networkId: string, region: number, pageSize: number, pageNumber: number, name: string) {
    let params = new HttpParams()
    if (networkId != undefined || networkId != null) {
      params = params.append('networkId', networkId)
    }
    if (region != undefined || region != null) {
      params = params.append('region', region)
    }
    if (pageSize != undefined || pageSize != null) {
      params = params.append('pageSize', pageSize)
    }
    if(pageNumber != undefined || pageNumber != null) {
      params = params.append('pageNumber', pageNumber)
    }
    if(name != undefined || name != null) {
      params = params.append('name', name)
    }
    return this.http.get<BaseResponse<Port[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/findportbynetworkid', {
      headers: this.getHeaders(),
      params: params
    })
  }

  getSubnetByNetwork(formSearchSubnet: FormSearchSubnet) {
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
    if (formSearchSubnet.name != undefined || formSearchSubnet.name != null) {
      params = params.append('name', formSearchSubnet.name)
    }
    if (formSearchSubnet.customerId != undefined || formSearchSubnet.customerId != null) {
      params = params.append('customerId', formSearchSubnet.customerId)
    }
    if (formSearchSubnet.networkId != undefined || formSearchSubnet.networkId != null) {
      params = params.append('networkId', formSearchSubnet.networkId)
    }
    return this.http.get<BaseResponse<Subnet[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlansubnets', {
      headers: this.getHeaders(),
      params: params
    })
  }

  getVlanByNetworkId(idNetwork) {
    return this.http.get<NetWorkModel>(this.baseUrl + this.ENDPOINT.provisions + `/vlans/${idNetwork}`, {
      headers: this.getHeaders()
    })
  }

  createNetwork(formCreate: FormCreateNetwork) {
    return this.http.post<NetWorkModel>(this.baseUrl + this.ENDPOINT.provisions + '/vlans', Object.assign(formCreate), {
      headers: this.getHeaders()
    })
  }

  updateNetwork(idNetwork: number, networkName: string) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vlans/${idNetwork}?networkName=${networkName}`, null,{
      headers: this.getHeaders()
    })
  }

  deleteNetwork(idNetwork: number){
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlannetworks/${idNetwork}`, {
      headers: this.getHeaders()
    })
  }

  getSubnetById(idSubnet) {
    return this.http.get<Subnet>(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/${idSubnet}`, {
      headers: this.getHeaders()
    })
  }

  createSubnet(formCreateSubnet: FormCreateSubnet) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlansubnets', Object.assign(formCreateSubnet), {
      headers: this.getHeaders()
    })
  }

  updateSubnet(idSubnet: number, formUpdateSubnet: FormUpdateSubnet) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/${idSubnet}`, Object.assign(formUpdateSubnet), {
      headers: this.getHeaders()
    })
  }

  deleteSubnet(idSubnet){
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/${idSubnet}`, {
      headers: this.getHeaders()
    })
  }

  createPort(formCreatePort: FormCreatePort) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/createport', Object.assign(formCreatePort), {
      headers: this.getHeaders()
    })
  }

  attachPort(portId: string, instanceId: string, region: number, vpcId: number) {
    let params = new HttpParams()
    if(portId) {
      params = params.append('portCloudId', portId)
    }
    if(instanceId) {
      params = params.append('instaceCloudId', instanceId)
    }
    if(region) {
      params = params.append('region', region)
    }
    if(vpcId) {
      params = params.append('vpcId', vpcId)
    }
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/attachport', null, {
      headers: this.getHeaders(),
      params: params
    })
  }

  detachPort(portId: string, region: number, vpcId: number) {
    let params = new HttpParams()
    if(portId) {
      params = params.append('portCloudId', portId)
    }
    if(region) {
      params = params.append('region', region)
    }
    if(vpcId) {
      params = params.append('vpcId', vpcId)
    }

    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/detachport', null, {
      headers: this.getHeaders(),
      params: params
    })
  }

  deletePort(portId: string, region: number, vpcId: number) {
    let params = new HttpParams()
    if(portId) {
      params = params.append('portCloudId', portId)
    }
    if(region) {
      params = params.append('region', region)
    }
    if(vpcId) {
      params = params.append('vpcId', vpcId)
    }

    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/deleteport', null, {
      headers: this.getHeaders(),
      params: params
    })
  }
}
