import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, ValidationErrors, Validators} from "@angular/forms";
import {BackupPackage, BackupVm, BackupVMFormSearch, VolumeAttachment} from "../../../../shared/models/backup-vm";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";
import {BackupSchedule, FormCreateSchedule, FormSearchScheduleBackup} from "../../../../shared/models/schedule.model";
import {ScheduleService} from "../../../../shared/services/schedule.service";
import {BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {InstancesService} from "../../../instances/instances.service";
import {InstancesModel} from "../../../instances/instances.model";
import {DatePipe} from "@angular/common";
import {format} from "date-fns/fp";

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
        times: FormControl<Date>
        numberOfWeek: FormControl<number>
        date: FormControl<number>
        maxBackup: FormControl<number>
        volumeToBackupIds: FormControl<number[] | null>
        daysOfWeek: FormControl<string>
        daysOfWeekMultiple: FormControl<string[]>
    }> = this.fb.group({
        backupMode: ['1', [Validators.required]],
        name: [null as string, [Validators.required,
            Validators.pattern(/^[a-zA-Z0-9_]{1,255}$/),
            this.validateSpecialCharacters.bind(this), this.duplicateNameValidator.bind(this)]],
        backupPackage: [null as number, [Validators.required]],
        description: [null as string, [Validators.maxLength(700)]],
        instanceId: [null as number, [Validators.required]],
        months: [1, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
        times: [new Date(), [Validators.required]],
        numberOfWeek: [null as number],
        date: [1, [Validators.required]],
        maxBackup: [null as number, [Validators.required, Validators.min(1)]],
        volumeToBackupIds: [[] as number[]],
        daysOfWeek: [''],
        daysOfWeekMultiple: [[] as string[]]
    })

    modeType: string = '1'
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
    formCreateSchedule: FormCreateSchedule = new FormCreateSchedule()
    nameList: string[] = []
    interval: string = ''

    constructor(private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService,
                private router: Router,
                private backupVmService: BackupVmService,
                private backupScheduleService: ScheduleService,
                private instanceService: InstancesService,
                public datepipe: DatePipe) {
    }

    validateSpecialCharacters(control) {
        const value = control.value;
        if (/[^a-zA-Z0-9_]/.test(value)) {
            return { invalidCharacters: true };
        } else {
            return null;
        }
    }

    duplicateNameValidator(control) {
        const value = control.value;
        // Check if the input name is already in the list
        if (this.nameList && this.nameList.includes(value)) {
            return { duplicateName: true }; // Duplicate name found
        } else {
            return null; // Name is unique
        }
    }
    goBack() {
        this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
    }

    getData(): FormCreateSchedule {

        this.formCreateSchedule.customerId = this.tokenService.get()?.userId
        this.formCreateSchedule.name = this.validateForm.controls.name.value
        this.formCreateSchedule.description = this.validateForm.controls.description.value
        this.formCreateSchedule.mode = parseInt(this.validateForm.controls.backupMode.value, 10)
        this.formCreateSchedule.serviceType = 1
        this.formCreateSchedule.instanceId = this.validateForm.controls.instanceId.value
        this.formCreateSchedule.listAttachedVolume = this.validateForm.controls.volumeToBackupIds.value
        this.formCreateSchedule.maxBackup = this.validateForm.controls.maxBackup.value
        this.formCreateSchedule.backupPacketId = this.validateForm.controls.backupPackage.value
        if(this.formCreateSchedule.mode === 3) {
            this.formCreateSchedule.intervalWeek = this.validateForm.controls.numberOfWeek.value
            this.formCreateSchedule.dayOfWeek = this.validateForm.controls.daysOfWeek.value
        }
        if(this.formCreateSchedule.mode === 2) {
            this.formCreateSchedule.daysOfWeek = this.validateForm.controls.daysOfWeekMultiple.value
        }
        if(this.formCreateSchedule.mode === 4) {
            this.formCreateSchedule.intervalMonth = this.validateForm.controls.months.value
            this.formCreateSchedule.dayOfMonth = this.validateForm.controls.date.value
        }

        return this.formCreateSchedule
    }
    submitForm() {
        if (this.validateForm.valid) {

            this.formCreateSchedule = this.getData()
            this.formCreateSchedule.runtime = this.datepipe.transform(this.validateForm.controls.times.value,'yyyy-MM-ddTHH:mm:ss', 'vi-VI')
            this.backupScheduleService.create(this.formCreateSchedule).subscribe(data => {
                this.notification.success('Thành công', 'Tạo mới lịch backup vm thành công')
                this.nameList = []
                this.getListScheduleBackup()
                this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
            }, error => {
                this.notification.error('Thất bại', 'Tạo mới lịch backup vm thất bại')
            })
        } else {
            console.log(this.validateForm.controls);
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
        })
    }

    modeChange(value: string) {
        this.validateForm.controls.daysOfWeek.clearValidators();
        this.validateForm.controls.daysOfWeek.markAsPristine();
        this.validateForm.controls.daysOfWeek.reset();

        this.validateForm.controls.daysOfWeekMultiple.clearValidators();
        this.validateForm.controls.daysOfWeekMultiple.markAsPristine();
        this.validateForm.controls.daysOfWeekMultiple.reset();

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
            this.validateForm.controls.daysOfWeekMultiple.setValidators([Validators.required]);
            this.validateForm.controls.daysOfWeekMultiple.markAsDirty();
            this.validateForm.controls.daysOfWeekMultiple.reset();
        } else if (value === '3') {
            this.modeType = '3'

            this.validateForm.controls.daysOfWeek.setValidators([Validators.required]);
            this.validateForm.controls.daysOfWeek.markAsDirty();
            this.validateForm.controls.daysOfWeek.reset();

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
    }

    getVolumeInstanceAttachment(id: number) {
        this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
            this.volumeAttachments = data
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
            true, customerId).subscribe(data => {
            this.listInstance = data?.records
            this.backupVmService.search(this.formSearchBackup).subscribe(data2 => {
                this.listBackupVM = data2?.records

                const idSet = new Set(this.listBackupVM.map(item => item.instanceId));
                const idSetUnique = Array.from(new Set(idSet))
                this.listInstance?.forEach(item1 => {
                    if (!idSetUnique.includes(item1.id)) {
                        if (this.listInstanceNotUse?.length > 0) {
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
        this.getVolumeInstanceAttachment(value)
    }

    getListScheduleBackup() {
        this.formSearch.pageSize = 1000000
        this.formSearch.pageIndex = 1
        this.formSearch.customerId = this.tokenService.get()?.userId
        this.backupScheduleService.search(this.formSearch).subscribe(data => {

            this.lstBackupSchedules = data.records
            this.lstBackupSchedules?.forEach(item => {
                if (this.nameList?.length > 0) {
                    this.nameList.push(item.name)
                } else {
                    this.nameList = [item.name]
                }
            })
        })
    }

    ngOnInit(): void {
        this.getListScheduleBackup()
        this.getBackupPackage()
        this.getListInstances()
    }
}
