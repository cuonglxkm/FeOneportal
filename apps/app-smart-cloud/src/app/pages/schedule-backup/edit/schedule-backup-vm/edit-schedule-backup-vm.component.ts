import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ScheduleService} from "../../../../shared/services/schedule.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BackupSchedule, FormEditSchedule, FormSearchScheduleBackup} from "../../../../shared/models/schedule.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {DatePipe} from "@angular/common";

@Component({
    selector: 'one-portal-edit-schedule-backup-vm',
    templateUrl: './edit-schedule-backup-vm.component.html',
    styleUrls: ['./edit-schedule-backup-vm.component.less'],
})
export class EditScheduleBackupVmComponent implements OnInit {

    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));
    modeType: any = '4'
    mode = [
        {label: 'Hàng ngày', value: '1'},
        {label: 'Theo thứ', value: '2'},
        {label: 'Theo tuần', value: '3'},
        {label: 'Theo tháng', value: '4'}
    ]
    numberOfWeek = [
        {label: '1 Tuần', value: '1'},
        {label: '2 Tuần', value: '2'},
        {label: '3 Tuần', value: '3'}
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
    isLoading: boolean = false
    numberOfWeekChangeSelected: string


    customerId: number
    idSchedule: number
    backupSchedule: BackupSchedule
    listVolume: any[]
    nameList: string[] = []
    formSearch: FormSearchScheduleBackup = new FormSearchScheduleBackup()
    formEdit: FormEditSchedule = new FormEditSchedule()

    validateForm: FormGroup<{
        backupMode: FormControl<string>
        name: FormControl<string>
        description: FormControl<string>
        months: FormControl<number>
        times: FormControl<Date>
        numberOfWeek: FormControl<number>
        date: FormControl<number>
        daysOfWeek: FormControl<string>
        daysOfWeekMultiple: FormControl<string[]>
    }> = this.fb.group({
        backupMode: ['4', [Validators.required]],
        name: [null as string, [Validators.required,
            Validators.pattern(/^[a-zA-Z0-9_]{1,255}$/),
            this.validateSpecialCharacters.bind(this), this.duplicateNameValidator.bind(this)]],
        description: [null as string, [Validators.maxLength(700)]],
        months: [1, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
        times: [new Date(), [Validators.required]],
        numberOfWeek: [null as number],
        date: [1, [Validators.required]],
        daysOfWeek: [''],
        daysOfWeekMultiple: [[] as string[]]
    })


    constructor(private fb: NonNullableFormBuilder,
                private router: Router,
                private route: ActivatedRoute,
                private scheduleService: ScheduleService,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService,
                public datepipe: DatePipe) {

    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId

    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
    }

    validateSpecialCharacters(control) {
        const value = control.value;

        if (/[^a-zA-Z0-9_]/.test(value)) {
            return {invalidCharacters: true};
        } else {
            return null;
        }
    }

    duplicateNameValidator(control) {
        const value = control.value;
        // Check if the input name is already in the list
        if (this.nameList && this.nameList.includes(value)) {
            return {duplicateName: true}; // Duplicate name found
        } else {
            return null;
        }

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

            this.validateForm.controls.daysOfWeekMultiple.clearValidators();
            this.validateForm.controls.daysOfWeekMultiple.markAsPristine();
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

    goBack() {
        this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
    }

    numberOfWeekChange(value: string) {
        this.numberOfWeekChangeSelected = value
        console.log('weeek', this.numberOfWeekChangeSelected)
    }

    getData(): FormEditSchedule {
        this.formEdit.customerId = this.tokenService.get()?.userId
        this.formEdit.name = this.validateForm.controls.name.value
        this.formEdit.description = this.validateForm.controls.description.value
        this.formEdit.mode = parseInt(this.validateForm.controls.backupMode.value, 10)
        this.formEdit.serviceType = 1
        if(this.formEdit.mode === 3) {
            this.formEdit.intervalWeek = this.validateForm.controls.numberOfWeek.value
            this.formEdit.dayOfWeek = this.validateForm.controls.daysOfWeek.value
        }
        if(this.formEdit.mode === 2) {
            this.formEdit.daysOfWeek = this.validateForm.controls.daysOfWeekMultiple.value
        }
        if(this.formEdit.mode === 4) {
            this.formEdit.intervalMonth = this.validateForm.controls.months.value
            this.formEdit.dayOfMonth = this.validateForm.controls.date.value
        }
        return this.formEdit
    }

    submitForm() {
        if (this.validateForm.valid) {
            this.formEdit = this.getData()
            this.formEdit.runtime = this.datepipe.transform(this.validateForm.controls.times.value,'yyyy-MM-ddTHH:mm:ss', 'vi-VI')

            // this.route.params.subscribe((params) => {
            //     this.idSchedule = params['id']
                this.formEdit.scheduleId = this.idSchedule
            // })
            this.scheduleService.edit(this.formEdit).subscribe(data => {
                this.notification.success('Thành công', 'Chỉnh sửa lịch backup vm thành công')
                this.nameList = []
                this.getListScheduleBackup()
                this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
            }, error => {
                this.notification.error('Thất bai','Chỉnh sửa lịch backup vm thất bại')
            })
        } else {
            console.log('invalid', this.validateForm.getRawValue());
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
        }
    }

    getDetail(customerId: number, id: number) {
        this.isLoading = true

        this.scheduleService.detail(customerId, id).subscribe(data => {
            this.backupSchedule = data
            this.isLoading = false
            this.validateForm.controls.backupMode.setValue(this.backupSchedule?.mode.toString())
            this.validateForm.controls.times.setValue(this.backupSchedule?.runtime)
            this.validateForm.controls.name.setValue(this.backupSchedule?.name)
            this.validateForm.controls.description.setValue(this.backupSchedule?.description)
            this.validateForm.controls.months.setValue(this.backupSchedule?.interval)
            this.validateForm.controls.date.setValue(this.backupSchedule?.dates)
            this.numberOfWeekChangeSelected = this.backupSchedule?.interval.toString()
            this.validateForm.controls.numberOfWeek.setValue(parseInt(this.numberOfWeekChangeSelected, 10))
            this.validateForm.controls.daysOfWeek.setValue(this.backupSchedule?.daysOfWeek)
            this.validateForm.controls.daysOfWeekMultiple.setValue(this.backupSchedule?.daysOfWeek?.split(','))

            data.backupScheduleItems?.forEach(item => {
                if (this.listVolume?.length > 0) {
                    this.listVolume.push(item.itemName)
                } else {
                    this.listVolume = [item.itemName]
                }
            })

        })
    }

    getListScheduleBackup() {
        this.formSearch.pageSize = 1000000
        this.formSearch.pageIndex = 1
        this.formSearch.customerId = this.tokenService.get()?.userId
        this.scheduleService.search(this.formSearch).subscribe(data => {
            data.records?.forEach(item => {
                if(!this.backupSchedule?.name.includes(item.name)) {
                    if (this.nameList?.length > 0) {
                        this.nameList.push(item.name)
                    } else {
                        this.nameList = [item.name]
                    }
                }

            })
        })
    }

    ngOnInit(): void {
        this.isLoading = true
        this.customerId = this.tokenService.get()?.userId

        this.route.params.subscribe((params) => {
            this.idSchedule = params['id']
            if (this.idSchedule !== undefined) {
                this.validateForm.get('maxBackup')?.disable()
                this.validateForm.get('backupPackage')?.disable()
                this.validateForm.get('instanceId')?.disable()
                this.validateForm.get('volumeToBackupIds')?.disable()
                this.getDetail(this.customerId, this.idSchedule)
                this.isLoading = false
            }
        })
        this.getListScheduleBackup()

    }
}
