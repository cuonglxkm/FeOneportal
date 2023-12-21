import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import Flavor from "../../../../shared/models/flavor.model";
import Image from "../../../../shared/models/image";
import {
  BackupPackage, BackupVm,
  BackupVMFormSearch,
  SecurityGroupBackup,
  VolumeAttachment
} from "../../../../shared/models/backup-vm";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";
import {BackupSchedule, FormCreateSchedule, FormSearchScheduleBackup} from "../../../../shared/models/schedule.model";
import {BaseResponse} from "../../../../../../../../libs/common-utils/src";
import {InstancesModel} from "../../../instances/instances.model";
import {ScheduleService} from "../../../../shared/services/schedule.service";
import {InstancesService} from "../../../instances/instances.service";
import {VolumeService} from "../../../../shared/services/volume.service";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'one-portal-schedule-backup-volume',
  templateUrl: './schedule-backup-volume.component.html',
  styleUrls: ['./schedule-backup-volume.component.less'],
})
export class ScheduleBackupVolumeComponent implements OnInit{
  @Input() region: number
  @Input() project: number

  isLoading: boolean = false
  validateForm: FormGroup<{
    backupMode: FormControl<string>
    name: FormControl<string>
    backupPackage: FormControl<number>
    description: FormControl<string>
    volumeId: FormControl<number>
    months: FormControl<number>
    times: FormControl<Date>
    numberOfWeek: FormControl<number>
    date: FormControl<number>
    maxBackup: FormControl<number>
    daysOfWeek: FormControl<string[] | null>
  }> = this.fb.group({
    backupMode: ['1', [Validators.required]],
    name: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]{1,255}$/),
      this.validateSpecialCharacters.bind(this), this.duplicateNameValidator.bind(this)]],
    backupPackage: [null as number, [Validators.required]],
    description: [null as string, [Validators.maxLength(700)]],
    volumeId: [null as number, [Validators.required]],
    months: [1, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
    times: [new Date(), [Validators.required]],
    numberOfWeek: [null as number],
    date: [1, [Validators.required]],
    maxBackup: [null as number, [Validators.required, Validators.min(1)]],
    daysOfWeek: [[] as string[]]
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

  listVolume: VolumeDTO[] = []
  listInstanceNotUseUnique: InstancesModel[] = []
  instanceSelected: InstancesModel
  formCreateSchedule: FormCreateSchedule = new FormCreateSchedule()
  nameList: string[] = []

  constructor(private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private router: Router,
              private backupVmService: BackupVmService,
              private backupScheduleService: ScheduleService,
              private volumeService: VolumeService,
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
    this.formCreateSchedule.mode = parseInt(this.validateForm.controls.backupMode.getRawValue(), 10)
    this.formCreateSchedule.name = this.validateForm.controls.name.getRawValue()
    this.formCreateSchedule.backupPacketId = this.validateForm.controls.backupPackage.getRawValue()
    this.formCreateSchedule.description = this.validateForm.controls.description.getRawValue()
    this.formCreateSchedule.volumeId = this.validateForm.controls.volumeId.getRawValue()
    this.formCreateSchedule.intervalMonth = this.validateForm.controls.months.getRawValue()
    this.formCreateSchedule.dayOfMonth = this.validateForm.controls.date.getRawValue()
    this.formCreateSchedule.intervalWeek = this.validateForm.controls.numberOfWeek.getRawValue()
    this.formCreateSchedule.maxBackup = this.validateForm.controls.maxBackup.getRawValue()
    this.formCreateSchedule.daysOfWeek = this.validateForm.controls.daysOfWeek.getRawValue()
    this.formCreateSchedule.serviceType = 2
    this.formCreateSchedule.customerId = this.tokenService.get()?.userId
    return this.formCreateSchedule
  }
  submitForm() {
    if (this.validateForm.valid) {

      this.formCreateSchedule = this.getData()
      this.formCreateSchedule.runtime = this.datepipe.transform(this.validateForm.controls.times.value,'yyyy-MM-ddTHH:mm:ss', 'vi-VI')
      console.log(this.formCreateSchedule.runtime)
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

  getListVolume() {
    this.volumeService.getVolumes(this.tokenService.get()?.userId,this.project,this.region,null,999,1,null,null)
      .subscribe(data => {
        this.listVolume = data.records;
      })
  }

  selectInstanceChange(value) {
    // this.instanceSelected = value
    console.log(value)
    this.getVolumeInstanceAttachment(value)
  }

  getListScheduleBackup() {
    this.formSearch.pageSize = 1000000
    this.formSearch.pageIndex = 1
    this.formSearch.customerId = this.tokenService.get()?.userId
    this.backupScheduleService.search(this.formSearch).subscribe(data => {
      console.log('data', data)
      this.lstBackupSchedules = data.records
      this.lstBackupSchedules?.forEach(item => {
        if (this.nameList?.length > 0) {
          this.nameList.push(item.name)
        } else {
          this.nameList = [item.name]
        }
      })
      console.log('name list', this.nameList)
    })
  }

  ngOnInit(): void {
    this.getListScheduleBackup()
    this.getBackupPackage()
    this.getListVolume()
  }
}
