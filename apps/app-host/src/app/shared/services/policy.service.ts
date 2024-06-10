import {Inject, Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class PolicyService  {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.tokenService.get()?.token,
      'User-Root-Id': localStorage?.getItem('UserRootId') && Number(localStorage?.getItem('UserRootId')) > 0 ? Number(localStorage?.getItem('UserRootId')) : this.tokenService?.get()?.userId,
    })
  };

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {

  }

  async getUserPermissions() {
    localStorage.removeItem('PermissionOPA')
    var result = await this.http.get<any>(environment.baseUrl + '/iam/permissions/user', this.httpOptions).toPromise();
    return result;
  }

  async hasPermission(action: string): Promise<boolean> {
    if (localStorage.getItem('PermissionOPA') != null) {
      var permission = JSON.parse(localStorage.getItem('PermissionOPA') || '{}');
      return this.isPermission(action, permission);
    } else if(localStorage?.getItem('UserRootId')) {
      var permissions = await this.getUserPermissions();
      localStorage.setItem('PermissionOPA', JSON.stringify(permissions));
      return this.isPermission(action, permissions);
    } else {
      return true;
    }
  }

  isPermission(action: string, permission: any): boolean {
    if(permission['IsAdmin']){
      return true;
    }
    if(permission['Permissions']){
      let actionItems = action.split(":");
      let denyActions = permission['Permissions']['DenyActions'] ? permission['Permissions']['DenyActions'] : [];
      let allowActions = permission['Permissions']['AllowActions'] ? permission['Permissions']['AllowActions'] : [];
      if(denyActions.includes(action) || denyActions.includes(actionItems[0] + ":*")){
        return false;
      }
      if(allowActions.includes(action) || allowActions.includes(actionItems[0] + ":*")){
        return true;
      }
    }
    return false;
  }
}
