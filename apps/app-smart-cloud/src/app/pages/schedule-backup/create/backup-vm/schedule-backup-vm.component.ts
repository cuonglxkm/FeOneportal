import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { BackupPackage, BackupVm, BackupVMFormSearch, VolumeAttachment } from '../../../../shared/models/backup-vm';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { BackupVmService } from '../../../../shared/services/backup-vm.service';
import { BackupSchedule, FormCreateSchedule, FormSearchScheduleBackup } from '../../../../shared/models/schedule.model';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { InstancesService } from '../../../instances/instances.service';
import { InstancesModel } from '../../../instances/instances.model';
import { DatePipe } from '@angular/common';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-schedule-backup-vm',
  templateUrl: './schedule-backup-vm.component.html',
  styleUrls: ['./schedule-backup-vm.component.less']
})
export class ScheduleBackupVmComponent implements OnInit {
  @Input() region: number;
  @Input() project: number;
  @Input() instanceId?: number;

  isLoading: boolean = false;
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
    maxBackup: [1, [Validators.required, Validators.min(1)]],
    volumeToBackupIds: [[] as number[]],
    daysOfWeek: [''],
    daysOfWeekMultiple: [[] as string[]]
  });

  modeType: string = '1';
  numberOfWeekChangeSelected: string;

  backupPackages: BackupPackage[] = [];

  times = new Date();

  mode = [
    {label: this.i18n.fanyi("schedule.backup.label.each.day"), value: '1'},
    {label: this.i18n.fanyi("schedule.backup.label.each.number.day"), value: '2'},
    {label: this.i18n.fanyi("schedule.backup.label.each.week"), value: '3'},
    {label: this.i18n.fanyi("schedule.backup.label.each.month"), value: '4'}
  ]
  numberOfWeek = [
    {label: '1 ' + this.i18n.fanyi("app.Week"), value: '1'},
    {label: '2 ' + this.i18n.fanyi("app.Week"), value: '2'},
    {label: '3 ' + this.i18n.fanyi("app.Week"), value: '3'}
  ]
  daysOfWeek = [
    {label: this.i18n.fanyi("schedule.backup.monday"), value: '1'},
    {label: this.i18n.fanyi("schedule.backup.tuesday"), value: '2'},
    {label: this.i18n.fanyi("schedule.backup.wednesday"), value: '3'},
    {label: this.i18n.fanyi("schedule.backup.thursday"), value: '4'},
    {label: this.i18n.fanyi("schedule.backup.friday"), value: '5'},
    {label: this.i18n.fanyi("schedule.backup.saturday"), value: '6'},
    {label: this.i18n.fanyi("schedule.backup.sunday"), value: '7'}
  ]

  volumeAttachments: VolumeAttachment[] = [];
  lstBackupSchedules: BackupSchedule[];
  response: BaseResponse<BackupSchedule[]>;
  formSearch: FormSearchScheduleBackup = new FormSearchScheduleBackup();
  formSearchBackup: BackupVMFormSearch = new BackupVMFormSearch();

  listInstance: InstancesModel[] = [];
  listBackupVM: BackupVm[];

  listInstanceNotUse: InstancesModel[] = [];
  listInstanceNotUseUnique: InstancesModel[] = [];
  instanceSelected: InstancesModel;
  formCreateSchedule: FormCreateSchedule = new FormCreateSchedule();
  nameList: string[] = [];
  interval: string = '';


  isLoadingPackage: boolean = false;

  isLoadingAttach: boolean = false;

  constructor(private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private router: Router,
              private backupVmService: BackupVmService,
              private backupScheduleService: ScheduleService,
              private instanceService: InstancesService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private datepipe: DatePipe) {
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
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
  }

  getData(): FormCreateSchedule {
    this.formCreateSchedule.customerId = this.tokenService.get()?.userId;
    this.formCreateSchedule.name = this.validateForm.controls.name.value;
    this.formCreateSchedule.description = this.validateForm.controls.description.value;
    this.formCreateSchedule.mode = parseInt(this.validateForm.controls.backupMode.value, 10);
    this.formCreateSchedule.serviceType = 1;
    this.formCreateSchedule.instanceId = this.validateForm.controls.instanceId.value;
    this.formCreateSchedule.listAttachedVolume = this.validateForm.controls.volumeToBackupIds.value;
    this.formCreateSchedule.maxBackup = this.validateForm.controls.maxBackup.value;
    this.formCreateSchedule.backupPacketId = this.validateForm.controls.backupPackage.value;
    if (this.formCreateSchedule.mode === 3) {
      this.formCreateSchedule.intervalWeek = this.validateForm.controls.numberOfWeek.value;
      this.formCreateSchedule.dayOfWeek = this.validateForm.controls.daysOfWeek.value;
    }
    if (this.formCreateSchedule.mode === 2) {
      this.formCreateSchedule.daysOfWeek = this.validateForm.controls.daysOfWeekMultiple.value;
    }
    if (this.formCreateSchedule.mode === 4) {
      this.formCreateSchedule.intervalMonth = this.validateForm.controls.months.value;
      this.formCreateSchedule.dayOfMonth = this.validateForm.controls.date.value;
    }

    return this.formCreateSchedule;
  }

  submitForm() {
    if (this.validateForm.valid) {

      this.formCreateSchedule = this.getData();
      this.formCreateSchedule.runtime = this.datepipe.transform(this.validateForm.controls.times.value, 'yyyy-MM-ddTHH:mm:ss', 'vi-VI');
      this.backupScheduleService.create(this.formCreateSchedule).subscribe(data => {
        this.notification.success(this.i18n.fanyi("app.status.success") ,this.i18n.fanyi("schedule.backup.notify.create.success"));
        this.nameList = [];
        this.getListScheduleBackup();
        this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
      }, error => {
        this.notification.error(this.i18n.fanyi("app.status.fail") ,this.i18n.fanyi("schedule.backup.notify.create.fail"));
      });
    } else {
      console.log(this.validateForm.controls);
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getBackupPackage() {
    this.isLoadingPackage = true;
    this.backupVmService.getBackupPackages().subscribe(data => {
      console.log('backup packages: ', data.records);
      this.backupPackages = data.records;
      this.isLoadingPackage = false;
    });
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
      this.modeType = '1';
    } else if (value === '2') {
      this.modeType = '2';
      this.validateForm.controls.daysOfWeekMultiple.setValidators([Validators.required]);
      this.validateForm.controls.daysOfWeekMultiple.markAsDirty();
      this.validateForm.controls.daysOfWeekMultiple.reset();
    } else if (value === '3') {
      this.modeType = '3';

      this.validateForm.controls.daysOfWeek.setValidators([Validators.required]);
      this.validateForm.controls.daysOfWeek.markAsDirty();
      this.validateForm.controls.daysOfWeek.reset();

      this.validateForm.controls.numberOfWeek.setValidators([Validators.required]);
      this.validateForm.controls.numberOfWeek.markAsDirty();
      this.validateForm.controls.numberOfWeek.reset();
    } else if (value === '4') {
      this.modeType = '4';
      this.validateForm.controls.months.setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
      this.validateForm.controls.months.markAsDirty();
      this.validateForm.controls.months.reset();

      this.validateForm.controls.date.setValidators([Validators.required]);
      this.validateForm.controls.date.markAsDirty();
      this.validateForm.controls.date.reset();
    }
  }

  numberOfWeekChange(value: string) {
    this.numberOfWeekChangeSelected = value;
  }

  getVolumeInstanceAttachment(id: number) {
    this.isLoadingAttach = true;
    this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
      this.isLoadingAttach = false;
      this.volumeAttachments = data;
    });
  }

  isLoadingInstance: boolean = false;

  getListInstances() {
    this.isLoadingInstance = true;
    let customerId = this.tokenService.get()?.userId;
    this.formSearchBackup.pageSize = 10000000;
    this.formSearchBackup.currentPage = 1;
    this.formSearchBackup.customerId = customerId;
    this.instanceService.search(1, 10000000,
      this.region, this.project, '', '',
      true, customerId).subscribe(data => {
      this.isLoadingInstance = false;

      this.listInstance = data?.records.filter(value => (value.taskState == 'ACTIVE'));
      this.backupVmService.search(this.formSearchBackup).subscribe(data2 => {
        this.listBackupVM = data2?.records;

        const idSet = new Set(this.listBackupVM.map(item => item.instanceId));
        const idSetUnique = Array.from(new Set(idSet));
        this.listInstance?.forEach(item1 => {
          if (!idSetUnique.includes(item1.id)) {
            if (this.listInstanceNotUse?.length > 0) {
              this.listInstanceNotUse.push(item1);
            } else {
              this.listInstanceNotUse = [item1];
            }
          }
        });
      });
    });

  }

  selectInstanceChange(value) {
    this.getVolumeInstanceAttachment(value);
  }

  instanceName: string
  getInstanceById() {
    if(this.instanceId != undefined) {
      this.validateForm.get('instanceId').setValue(this.instanceId)
      this.instanceService.getInstanceById(this.instanceId).subscribe(data => {
        this.instanceName = data.name
      })
    }

  }

  getListScheduleBackup() {
    this.formSearch.pageSize = 1000000;
    this.formSearch.pageIndex = 1;
    this.formSearch.customerId = this.tokenService.get()?.userId;
    this.backupScheduleService.search(this.formSearch).subscribe(data => {

      this.lstBackupSchedules = data.records;
      this.lstBackupSchedules?.forEach(item => {
        if (this.nameList?.length > 0) {
          this.nameList.push(item.name);
        } else {
          this.nameList = [item.name];
        }
      });
    });
  }



  ngOnInit(): void {
    this.getListScheduleBackup();
    this.getBackupPackage();
    this.getListInstances();
    this.getInstanceById();
  }
}
