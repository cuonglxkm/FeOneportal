import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormUpdatePackage, PackageBackupModel} from "../models/package-backup.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";

@Injectable({
  providedIn: 'root'
})

export class PackageBackupService extends BaseService {
  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  search(packageName: string) {
    if(packageName == undefined) {
      packageName = ''
    }
    return this.http.get<BaseResponse<PackageBackupModel[]>>(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages?packageName=${packageName}`,
      {headers: this.getHeaders()})
  }

  // update(form: FormUpdatePackage) {
  //   return this.http.put(this.baseUrl + this.ENDPOINT.provisions
  //     + `/backups/packages/${form.id}`,
  //     Object.assign(form),
  //     {headers: this.getHeaders()})
  // }

  detail(id: number) {
    return this.http.get<PackageBackupModel>(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${id}`,
      {headers: this.getHeaders()})
  }

  delete(id: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${id}`, {headers: this.getHeaders()})
  }

}
