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
import {User} from "../models/user.model";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import { BaseResponse } from "../models/base-response";
import { PolicyModel } from "../models/policy.model";

@Injectable({
    providedIn: 'root'
})

export class UserGroupService extends BaseService {

    constructor(public http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
            'Authorization': 'Bearer ' + this.tokenService.get()?.token
        })
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
            headers: this.getHeaders(),
            params: params
        })
    }

    detail(name: string) {
        return this.http.get<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + `/groups/${name}`, {
            headers: this.getHeaders()
        })
    }

    delete(nameGroup: string[]) {
        let url_ = `/groups?`;
        nameGroup?.forEach(e => {
            url_ += `groupNames=${e}&`;
        })
        url_ = url_.replace(/[?&]$/, '');
        return this.http.delete<any>(this.baseUrl + this.ENDPOINT.iam + url_,
            {headers: this.getHeaders()});
    }

    getUserByGroup(userName: string, groupName: string, pageSize: number, currentPage: number) {
      if (userName == undefined) {
        userName = ''
      }
      let url_ = `/users/group?userName=${userName}&groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`;
      return this.http.get<BaseResponse<User[]>>(this.baseUrl + this.ENDPOINT.iam + url_, {
            headers: this.getHeaders()
      })
    }

    createOrEdit(formCreate: FormUserGroup) {
        return this.http.post<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + '/groups', Object.assign(formCreate), {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
    }

    removeUsers(groupName: string, usersList: string[]) {
        return this.http.put(this.baseUrl + this.ENDPOINT.iam + `/groups/${groupName}/remove-users`,
            Object.assign(usersList),
            {
                headers: this.getHeaders(),
            })
    }

    removePolicy(removePolicy: RemovePolicy) {
        return this.http.put(this.baseUrl + this.ENDPOINT.iam + `/groups/Detach`,
            Object.assign(removePolicy),
            {
                headers: this.getHeaders(),
            })
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
            headers: this.getHeaders(),
            params: params
        })
    }

    getName() {
        return this.http.get<string[]>(this.baseUrl + this.ENDPOINT.iam + '/groups/names',
            {headers: this.getHeaders()})
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
            headers: this.getHeaders(),
            params: params
        })
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side errors
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side errors
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error && error.error.details) {
          // Lấy thông tin chi tiết lỗi từ response
          errorMessage += `\nDetails: ${error.error.details}`;
        }
      }

      console.error(errorMessage);

      return throwError(errorMessage);
    }
}
