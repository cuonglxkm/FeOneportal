import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {BackupPackage, VolumeAttachment} from "../../../../shared/models/backup-vm";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";

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
        backupMode: FormControl<number>
        name: FormControl<string>
        backupPackage: FormControl<number>
        description: FormControl<string>
        instanceId: FormControl<number>
        months: FormControl<number>
        times: FormControl<string>
        numberOfWeek: FormControl<string>
        // flavor: FormControl<Flavor | null>
        // image: FormControl<Image | null>
        // securityGroup: FormControl<SecurityGroupBackup[]>
        // iops: FormControl<number>
        // storage: FormControl<number>
        // radio: FormControl<any>
        // volumeToBackupIds: FormControl<number[] | null>
    }> = this.fb.group({
        backupMode: [0, [Validators.required]],
        name: ['', [Validators.required]],
        backupPackage: [0, [Validators.required]],
        description: ['', [Validators.maxLength(700)]],
        instanceId: [null as number, [Validators.required]],
        months: [null as number, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
        times: ['', [Validators.required]],
        numberOfWeek: [null as string, [Validators.required]]
        // flavor: [null as Flavor | null, [Validators.required]],
        // image: [null as Image | null, [Validators.required]],
        // securityGroup: [[] as SecurityGroupBackup[], [Validators.required]],
        // iops: [null as number | null, [Validators.required]],
        // storage: [null as number | null, [Validators.required]],
        // radio: [''],
        // volumeToBackupIds: [[] as number[]]
    })

    modeType: any
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
    constructor(private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService,
                private router: Router,
                private backupVmService: BackupVmService,) {
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
    }

    submitForm() {
    }

    getBackupPackage() {
        this.backupVmService.getBackupPackages(this.tokenService.get()?.userId).subscribe(data => {
            this.backupPackages = data
            console.log('backup package', this.backupPackages)
        })
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

    ngOnInit(): void {
    }

}
