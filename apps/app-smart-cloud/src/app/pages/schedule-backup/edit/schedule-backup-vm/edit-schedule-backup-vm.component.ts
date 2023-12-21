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
        daysOfWeek: FormControl<string[] | null>
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
        daysOfWeek: [[] as string[]]
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

    goBack() {
        this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
    }

    numberOfWeekChange(value: string) {
        this.numberOfWeekChangeSelected = value
        console.log('weeek', this.numberOfWeekChangeSelected)
    }

    getData(): FormEditSchedule {
        this.validateForm.get('backupMode').valueChanges.subscribe(data => {
            if(data != this.validateForm.get('backupMode').value) {
                this.formEdit.mode = parseInt(data,10)
            } else {
                this.formEdit.mode = parseInt(this.validateForm.controls.backupMode.value, 10)
            }
        })
        this.validateForm.get('name').valueChanges.subscribe(data => {
            if(data != this.validateForm.get('name').value) {
                this.formEdit.name = data
            } else {
                this.formEdit.name =  this.validateForm.controls.name.value
            }
        })
        this.validateForm.get('description').valueChanges.subscribe(data => {
            if(data != this.validateForm.get('description').value) {
                this.formEdit.description = data
            } else {
                this.formEdit.description =  this.validateForm.controls.description.value
            }
        })
        this.validateForm.get('months').valueChanges.subscribe(data => {
            if(data != this.validateForm.get('months').value) {
                this.formEdit.intervalMonth = data
            } else {
                this.formEdit.intervalMonth =  this.validateForm.controls.months.value
            }
        })
        this.validateForm.get('times').valueChanges.subscribe(data => {
            if(data != this.validateForm.get('times').value) {
                this.formEdit.runtime = data
            } else {
                this.formEdit.runtime = this.datepipe.transform(this.validateForm.controls.times.value,'yyyy-MM-ddTHH:mm:ss', 'vi-VI')
            }
        })

        this.formEdit.dayOfMonth = this.validateForm.controls.date.getRawValue()
        this.formEdit.intervalWeek = this.validateForm.controls.numberOfWeek.getRawValue()
        this.formEdit.daysOfWeek = this.validateForm.controls.daysOfWeek.getRawValue()
        this.formEdit.serviceType = 1
        this.formEdit.customerId = this.tokenService.get()?.userId
        return this.formEdit
    }


    submitForm() {
        if (this.validateForm.valid) {
            console.log(this.validateForm.getRawValue())
            this.formEdit = this.getData()
            this.scheduleService.edit(this.formEdit).subscribe(data => {
                this.notification.success('Thành công', 'Chỉnh sửa lịch backup vm thành công')
            }, error => {
                this.notification.error('Thất bai','Chỉnh sửa lịch backup vm thất bại')
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

    getDetail(customerId: number, id: number) {
        this.isLoading = true

        this.scheduleService.detail(customerId, id).subscribe(data => {
            console.log('data', data)
            this.backupSchedule = data
            this.isLoading = false
            this.validateForm.controls.backupMode.setValue(this.backupSchedule?.mode.toString())
            this.validateForm.controls.times.setValue(this.backupSchedule?.runtime)
            data.backupScheduleItems?.forEach(item => {
                if (this.listVolume?.length > 0) {
                    this.listVolume.push(item)
                } else {
                    this.listVolume = [item]
                }
            })

        })
    }

    getListScheduleBackup() {
        this.formSearch.pageSize = 1000000
        this.formSearch.pageIndex = 1
        this.formSearch.customerId = this.tokenService.get()?.userId
        this.scheduleService.search(this.formSearch).subscribe(data => {
            console.log('data', data)
            data.records?.forEach(item => {
                if(!this.backupSchedule?.name.includes(item.name)) {
                    if (this.nameList?.length > 0) {
                        this.nameList.push(item.name)
                    } else {
                        this.nameList = [item.name]
                    }
                }

            })
            console.log('name list', this.nameList)
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
