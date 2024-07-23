import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }

  search(
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (userName == undefined) userName = '';
    let url_ = `/users?userName=${userName}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getUserByUsername(userName: string): Observable<any> {
    let url_ = `/users/${userName}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getUserById(id: number): Observable<any> {
    let url_ = `/users/${id}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.users + url_,
      this.getHeaders()
    );
  }

  getCustomerGroup(): Observable<any> {
    let url_ = `/customer-group`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.users + url_,
      this.getHeaders()
    );
  }

  createOrUpdate(data: any): Observable<any> {
    let url_ = `/users`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      data,
      this.getHeaders()
    );
  }

  deleteUsers(userNames: Set<string>): Observable<any> {
    let url_ = `/users?`;
    userNames.forEach((e) => {
      url_ += `userNames=${e}&`;
    });
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getGroups(
    groupName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (groupName == undefined) groupName = '';
    let url_ = `/groups?groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getGroup(groupName: string): Observable<any> {
    let url_ = `/groups/${groupName}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getPolicies(
    policyName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (policyName == undefined) policyName = '';
    let url_ = `/policies?policyName=${policyName}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getPolicy(policyName: string): Observable<any> {
    let url_ = `/policies/${policyName}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  getUsersOfGroup(
    groupName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    let url_ = `/users/group?groupName=${groupName}&pageSize=${pageSize}&currentPage=${currentPage}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      this.getHeaders()
    );
  }

  detachPoliciesOrGroups(data: any): Observable<any> {
    let url_ = `/users/Detach`;
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.iam + url_,
      data,
      this.getHeaders()
    );
  }
}
