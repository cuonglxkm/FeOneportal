import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ScheduleService} from "../../../../shared/services/schedule.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BackupSchedule} from "../../../../shared/models/schedule.model";

@Component({
    selector: 'one-portal-edit-schedule-backup-vm',
    templateUrl: './edit-schedule-backup-vm.component.html',
    styleUrls: ['./edit-schedule-backup-vm.component.less'],
})
export class EditScheduleBackupVmComponent implements OnInit {

    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));
    modeType: any
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

    validateForm: FormGroup<{
        backupMode: FormControl<number>
        name: FormControl<string>
        backupPackage: FormControl<number>
        description: FormControl<string>
        instanceId: FormControl<number>
        months: FormControl<number>
        times: FormControl<string>
        numberOfWeek: FormControl<string>
        daysOfWeek: FormControl<number[]>
    }> = this.fb.group({
        backupMode: [0, [Validators.required]],
        name: ['', [Validators.required]],
        backupPackage: [0, [Validators.required]],
        description: ['', [Validators.maxLength(700)]],
        instanceId: [null as number, [Validators.required]],
        months: [null as number, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
        times: ['', [Validators.required]],
        numberOfWeek: [null as string, [Validators.required]],
        daysOfWeek: [null as number[], [Validators.required]]
    })
    customerId: number
    idSchedule: number
    scheduleBackup: BackupSchedule = new BackupSchedule()

    constructor(private fb: NonNullableFormBuilder,
                private router: Router,
                private route: ActivatedRoute,
                private scheduleService: ScheduleService,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {

    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId

    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
    }

    modeChange(value: string) {
        console.log('type', value)
        if (value === '1') {
            this.modeType = '1'
        } else if (value === '2') {
            this.modeType = '2'
        } else if (value === '3') {
            this.modeType = '3'
        } else if (value === '4') {
            this.modeType = '4'
        }
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
    }

    numberOfWeekChange(value: string) {
        this.numberOfWeekChangeSelected = value
        console.log('weeek', this.numberOfWeekChangeSelected)
    }

    submitForm() {

    }

    getDetail(customerId: number, id: number) {
        this.isLoading = true
        this.scheduleService.detail(customerId, id).subscribe(data => {
            console.log('data', this.scheduleBackup)
            this.scheduleBackup = data
            this.isLoading = false
        })
    }

    ngOnInit(): void {
        this.isLoading = true
        this.customerId = this.tokenService.get()?.userId
        this.route.params.subscribe((params) => {
            this.idSchedule = params['id']
            if (this.idSchedule !== undefined) {
                this.getDetail(this.customerId, this.idSchedule)
                this.isLoading = false
            }
        })
    }
}
