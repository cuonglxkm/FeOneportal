import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  FormCreateL7Policy, FormCreateL7Rule,
  FormOrder,
  FormSearchListBalancer, FormUpdateL7Policy,
  FormUpdateLB,
  FormUpdatePool,
  IPBySubnet,
  L7Policy, L7Rule,
  LoadBalancerModel,
  m_LBSDNListener,
  Pool
} from '../models/load-balancer.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoadBalancerService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');

  constructor(private http: HttpClient,
              private router: Router) {
    super();
  }

  search(formSearch: FormSearchListBalancer) {
    let params = new HttpParams();
    if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId);
    }
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId);
    }
    if (formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name);
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize);
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage);
    }
    formSearch.isCheckState = true;
    params = params.append('isCheckState', formSearch.isCheckState);

    return this.http.get<BaseResponse<LoadBalancerModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/list-paging', {
      params: params
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  totalAmount(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.orders + '/totalamount', data).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      })
    );
  }

  createLoadBalancer(formCreate: FormOrder) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.orders, formCreate).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      })
    );
  }

  updateLoadBalancer(formUpdate: FormUpdateLB) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer', Object.assign(formUpdate)).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      })
    );
  }

  getIPBySubnet(subnetId: string, projectId: number, regionId: number) {
    return this.http.get<IPBySubnet[]>(this.baseUrl + this.ENDPOINT.provisions +
      `/Ip/subnet-ips?subnetId=${subnetId}&projectId=${projectId}&regionId=${regionId}`).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      })
    );
  }

  getLoadBalancerById(id: number, isCheckState: boolean) {
    return this.http.get<LoadBalancerModel>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/${id}?isCheckState=${isCheckState}`).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      })
    );
  }

  deleteLoadBalancer(id: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer?id=${id}`).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
        // Redirect to login page or show unauthorized message
        this.router.navigate(['/passport/login']);
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  getListenerInLB(idLB) {
    return this.http.get<m_LBSDNListener[]>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/lb-listeners?idLB=${idLB}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  checkIpAddress(subnetCloudId: string, vipAddress: string, regionId: number, vpcId: number) {
    return this.http.get<boolean>(this.baseUrl +
      this.ENDPOINT.provisions + `/loadbalancer/checkvipaddress?subnetCloudId=${subnetCloudId}&vipAddress=${vipAddress}&regionId=${regionId}&vpcId=${vpcId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getListPoolInLB(lbId: number) {
    return this.http.get<Pool[]>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/lb_listpool?lbId=${lbId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  createL7Policy(formCreateL7: FormCreateL7Policy) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/l7policy', Object.assign(formCreateL7))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  createPool(data: any): Observable<any> {
    let url_ = `/loadbalancer/pool`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data
    );
  }

  updatePool(idPool: string, formUpdate: FormUpdatePool) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/pool/${idPool}`, Object.assign(formUpdate))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  deletePool(idPool: string, regionId: number, vpcId: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/pool/${idPool}?regionId=${regionId}&vpcId=${vpcId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getPoolDetail(id: string, lbId: number): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
      this.ENDPOINT.provisions +
      `/loadbalancer/pool/${id}?lbId=${lbId}`
    );
  }

  getListHealth(regionId: number, projectId: number, poolId: string, pageSize: number, currentPage: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions +
      `/loadbalancer/listHealth?regionId=${regionId}&projectId=${projectId}&poolId=${poolId}&pageSize=${pageSize}&currentPage=${currentPage}`
    );
  }

  createHealth(data: any): Observable<any> {
    let url_ = `/loadbalancer/createHealth`;
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }

  updateHealth(data: any): Observable<any> {
    let url_ = `/loadbalancer/updateHealth`;
    return this.http.put<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }

  deleteHealth(id: string, regionId: number, projectId: number): Observable<boolean> {
    let url_ = `/loadbalancer/deleteHealth?id=${id}&regionId=${regionId}&projectId=${projectId}`;
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getListMember(poolId: string, regionId: number, vpcId: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions +
      `/loadbalancer/listmember?poolId=${poolId}&regionId=${regionId}&vpcId=${vpcId}`
    );
  }

  createMember(data: any): Observable<any> {
    let url_ = `/loadbalancer/member`;
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }

  updateMember(data: any): Observable<any> {
    let url_ = `/loadbalancer/member`;
    return this.http.put<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }

  deleteMember(id: string, poolid: string, regionId: number, vpcId: number): Observable<boolean> {
    let url_ = `/loadbalancer/member/${id}?poolid=${poolid}&regionId=${regionId}&vpcId=${vpcId}`;
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getDetailL7Policy(idL7Policy: string, regionId: number, vpcId: number) {
    return this.http.get<L7Policy>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7policy/${idL7Policy}?regionId=${regionId}&vpcId=${vpcId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getListL7Policy(regionId: number, vpcId: number, listenerId: string) {
    return this.http.get<L7Policy[]>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7policy?regionId=${regionId}&vpcId=${vpcId}&listenerId=${listenerId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  updateL7Policy(idL7Policy: string, formUpdate: FormUpdateL7Policy) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7policy/${idL7Policy}`, Object.assign(formUpdate))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  createL7Rule(formCreateL7Rule: FormCreateL7Rule) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/l7rule', Object.assign(formCreateL7Rule))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getListL7Rule(regionId: number, vpcId: number, l7PolicyId: string) {
    return this.http.get<L7Rule[]>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7rule?regionId=${regionId}&vpcId=${vpcId}&policyId=${l7PolicyId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getDetailL7Rule(idRule: string, idL7Policy: string, regionId: number, vpcId: number) {
    return this.http.get<L7Rule>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7Rule/${idRule}?${idL7Policy}&regionId=${regionId}&vpcId=${vpcId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  updateL7Rule(formUpdate: FormCreateL7Rule, idRule: string) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7rule/${idRule}`, Object.assign(formUpdate))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  deleteL7Rule(idRule: string, idL7Policy: string, regionId: number, vpcId: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7rule/${idRule}?l7policyId=${idL7Policy}&regionId=${regionId}&vpcId=${vpcId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  deleteL7Policy(idL7Policy: string, regionId: number, vpcId: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/l7policy/${idL7Policy}?regionId=${regionId}&vpcId=${vpcId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getListSubnetInternetFacing(projectId: number, region: number) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/subnet?projectId=${projectId}&region=${region}`, null)
  }
  attachOrDetachIpFloating(ipId: number, idLb: number, regionId: number, vpcId: number, vipPortId: string){
    let param = new HttpParams()
    if(vipPortId != undefined && vipPortId != null) param.append('vipPortId', vipPortId)
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/floatinglb?ipId=${ipId}&idLb=${idLb}&regionId=${regionId}&vpcId=${vpcId}`, null, {
      params: param
    })
  }

  getPortByInstance(instanceId: number, region: number): Observable<any> {
    let url_ = `/instances/port?instanceId=${instanceId}&region=${region}`;
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }
}
