import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { BackupPackage, BackupVm, BackupVMFormSearch, VolumeAttachment } from '../../../shared/models/backup-vm';
import { InstancesService } from '../../instances/instances.service';
import { InstancesModel } from '../../instances/instances.model';
import { BackupSchedule, FormCreateSchedule, FormSearchScheduleBackup } from '../../../shared/models/schedule.model';
import { ScheduleService } from '../../../shared/services/schedule.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-create-schedule-backup',
  templateUrl: './create-schedule-backup.component.html',
  styleUrls: ['./create-schedule-backup.component.less']
})
export class CreateScheduleBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;
  isLoadingAction: boolean = false;

  selectedOption: string = 'instance';

  validateForm = new FormGroup({
    maxBackup: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]*$/)]
    }),
    description: new FormControl('', {
      validators: [Validators.maxLength(255)]
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]
    }),
    mode: new FormControl(null as number),
    backupPackage: new FormControl(null as number, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    months: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]
    }),
    times: new FormControl(new Date(), {
      nonNullable: true,
      validators: [Validators.required]
    }),
    numberOfWeek: new FormControl(null as number),
    date: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]
    }),
    volumeToBackupIds: new FormControl([] as number[]),
    daysOfWeek: new FormControl(null as string),
    daysOfWeekMultiple:new FormControl([] as string[]),
    formInstance: new FormGroup({
      instanceId: new FormControl(null as number, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      volumeToBackupIds: new FormControl(null as number[])
    }),
    formVolume: new FormGroup({
      volumeName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      storage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]*$/)]
      }),
      instanceId: new FormControl(null as number),
      time: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required]
      })
    })
  });


  id: number;

  backupVmId: number;
  volumeId: number;
  instanceId: number;

  nameList: string[] = [];

  volumeAttachments: VolumeAttachment[] = [];
  instanceName: string;
  listInstance: InstancesModel[] = [];
  listBackupVM: BackupVm[];
  listInstanceNotUse: InstancesModel[] = [];
  instanceSelected: any;

  modeSelected: any;

  backupPackageList: BackupPackage[] = [];
  backupPackageSelected: any;

  numberOfWeekChangeSelected: any;
  daySelected: any;

  lstBackupSchedules: BackupSchedule[];

  modes = [
    { label: this.i18n.fanyi('schedule.backup.label.each.day'), value: 1 },
    { label: this.i18n.fanyi('schedule.backup.label.each.number.day'), value: 2 },
    { label: this.i18n.fanyi('schedule.backup.label.each.week'), value: 3 },
    { label: this.i18n.fanyi('schedule.backup.label.each.month'), value: 4 }
  ];

  numberOfWeeks = [
    { label: '1 ' + this.i18n.fanyi('app.Week'), value: 1 },
    { label: '2 ' + this.i18n.fanyi('app.Week'), value: 2 },
    { label: '3 ' + this.i18n.fanyi('app.Week'), value: 3 }
    // { label: '4 ' + this.i18n.fanyi('app.Week'), value: 4 }
  ];
  daysOfWeeks = [
    { label: this.i18n.fanyi('schedule.backup.monday'), value: 1 },
    { label: this.i18n.fanyi('schedule.backup.tuesday'), value: 2 },
    { label: this.i18n.fanyi('schedule.backup.wednesday'), value: 3 },
    { label: this.i18n.fanyi('schedule.backup.thursday'), value: 4 },
    { label: this.i18n.fanyi('schedule.backup.friday'), value: 5 },
    { label: this.i18n.fanyi('schedule.backup.saturday'), value: 6 },
    { label: this.i18n.fanyi('schedule.backup.sunday'), value: 7 }
  ];

  constructor(private fb: NonNullableFormBuilder,
              private location: Location,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private backupVmService: BackupVmService,
              private instanceService: InstancesService,
              private datepipe: DatePipe,
              private notification: NzNotificationService,
              private backupScheduleService: ScheduleService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);

  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
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

  onSelectionChange(): void {
    console.log('Selected option:', this.selectedOption);
    if (this.selectedOption === 'instance') {
      this.validateForm.get('formVolume').clearValidators();
      this.validateForm.get('formVolume').updateValueAndValidity();
      this.validateForm.get('formVolume').reset();
    } else if (this.selectedOption === 'volume') {
      this.validateForm.clearValidators();
      this.validateForm.updateValueAndValidity();
      this.validateForm.reset();
    }
    this.cdr.detectChanges();
  }

  selectInstanceChange(value) {
    console.log('value instance select', value)
    this.instanceSelected = value
    const find = this.listInstanceNotUse?.find(x => x.id === this.instanceSelected)
    this.instanceName = find.name
    // this.getVolumeInstanceAttachment(value);
  }

  getVolumeInstanceAttachment(id: number) {
    this.isLoading = true;
    this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
      this.isLoading = false;
      this.volumeAttachments = data;
    });
  }


  getListInstances() {
    this.isLoading = true;
    let customerId = this.tokenService.get()?.userId;
    let formSearchBackup = new BackupVMFormSearch();
    formSearchBackup.pageSize = 10000000;
    formSearchBackup.currentPage = 1;
    formSearchBackup.customerId = customerId;
    this.instanceService.search(1, 10000000, this.region, this.project, '', '', true, customerId)
      .subscribe(data => {
        this.isLoading = false;
        this.listInstance = data?.records.filter(value => (value.taskState == 'ACTIVE'));

        this.backupVmService.search(formSearchBackup).subscribe(data2 => {
          this.listBackupVM = data2?.records;
          const idSet = new Set(this.listBackupVM.map(item => item.instanceId));
          const idSetUnique = Array.from(new Set(idSet));
          this.listInstance?.forEach(item1 => {
            if (!idSetUnique.includes(item1.id)) {
                this.listInstanceNotUse?.push(item1);
            }
          });
          console.log('list instance', this.listInstanceNotUse)
          this.instanceSelected = this.listInstanceNotUse[0]?.id
        });

      });
  }

  getInstanceById() {
    if (this.instanceId != undefined) {
      this.validateForm.get('formInstance').get('instanceId').setValue(this.instanceId);
      this.instanceService.getInstanceById(this.instanceId).subscribe(data => {
        this.instanceName = data.name;
      });
    }
  }

  modeChange(value) {
    console.log('mode change', value)
    this.modeSelected = value;

    this.validateForm.get('daysOfWeek').clearValidators();
    this.validateForm.get('daysOfWeek').markAsPristine();
    this.validateForm.get('daysOfWeek').reset();

    this.validateForm.get('daysOfWeekMultiple').clearValidators();
    this.validateForm.get('daysOfWeekMultiple').markAsPristine();
    this.validateForm.get('daysOfWeekMultiple').reset();

    this.validateForm.get('numberOfWeek').clearValidators();
    this.validateForm.get('numberOfWeek').markAsPristine();
    this.validateForm.get('numberOfWeek').reset();

    this.validateForm.get('months').clearValidators();
    this.validateForm.get('months').markAsPristine();
    this.validateForm.get('months').reset();

    this.validateForm.get('date').clearValidators();
    this.validateForm.get('date').markAsPristine();
    this.validateForm.get('date').reset();

    if(this.modeSelected == 4) {
      this.validateForm.get('months').setValue(1)
      this.validateForm.get('date').setValue(1)
      console.log('months', this.validateForm.get('months').value)
      console.log('date', this.validateForm.get('date').value)

      this.validateForm.get('months').setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
      this.validateForm.get('months').markAsDirty();
      this.validateForm.get('months').reset();

      this.validateForm.get('date').setValidators([Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]);
      this.validateForm.get('date').markAsDirty();
      this.validateForm.get('date').reset();
    }
    if(this.modeSelected == 3) {
      this.numberOfWeekChangeSelected = 1;
      this.daySelected = 1;

      this.validateForm.get('daysOfWeek').setValidators([Validators.required]);
      this.validateForm.get('daysOfWeek').markAsDirty();
      this.validateForm.get('daysOfWeek').reset();

      this.validateForm.get('numberOfWeek').setValidators([Validators.required]);
      this.validateForm.get('numberOfWeek').markAsDirty();
      this.validateForm.get('numberOfWeek').reset();
    }
    if(this.modeSelected == 2) {
      this.validateForm.get('daysOfWeekMultiple').setValidators([Validators.required]);
      this.validateForm.get('daysOfWeekMultiple').markAsDirty();
      this.validateForm.get('daysOfWeekMultiple').reset();
    }
  }

  getBackupPackage() {
    this.isLoading = true;
    this.backupVmService.getBackupPackages().subscribe(data => {
      console.log('backup packages: ', data.records);
      this.backupPackageList = data?.records;
      this.isLoading = false;
      this.backupPackageSelected = this.backupPackageList[0]?.id
    });
  }

  onChangeBackupPackage(value) {
    this.backupPackageSelected = value;
  }

  numberOfWeekChange(value: string) {
    this.numberOfWeekChangeSelected = value;
  }

  dayOfWeekChange(value) {
    this.daySelected = value
  }

  doCreateScheduleBackup() {
    let formCreateSchedule = new FormCreateSchedule();
    formCreateSchedule.customerId = this.tokenService.get()?.userId;
    formCreateSchedule.name = this.validateForm.controls.name.value;
    formCreateSchedule.description = this.validateForm.controls.description.value;
    formCreateSchedule.maxBackup = this.validateForm.controls.maxBackup.value;
    formCreateSchedule.mode = this.modeSelected;
    formCreateSchedule.serviceType = 1;
    if(this.selectedOption == 'instance') {
      formCreateSchedule.instanceId = this.validateForm.get('formInstance').get('instanceId').value
      formCreateSchedule.listAttachedVolume = this.validateForm.get('formInstance').get('volumeToBackupIds').value
    } else {
      formCreateSchedule.volumeId = this.validateForm.get('formVolume').get('volumeId').value
    }
    formCreateSchedule.backupPacketId = this.validateForm.controls.backupPackage.value
    formCreateSchedule.runtime = this.datepipe.transform(this.validateForm.controls.times.value, 'yyyy-MM-ddTHH:mm:ss', 'vi-VI');
    if (formCreateSchedule.mode === 3) {
      formCreateSchedule.intervalWeek = this.validateForm.controls.numberOfWeek.value;
      formCreateSchedule.dayOfWeek = this.validateForm.controls.daysOfWeek.value;
    }
    if (formCreateSchedule.mode === 2) {
      formCreateSchedule.daysOfWeek = this.validateForm.controls.daysOfWeekMultiple.value;
    }
    if (formCreateSchedule.mode === 4) {
      formCreateSchedule.intervalMonth = this.validateForm.controls.months.value;
      formCreateSchedule.dayOfMonth = this.validateForm.controls.date.value;
    }
    this.backupScheduleService.create(formCreateSchedule).subscribe(data => {
      this.notification.success(this.i18n.fanyi("app.status.success") ,this.i18n.fanyi("schedule.backup.notify.create.success"));
      this.nameList = [];
      this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail") ,this.i18n.fanyi("schedule.backup.notify.create.fail") + '. ' + error.error.detail);
    });
  }

  getListScheduleBackup() {
    let formSearch = new FormSearchScheduleBackup();
    formSearch.pageSize = 9999;
    formSearch.pageIndex = 1;
    formSearch.customerId = this.tokenService.get()?.userId;
    this.backupScheduleService.search(formSearch).subscribe(data => {
      this.lstBackupSchedules = data.records;
      this.lstBackupSchedules?.forEach(item => {
          this.nameList?.push(item.name);
      });
    });
  }
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.modeSelected = 1;

    this.getListInstances();
    this.getInstanceById();
    this.getBackupPackage();
    this.getListScheduleBackup();
  }


}
