import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {
    FormDeleteOneUserGroup, FormDeleteUserGroups,
    FormEditUserGroup,
    FormSearchUserGroup,
    UserGroupModel
} from "../models/user-group.model";
import {UserModel} from "../models/user.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";

@Injectable({
    providedIn: 'root'
})

export class UserGroupService extends BaseService {

    constructor(public http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        })
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
        return this.http.get<Pagination<UserGroupModel>>( this.baseUrl + this.ENDPOINT.iam + '/groups', {
            headers: this.getHeaders(),
            params: params
        })
    }

    detail(name: string) {
        return this.http.get<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + `/groups/${name}`)
    }

    edit(groupName: string, form: FormEditUserGroup) {
        return this.http.put<UserGroupModel>(this.baseUrl + this.ENDPOINT.iam + `/groups/groupName?groupName=${groupName}`, Object.assign(form))
    }

    deleteOne(form: FormDeleteOneUserGroup) {
        return this.http.delete(this.baseUrl + this.ENDPOINT.iam + `/groups/${form.userName}?groupName=${form.groupName}`)
    }

    deleteMany(form: FormDeleteUserGroups) {
        return this.http.delete(this.baseUrl + this.ENDPOINT.iam + `/groups?groupName=${form}`)
    }

    getUserByGroup(groupName: string) {
        return this.http.get<BaseResponse<UserModel[]>>(this.baseUrl + this.ENDPOINT.iam + `/users/${groupName}`)
    }
}
