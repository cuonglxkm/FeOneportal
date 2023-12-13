import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {
  CopyUserPolicies,
  GroupCreateUser,
  PermissionPolicies,
  PoliciesOfUser,
  User,
  UserModel
} from '../models/user.model';
import {FormSearchUserGroup, UserGroupModel} from "../models/user-group.model";
import Pagination from "../models/pagination";

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');

  constructor(private http: HttpClient) {
    super();
  }

  search(
    userName: string,
    pageSize: number,
    pageNumber: number
  ): Observable<any> {
    if (userName == undefined) userName = '';
    let url_ = `/users?userName=${userName}&pageSize=${pageSize}&pageNumber=${pageNumber}`
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  }

  create(data: any): Observable<any> {
    let url_ = `/users`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.iam + url_, data);
  }


  deleteUser(userName: string): Observable<any> {
    let url_ = `/users/${userName}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  }

  // deleteUsers(userNames: string[]): Observable<any> {
  //   let url_ = `/users`;
  //   url_ = url_.replace(/[?&]$/, '');

  //   return this.http.delete<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  // }

  getGroupsCreateUser(): Observable<BaseResponse<GroupCreateUser[]>> {
    return this.http.get<BaseResponse<GroupCreateUser[]>>('/groupCreateUsers');
  }

  getCopyUserPolicies(): Observable<BaseResponse<CopyUserPolicies[]>> {
    return this.http.get<BaseResponse<CopyUserPolicies[]>>('/copyUserPlicies');
  }

  getPermissionPolicies(): Observable<BaseResponse<PermissionPolicies[]>> {
    return this.http.get<BaseResponse<PermissionPolicies[]>>('/permissionPolicies');
  }

  getPoliciesOfUser(): Observable<BaseResponse<PoliciesOfUser[]>> {
    return this.http.get<BaseResponse<PoliciesOfUser[]>>('/policiesOfUser');
  }

  search(form: FormSearchUserGroup) {
    let params = new HttpParams();
    if (form.name != null) {
      params = params.append('groupName', form.name)
    }
    if(form.pageSize != null) {
      params = params.append('pageSize', form.pageSize);
    }
    if(form.currentPage != null) {
      params = params.append('currentPage', form.currentPage);
    }
    return this.http.get<BaseResponse<UserModel[]>>( this.baseUrl + this.ENDPOINT.iam + '/users', {
      headers: this.httpOptions.headers,
      params: params
    })
  }
}
