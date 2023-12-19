import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {BackupPackage, BackupVm, BackupVMFormSearch, VolumeAttachment} from "../../../../shared/models/backup-vm";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";
import {BackupSchedule, FormSearchScheduleBackup} from "../../../../shared/models/schedule.model";
import {ScheduleService} from "../../../../shared/services/schedule.service";
import {AppValidator, BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {InstancesService} from "../../../instances/instances.service";
import {InstancesModel} from "../../../instances/instances.model";

@Component({
    selector: 'one-portal-schedule-backup-vm',
    templateUrl: './schedule-backup-vm.component.html',
    styleUrls: ['./schedule-backup-vm.component.less'],
})
export class ScheduleBackupVmComponent implements OnInit {
    @Input() region: number
    @Input() project: number

    isLoading: boolean = false
    validateForm: FormGroup<{
        backupMode: FormControl<string>
        name: FormControl<string>
        backupPackage: FormControl<number>
        description: FormControl<string>
        instanceId: FormControl<number>
        months: FormControl<number>
        times: FormControl<string>
        numberOfWeek: FormControl<string>
        date: FormControl<string>
        maxBackup: FormControl<number>
        volumeToBackupIds: FormControl<number[] | null>
        daysOfWeek: FormControl<string[] | null>
    }> = this.fb.group({
        backupMode: ['4', [Validators.required]],
        name: [null as string, [Validators.required]],
        backupPackage: [null as number, [Validators.required]],
        description: [null as string, [Validators.maxLength(700)]],
        instanceId: [null as number, [Validators.required]],
        months: [1, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
        times: [null as string, [Validators.required]],
        numberOfWeek: [null as string],
        date: [null as string, [Validators.required]],
        maxBackup: [null as number, [Validators.required]],
        volumeToBackupIds: [[] as number[]],
        daysOfWeek: [[] as string[]]
    })

    modeType: string = '4'
    numberOfWeekChangeSelected: string

    backupPackages: BackupPackage[] = []

    times = new Date()

    mode = [
        {label: 'Hàng ngày', value: '1'},
        {label: 'Theo thứ', value: '2'},
        {label: 'Theo tuần', value: '3'},
        {label: 'Theo tháng', value: '4'}
    ]

    daysOfWeek = [
        {label: 'Thứ 2', value: '1'},
        {label: 'Thứ 3', value: '2'},
        {label: 'Thứ 4', value: '3'},
        {label: 'Thứ 5', value: '4'},
        {label: 'Thứ 6', value: '5'},
        {label: 'Thứ 7', value: '6'},
        {label: 'Chủ nhật', value: '7'}
    ]
    numberOfWeek = [
        {label: '1 Tuần', value: '1'},
        {label: '2 Tuần', value: '2'},
        {label: '3 Tuần', value: '3'}
    ]

    volumeAttachments: VolumeAttachment[] = []
    lstBackupSchedules: BackupSchedule[]
    response: BaseResponse<BackupSchedule[]>
    formSearch: FormSearchScheduleBackup = new FormSearchScheduleBackup()
    formSearchBackup: BackupVMFormSearch = new BackupVMFormSearch()

    listInstance: InstancesModel[] = []
    listBackupVM: BackupVm[]

    listInstanceNotUse: InstancesModel[] = []
    listInstanceNotUseUnique: InstancesModel[] = []
    instanceSelected: InstancesModel

    constructor(private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService,
                private router: Router,
                private backupVmService: BackupVmService,
                private backupScheduleService: ScheduleService,
                private instanceService: InstancesService) {
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
    }

    submitForm() {
        if (this.validateForm.valid) {

        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
        }
    }

    getBackupPackage() {
        this.backupVmService.getBackupPackages(this.tokenService.get()?.userId).subscribe(data => {
            this.backupPackages = data
            console.log('backup package', this.backupPackages)
        })
    }

    modeChange(value: string) {
        this.validateForm.controls.daysOfWeek.clearValidators();
        this.validateForm.controls.daysOfWeek.markAsPristine();
        this.validateForm.controls.daysOfWeek.reset();

        this.validateForm.controls.numberOfWeek.clearValidators();
        this.validateForm.controls.numberOfWeek.markAsPristine();
        this.validateForm.controls.numberOfWeek.reset();

        this.validateForm.controls.months.clearValidators();
        this.validateForm.controls.months.markAsPristine();
        this.validateForm.controls.months.reset();

        this.validateForm.controls.date.clearValidators();
        this.validateForm.controls.date.markAsPristine();
        this.validateForm.controls.date.reset();
        if (value === '1') {
            this.modeType = '1'
        } else if (value === '2') {
            this.modeType = '2'
            this.validateForm.controls.daysOfWeek.setValidators([Validators.required]);
            this.validateForm.controls.daysOfWeek.markAsDirty();
            this.validateForm.controls.daysOfWeek.reset();
        } else if (value === '3') {
            this.modeType = '3'

            this.validateForm.controls.numberOfWeek.setValidators([Validators.required]);
            this.validateForm.controls.numberOfWeek.markAsDirty();
            this.validateForm.controls.numberOfWeek.reset();
        } else if (value === '4') {
            this.modeType = '4'
            this.validateForm.controls.months.setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
            this.validateForm.controls.months.markAsDirty();
            this.validateForm.controls.months.reset();

            this.validateForm.controls.date.setValidators([Validators.required]);
            this.validateForm.controls.date.markAsDirty();
            this.validateForm.controls.date.reset();
        }
    }

    numberOfWeekChange(value: string) {
        this.numberOfWeekChangeSelected = value
        console.log('weeek', this.numberOfWeekChangeSelected)
    }

    getVolumeInstanceAttachment(id: number) {
        this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
            this.volumeAttachments = data
            console.log('volume attach', this.volumeAttachments)
        })
    }

    checkDuplicateName() {

    }

    getListInstances() {
        let customerId = this.tokenService.get()?.userId
        this.formSearchBackup.pageSize = 10000000
        this.formSearchBackup.currentPage = 1
        this.formSearchBackup.customerId = customerId
        this.instanceService.search(1, 10000000,
            this.region, this.project, "", "",
            false, customerId).subscribe(data => {
            this.listInstance = data?.records
            this.backupVmService.search(this.formSearchBackup).subscribe(data => {
                this.listBackupVM = data.records
                console.log('instance', this.listInstance)
                console.log('backup', this.listBackupVM)
                const idSet = new Set(this.listBackupVM.map(item => item.instanceId));
                const idSetUnique = Array.from(new Set(idSet))
                this.listInstance?.forEach(item1 => {
                    if (!idSetUnique.includes(item1.id)) {
                        if(this.listInstanceNotUse?.length > 0) {
                            this.listInstanceNotUse.push(item1)
                        } else {
                            this.listInstanceNotUse = [item1]
                        }
                    }
                })
            })
        })

    }

    selectInstanceChange(value) {
        // this.instanceSelected = value
        console.log(value)
        this.getVolumeInstanceAttachment(value)
    }

    getListScheduleBackup() {
        this.backupScheduleService.search(this.formSearch).subscribe(data => {
            console.log('data', data)
            this.lstBackupSchedules = data.records
        })
    }

    ngOnInit(): void {
        this.getBackupPackage()
        this.getListInstances()
        // this.getVolumeInstanceAttachment()
    }

}
