import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {
    FormSearchPolicy,
    FormSearchUserGroup,
    FormUserGroup,
    RemovePolicy,
    UserGroupModel
} from "../models/user-group.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {User} from "../models/user.model";
import {PolicyModel} from "../../pages/policy/policy.model";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})

export class UserGroupService extends BaseService {

    constructor(public http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        super();
    }

    search(form: FormSearchUserGroup) {
        let params = new HttpParams();
        if (form.name != null) {
            params = params.append('groupName', form.name)
        }
        if (form.pageSize != null) {
            params = params.append('pageSize', form.pageSize);
        }
        if (form.currentPage != null) {
            params = params.append('currentPage', form.currentPage);
        }
        return this.http.get<Pagination<UserGroupModel>>(this.baseUrl + this.ENDPOINT.iam + '/groups', {
            params: params
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

    detail(name: string) {
        return this.http.get<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + `/groups/${name}`)
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

    delete(nameGroup: string[]) {
        let url_ = `/groups?`;
        nameGroup?.forEach(e => {
            url_ += `groupNames=${e}&`;
        })
        url_ = url_.replace(/[?&]$/, '');
        return this.http.delete<any>(this.baseUrl + this.ENDPOINT.iam + url_)
          .pipe(catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.error('login');
            } else if (error.status === 404) {
              // Handle 404 Not Found error
              console.error('Resource not found');
            }
            return throwError(error);
          }));
    }

    getUserByGroup(userName: string, groupName: string, pageSize: number, currentPage: number) {
      if (userName == undefined) {
        userName = ''
      }
      let url_ = `/users/group?userName=${userName}&groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`;
      return this.http.get<BaseResponse<User[]>>(this.baseUrl + this.ENDPOINT.iam + url_)
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

    createOrEdit(formCreate: FormUserGroup) {
        return this.http.post<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + '/groups', Object.assign(formCreate))
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

    removeUsers(groupName: string, usersList: string[]) {
        return this.http.put(this.baseUrl + this.ENDPOINT.iam + `/groups/${groupName}/remove-users`,
            Object.assign(usersList)).pipe(
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

    removePolicy(removePolicy: RemovePolicy) {
        return this.http.put(this.baseUrl + this.ENDPOINT.iam + `/groups/Detach`,
            Object.assign(removePolicy)).pipe(
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

    getPolicy(formSearch: FormSearchPolicy) {
        let params = new HttpParams()
        if (formSearch.policyName != undefined) {
            params = params.append('policyName', formSearch.policyName)
        }
        if (formSearch.pageSize != null) {
            params = params.append('pageSize', formSearch.pageSize);
        }
        if (formSearch.currentPage != null) {
            params = params.append('currentPage', formSearch.currentPage);
        }
        return this.http.get<BaseResponse<PolicyModel[]>>(this.baseUrl + this.ENDPOINT.iam
            + '/policies', {
            params: params
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

    getName() {
        return this.http.get<string[]>(this.baseUrl + this.ENDPOINT.iam + '/groups/names').pipe(
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

    getPoliciesByGroupName(form: FormSearchPolicy) {
        let params = new HttpParams()
        if(form.policyName != undefined || form.policyName != null) {
            params = params.append('policyName', form.policyName)
        }
        params = params.append('pageSize', form.pageSize);
        params = params.append('currentPage', form.currentPage);
        return this.http.get<BaseResponse<PolicyModel[]>>(this.baseUrl + this.ENDPOINT.iam +
            `/groups/Policies/${form.groupName}`, {
            params: params
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

}
