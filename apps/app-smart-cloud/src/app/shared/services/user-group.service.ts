import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {
  BackupPackage,
  BackupVm,
  BackupVMFormSearch,
  FormCreateBackup,
  RestoreFormCurrent,
  VolumeAttachment
} from "../models/backup-vm";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import { catchError } from "rxjs/internal/operators/catchError";
import {UserGroupModel} from "../models/user-group.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {PermissionPolicies} from "../models/user.model";

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
  getAll() {
    return this.http.get<UserGroupModel[]>('/iam/groups')
  }

}
