import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {
    BackupPackage,
    BackupVm,
    BackupVMFormSearch,
    CreateBackupVmOrderData,
    RestoreFormCurrent,
    VolumeAttachment
} from "../models/backup-vm";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {catchError} from "rxjs/internal/operators/catchError";

@Injectable({
    providedIn: 'root'
})

export class BackupVmService extends BaseService {

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

    search(form: BackupVMFormSearch) {
        let params = new HttpParams();
        if (form.customerId != null || form.customerId != undefined) {
            params = params.append('customerId', form.customerId);
        }
        if (form.projectId != null) {
            params = params.append('projectId', form.projectId);
        }
        if (form.regionId != null) {
            params = params.append('regionId', form.regionId);
        }
        if (form.status != null) {
            params = params.append('status', form.status);
        }
        if (form.instanceBackupName != null) {
            params = params.append('instanceBackupName', form.instanceBackupName);
        }
        params = params.append('pageSize', form.pageSize);
        params = params.append('currentPage', form.currentPage);

        return this.http.get<Pagination<BackupVm>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/intances', {
            headers: this.getHeaders(),
            params: params
        })
    }

    detail(id: number) {
        return this.http.get<BackupVm>(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/${id}`, {
            headers: this.getHeaders()
        })
    }

    delete(id: number) {
        return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/${id}`, {
            headers: this.getHeaders()
        })
            .pipe(catchError(this.errorCode))
    }

    restoreCurrentBackupVm(form: RestoreFormCurrent) {
        return this.http.post(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/restore`, Object.assign(form), {
            headers: this.getHeaders()
        })
    }

    getVolumeInstanceAttachment(id: number) {
        return this.http.get<VolumeAttachment[]>(this.baseUrl + this.ENDPOINT.provisions + `/instances/${id}/instance-attachments`, {headers: this.getHeaders()})
    }

    getBackupPackages(customerId: number) {
        return this.http.get<BackupPackage[]>(this.baseUrl + this.ENDPOINT.provisions + `/backups/packages?customerId=${customerId}`, {headers: this.getHeaders()})
    }

    create(data: CreateBackupVmOrderData) {
        return this.http.post<BackupVm>(this.baseUrl + this.ENDPOINT.orders, Object.assign(data), {
            headers: this.getHeaders()
        })
    }
}
