import {Inject, Injectable} from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CopyUserPolicies, GroupCreateUser, PermissionPolicies, PoliciesOfUser, User } from '../models/user.model';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token }),
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  search(
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (userName == undefined) userName = '';
    let url_ = `/users?userName=${userName}&pageSize=${pageSize}&currentPage=${currentPage}`
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, {
      headers: this.httpOptions.headers
    });
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

  getGroups(
    groupName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (groupName == undefined) groupName = '';
    let url_ = `/groups?groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  }

  getPolicies(
    policyName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (policyName == undefined) policyName = '';
    let url_ = `/policies?policyName=${policyName}&pageSize=${pageSize}&currentPage=${currentPage}`
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  }

  // getPoliciesOfUser(
  //   userName: string
  // ): Observable<any> {
  //   let url_ = `/users/${userName}/policies`
  //   return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_);
  // }

  getGroupsCreateUser(): Observable<BaseResponse<GroupCreateUser[]>> {
    return this.http.get<BaseResponse<GroupCreateUser[]>>('/groupCreateUsers');
  }

  getPoliciesOfUser(): Observable<BaseResponse<PoliciesOfUser[]>> {
    return this.http.get<BaseResponse<PoliciesOfUser[]>>('/policiesOfUser');
  }
}
