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

  // getData(): Observable<BaseResponse<ActionHistoryModel[]>> {
  //   return this.http.get<BaseResponse<ActionHistoryModel[]>>(
  //     this.baseUrl +
  //       '/actionlogs?email=' +
  //       email +
  //       '&action=' +
  //       action +
  //       '&resourceName=' +
  //       resourceName +
  //       '&resourceType=' +
  //       resourceType +
  //       '&regionId=' +
  //       regionId +
  //       '&fromDate=' +
  //       fromDate +
  //       '&toDate=' +
  //       toDate +
  //       '&pageSize=' +
  //       pageSize +
  //       '&currentPage=' +
  //       currentPage
  //   );
  // }

  getUsers(): Observable<BaseResponse<User[]>> {
    return this.http.get<BaseResponse<User[]>>('/users');
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
