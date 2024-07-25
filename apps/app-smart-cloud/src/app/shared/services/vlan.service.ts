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
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})

export class VlanService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  private reloadSubject = new BehaviorSubject<boolean>(false);

  reloadObservable = this.reloadSubject.asObservable();

  triggerReload() {
    this.reloadSubject.next(true);
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
    if (formSearch.project != undefined || formSearch.project != null) {
      params = params.append('projectId', formSearch.project)
    }
    return this.http.get<BaseResponse<NetWorkModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlannetworks', {
      params: params,
      headers: this.getHeaders().headers
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
      params: params,
      headers: this.getHeaders().headers
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
    if (formSearchSubnet.vpcId != undefined || formSearchSubnet.vpcId != null) {
      params = params.append('vpcId', formSearchSubnet.vpcId)
    }
    return this.http.get<BaseResponse<Subnet[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlansubnets', {
      params: params,
      headers: this.getHeaders().headers
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

  getVlanByNetworkId(idNetwork, projectId: number) {
    return this.http.get<NetWorkModel>(this.baseUrl + this.ENDPOINT.provisions + `/vlans/${idNetwork}?projectId=${projectId}`, {
      headers: this.getHeaders().headers
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

  createNetwork(formCreate: FormCreateNetwork) {
    return this.http.post<NetWorkModel>(this.baseUrl + this.ENDPOINT.provisions + '/vlans', Object.assign(formCreate), {
      headers: this.getHeaders().headers
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

  updateNetwork(idNetwork: number, networkName: string) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vlans/${idNetwork}?networkName=${networkName}`, {
      body: null
    }, {headers: this.getHeaders().headers}).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  deleteNetwork(idNetwork: number){
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlannetworks/${idNetwork}`, {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  getSubnetById(idSubnet) {
    return this.http.get<Subnet>(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/${idSubnet}`, {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  createSubnet(formCreateSubnet: FormCreateSubnet) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/vlansubnets',
      Object.assign(formCreateSubnet), {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  updateSubnet(idSubnet: number, formUpdateSubnet: FormUpdateSubnet) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/${idSubnet}`, Object.assign(formUpdateSubnet), {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  deleteSubnet(idSubnet){
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/${idSubnet}`, {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  createPort(formCreatePort: FormCreatePort) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vlans/createport',
      Object.assign(formCreatePort), {headers: this.getHeaders().headers}).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
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
      params: params,
      headers: this.getHeaders().headers
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
      params: params,
      headers: this.getHeaders().headers
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
      params: params,
      headers: this.getHeaders().headers
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

  getListVlanSubnets(pageSize: number, pageNumber: number, region: number, projectId: number) {
    return this.http.get<BaseResponse<Subnet[]>>(this.baseUrl + this.ENDPOINT.provisions
      + `/vlans/vlansubnets?pageSize=${pageSize}&pageNumber=${pageNumber}&region=${region}&vpcId=${projectId}`, {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  checkAllocationPool(cidr: string) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + `/vlans/vlansubnets/calculateiprange?cidr=${cidr}`,
      { responseType: 'json', headers: this.getHeaders().headers }
    ).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  checkIpAvailable(ip: string, cidr: string, networkId: string, regionId: number) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + `/vlans/CheckIpAvailable?ip=${ip}&cidr=${cidr}&networkId=${networkId}&regionId=${regionId}`, {
      headers: this.getHeaders().headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }

  checkDeleteNetwork(networkId) {
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + `/vlans/checkdeletenetwork?networkId=${networkId}`, {
      headers: this.getHeaders().headers,
      responseType: 'text'
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }

  checkDeleteSubnet(subnetId) {
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + `/vlans/checkdeletesubnet?subnetId=${subnetId}`, {
      headers: this.getHeaders().headers,
      responseType: 'text'
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }
}
