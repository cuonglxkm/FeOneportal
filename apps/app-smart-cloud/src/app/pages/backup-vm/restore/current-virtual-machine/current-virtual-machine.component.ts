import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import Flavor from "../../../../shared/models/flavor.model";
import Image from "../../../../shared/models/image";
import {Location} from "@angular/common";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";
import {BackupVm, RestoreFormCurrent} from "../../../../shared/models/backup-vm";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";

@Component({
    selector: 'one-portal-current-virtual-machine',
    templateUrl: './current-virtual-machine.component.html',
    styleUrls: ['./current-virtual-machine.component.less'],
})
export class CurrentVirtualMachineComponent implements OnInit {
    @Input() region: number
    @Input() project: number
    @Input() backupVmId: number

    backupVm: BackupVm

    userId: number

    isLoading: boolean = false

    securityGroupName: string

    securityGroup = []

    form: RestoreFormCurrent = new RestoreFormCurrent()

    constructor(private location: Location,
                private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private backupVmService: BackupVmService,
                private notification: NzNotificationService,
                private router: Router
    ) {
    }

    ngOnInit(): void {
        this.getDetail(this.backupVmId)
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/backup-vm'])
    }

    getDetail(id: number) {
        this.userId = this.tokenService.get()?.userId
        this.backupVmService.detail(id, this.userId).subscribe(data => {
            if (data) {
                this.backupVm = data
                this.backupVm.securityGroupBackups.forEach(item => {
                    this.securityGroup.push(item.sgName)
                })
                this.securityGroupName = this.securityGroup.join('\n')
            }
            console.log('backupvm', this.backupVm)
        })
        console.log('backupvm id', this.backupVmId)
    }

    restoreCurrent() {
        this.form.customerId = this.tokenService.get()?.userId
        this.form.instanceBackupId = this.backupVmId
        this.isLoading = true;
        console.log('this.form', this.form)
        this.backupVmService.restoreCurrentBackupVm(this.form).subscribe(data => {
            this.isLoading = false
            this.notification.success('Thành công', 'Restore thành công')
            this.router.navigate(['/app-smart-cloud/backup-vm'])
        }, error => {
            this.isLoading = false
            this.notification.error('Thất bại', 'Restore thất bại')
        })
    }
}
