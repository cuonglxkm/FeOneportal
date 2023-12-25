import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {
  FormDeleteUserGroups,
  FormSearchUserGroup,
  FormUserGroup,
  RemovePolicy,
  UserGroupModel
} from "../models/user-group.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {User} from "../models/user.model";

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
      'user_root_id': this.tokenService.get()?.userId
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

  delete(form: FormDeleteUserGroups) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.iam + `/groups?groupName=${form}`, {
      headers: this.getHeaders()
    })
  }

  getUserByGroup(groupName: string) {
    return this.http.get<BaseResponse<User[]>>(this.baseUrl + this.ENDPOINT.iam + `/users/group/${groupName}`, {
      headers: this.getHeaders()
    })
  }

  createOrEdit(formCreate: FormUserGroup) {
    return this.http.post<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + '/groups', Object.assign(formCreate), {
      headers: this.getHeaders()
    })
  }

  removeUsers(groupName: string, usersList: string[]) {
    return this.http.put(this.baseUrl + this.ENDPOINT.iam + `/groups/${groupName}/remove-users`, {
      headers: this.getHeaders(),
    }, Object.assign(usersList))
  }

  removePolicy(removePolicy: RemovePolicy) {
    return this.http.put(this.baseUrl + this.ENDPOINT.iam + `/groups/remove-users`, {
      headers: this.getHeaders(),
    }, Object.assign(removePolicy))
  }

}
