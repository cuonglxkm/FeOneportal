import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
        'user_root_id': this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  search(
    userName: string,
    pageSize: number,
    currentPage: number,
  ): Observable<any> {
    if (userName == undefined) userName = '';
    let url_ = `/users?userName=${userName}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  getUserByUsername(
    userName: string,
  ): Observable<any> {
    let url_ = `/users/${userName}`;

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  createOrUpdate(data: any): Observable<any> {
    let url_ = `/users`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.iam + url_, data, this.httpOptions);
  }

  deleteUsers(userNames: string[]): Observable<any> {
    let url_ = `/users?`;
    userNames.forEach((e) => {
      url_ += `userNames=${e}&`;
    });
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  getGroups(
    groupName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (groupName == undefined) groupName = '';
    let url_ = `/groups?groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  getGroup(
    groupName: string,
  ): Observable<any> {
    let url_ = `/groups/${groupName}`;

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  getPolicies(
    policyName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (policyName == undefined) policyName = '';
    let url_ = `/policies?policyName=${policyName}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  getPolicy(
    policyName: string,
  ): Observable<any> {
    let url_ = `/policies/${policyName}`;

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  getUsersOfGroup(
    groupName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    let url_ = `/users/group?groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`;
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + url_, this.httpOptions);
  }

  detachPoliciesOrGroups(data: any): Observable<any> {
    let url_ = `/users/Detach`;
    return this.http.put<any>(this.baseUrl + this.ENDPOINT.iam + url_, data, this.httpOptions);
  }
}
