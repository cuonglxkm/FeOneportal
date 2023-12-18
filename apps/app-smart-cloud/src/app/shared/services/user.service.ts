import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CopyUserPolicies, GroupCreateUser, PermissionPolicies, PoliciesOfUser, User } from '../models/user.model';

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

  deleteUsers(userNames: string[]): Observable<any> {
    let url_ = `/users?`;
    userNames.forEach(e => {
      url_ += `userNames=${e}&`;
    })
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  }

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
}
