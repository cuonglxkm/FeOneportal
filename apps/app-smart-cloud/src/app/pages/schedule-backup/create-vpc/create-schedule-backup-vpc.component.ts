import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { InstancesService } from '../../instances/instances.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ScheduleService } from '../../../shared/services/schedule.service';
import { BackupVolumeService } from '../../../shared/services/backup-volume.service';
import { VolumeService } from '../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectService } from '../../../shared/services/project.service';
import { SizeInCloudProject } from '../../../shared/models/project.model';
import { BackupVm, BackupVMFormSearch, VolumeAttachment } from '../../../shared/models/backup-vm';
import { InstancesModel } from '../../instances/instances.model';
import { BackupSchedule, FormCreateSchedule, FormSearchScheduleBackup } from '../../../shared/models/schedule.model';
import { VolumeDTO } from '../../../shared/dto/volume.dto';
import { BackupVolume } from '../../volume/component/backup-volume/backup-volume.model';

@Component({
  selector: 'one-portal-create-schedule-backup-vpc',
  templateUrl: './create-schedule-backup-vpc.component.html',
  styleUrls: ['./create-schedule-backup-vpc.component.less']
})
export class CreateScheduleBackupVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  nameList: string[] = [];

  validateForm = new FormGroup({
    formInstance: new FormGroup({
      instanceId: new FormControl(null as number, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      volumeToBackupIds: new FormControl(null as number[]),
      maxBackup: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]*$/)]
      }),
      description: new FormControl('', {
        validators: [Validators.maxLength(255)]
      }),
      name: new FormControl(null as string, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]
      }),
      mode: new FormControl(null as number),
      months: new FormControl(1, {
        validators: [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]
      }),
      times: new FormControl(new Date(), {
        validators: [Validators.required]
      }),
      numberOfWeek: new FormControl(null as number),
      date: new FormControl(1, {
        validators: [Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]
      }),
      daysOfWeek: new FormControl(null as string),
      daysOfWeekMultiple: new FormControl([] as string[])
    }),
    formVolume: new FormGroup({
      volumeId: new FormControl(null as number, {
        validators: [Validators.required]
      }),
      maxBackup: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]*$/)]
      }),
      description: new FormControl('', {
        validators: [Validators.maxLength(255)]
      }),
      name: new FormControl(null as string, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]
      }),
      mode: new FormControl(null as number),

      months: new FormControl(1, {
        validators: [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]
      }),
      times: new FormControl(new Date(), {
        validators: [Validators.required]
      }),
      numberOfWeek: new FormControl(null as number),
      date: new FormControl(1, {
        validators: [Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]
      }),
      daysOfWeek: new FormControl(null as string),
      daysOfWeekMultiple: new FormControl([] as string[])
    })
  });

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

  sizeInCloudProject: SizeInCloudProject = new SizeInCloudProject();

  isLoadingAction: boolean = false;

  selectedOption: string = 'instance';

  id: number;

  volumeId: number;
  instanceId: number;

  volumeAttachments: VolumeAttachment[] = [];
  instanceName: string;
  listInstance: InstancesModel[] = [];
  listBackupVM: BackupVm[];
  listInstanceNotUse: InstancesModel[] = [];
  instanceSelected: any;

  modeSelected: any;

  numberOfWeekChangeSelected: any;
  daySelected: any;

  lstBackupSchedules: BackupSchedule[];

  listVolume: VolumeDTO[] = [];
  listVolumeNotUseUnique: VolumeDTO[] = [];
  backupVolumeList: BackupVolume[];
  volumeSelected: any;
  volumeName: string;
  instance: any;

  volumeAttachSelected: VolumeDTO[] = [];
  sizeOfVlAttach: number = 0;

  projectName: string;

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
              private projectService: ProjectService,
              private backupVolumeService: BackupVolumeService,
              private volumeService: VolumeService,
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
    this.projectName = project?.projectName;
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
    }
    if (this.selectedOption === 'volume') {
      this.validateForm.get('formInstance').clearValidators();
      this.validateForm.get('formInstance').updateValueAndValidity();
      this.validateForm.get('formInstance').reset();
    }
    this.modeSelected = 1;
    this.cdr.detectChanges();
  }

  selectInstanceChange(value) {
    console.log('value instance select', value);
    if (value != undefined) {
      this.instanceSelected = value;
      const find = this.listInstanceNotUse?.find(x => x.id === this.instanceSelected);
      this.instanceName = find?.name;
      this.getDataFromInstanceId(value);
    }
  }

  sizeOfVolume: number = 0;

  selectVolumeChange(value) {
    console.log('value volume selected', value);
    if (value != undefined) {
      this.volumeSelected = value;
      const find = this.listVolumeNotUseUnique?.find(x => x.id === this.volumeSelected);
      this.volumeName = find?.name;
      this.sizeOfVolume += find?.sizeInGB;
    }
  }

  onSelectedVolume(value) {
    console.log('value', value);
    this.sizeOfVlAttach = 0;
    this.volumeAttachSelected = [];
    if (value.length >= 1) {
      value.forEach(item => {
        this.volumeService.getVolumeById(item, this.project).subscribe(data => {
          this.volumeAttachSelected?.push(data);
          this.sizeOfVlAttach += data?.sizeInGB;
        });
      });
    } else {
      this.volumeAttachSelected = [];
      this.sizeOfVlAttach = 0;
    }
  }

  getVolumeInstanceAttachment(id: number) {
    this.isLoading = true;
    this.backupVmService.getVolumeInstanceAttachment(id).subscribe(data => {
      this.isLoading = false;
      this.volumeAttachments = data;
    });
  }

  getDataFromInstanceId(id) {
    this.instanceService.getInstanceById(id).subscribe(data => {
      this.instance = data;
      this.isLoading = false;
      this.getVolumeInstanceAttachment(this.instance.id);
    });
  }


  isLoadingInstance: boolean = false;

  getListInstances() {
    this.isLoadingInstance = true;
    let customerId = this.tokenService.get()?.userId;
    let formSearchBackup = new BackupVMFormSearch();
    formSearchBackup.pageSize = 9999;
    formSearchBackup.currentPage = 1;
    formSearchBackup.customerId = customerId;

    let formSearchBackupSchedule = new FormSearchScheduleBackup();
    formSearchBackupSchedule.regionId = this.region
    formSearchBackupSchedule.projectId = this.project
    formSearchBackupSchedule.pageSize = 9999
    formSearchBackupSchedule.pageIndex = 1
    formSearchBackupSchedule.customerId = customerId;
    formSearchBackupSchedule.scheduleName = '';
    formSearchBackupSchedule.scheduleStatus = '';

    this.instanceService.search(1, 9999, this.region, this.project, '', '', true, customerId)
      .subscribe(data => {
        this.isLoading = false;
        this.listInstance = data?.records.filter(value => (value?.taskState == 'ACTIVE'));

        this.backupVmService.search(formSearchBackup).subscribe(data2 => {
          this.listBackupVM = data2?.records;
          const idSet = new Set(this.listBackupVM?.map(item => item.instanceId));
          const idSetUnique = Array.from(new Set(idSet));
          this.listInstance?.forEach(item1 => {
            if (!idSetUnique.includes(item1.id)) {
              this.listInstanceNotUse?.push(item1);
            }
          });
          this.backupScheduleService.search(formSearchBackupSchedule).subscribe(data3 => {
            console.log('lịch', data3?.records)
            data3.records?.forEach(item3 => {
              this.listInstanceNotUse = this.listInstanceNotUse.filter(ins => ins.id != item3.serviceId && ins.taskState === 'ACTIVE')

              console.log('list instance', this.listInstanceNotUse);

              this.instanceSelected = this.listInstanceNotUse[0]?.id;
            })
          })

          this.cdr.detectChanges();
        });

      }, error => {
        this.isLoadingInstance = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
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

  isLoadingVolume: boolean = false;
  getListVolume() {
    this.isLoadingVolume = true;
    let customerId = this.tokenService.get()?.userId;
    let formSearchBackupSchedule = new FormSearchScheduleBackup();
    formSearchBackupSchedule.regionId = this.region
    formSearchBackupSchedule.projectId = this.project
    formSearchBackupSchedule.pageSize = 9999
    formSearchBackupSchedule.pageIndex = 1
    formSearchBackupSchedule.customerId = customerId;
    formSearchBackupSchedule.scheduleName = '';
    formSearchBackupSchedule.scheduleStatus = '';
    this.backupVolumeService.getListBackupVolume(this.region, this.project, null, null, 9999, 1).subscribe(data => {
      this.backupVolumeList = data?.records;
      console.log('backup volume', this.backupVolumeList);
      this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region, 9999, 1, null, null).subscribe(data2 => {
        console.log('list volume', data2.records);
        this.listVolume = data2.records;
        const idSetVolume = Array.from(new Set(new Set(data2.records?.map(x => x.id))));
        const idSetUnique = Array.from(new Set(new Set(this.backupVolumeList?.map(y => y.volumeId))));

        console.log('idSetUnique', idSetUnique);
        console.log('idSetVolume', idSetVolume);

        const uniqueElements = idSetVolume.filter(id => !idSetUnique.includes(id));
        console.log('uniqueElements', uniqueElements);

        this.listVolume?.forEach(item => {
          uniqueElements.forEach(item2 => {
            if (item.id === item2) {
              this.listVolumeNotUseUnique?.push(item);
            }
          });
        });
        this.backupScheduleService.search(formSearchBackupSchedule).subscribe(data3 => {
          console.log('lịch', data3?.records)
          data3.records?.forEach(item3 => {
            this.listVolumeNotUseUnique = this.listVolumeNotUseUnique.filter((volume) => volume.id != item3.serviceId && ['AVAILABLE', 'IN-USE'].includes(volume.serviceStatus))

            console.log('list volume', this.listVolumeNotUseUnique);

            this.volumeSelected = this.listVolumeNotUseUnique[0]?.id;
          })
        })
        this.isLoadingVolume = false
        console.log('list volume', this.listVolumeNotUseUnique);
        this.cdr.detectChanges();
      });
    });
  }

  modeChange(value) {
    if (value != undefined) {
      console.log('mode change', value);
      this.modeSelected = value;
      if (this.selectedOption == 'instance') {
        this.validateForm.get('formInstance').get('daysOfWeek').clearValidators();
        this.validateForm.get('formInstance').get('daysOfWeek').markAsPristine();
        this.validateForm.get('formInstance').get('daysOfWeek').reset();

        this.validateForm.get('formInstance').get('daysOfWeekMultiple').clearValidators();
        this.validateForm.get('formInstance').get('daysOfWeekMultiple').markAsPristine();
        this.validateForm.get('formInstance').get('daysOfWeekMultiple').reset();

        this.validateForm.get('formInstance').get('numberOfWeek').clearValidators();
        this.validateForm.get('formInstance').get('numberOfWeek').markAsPristine();
        this.validateForm.get('formInstance').get('numberOfWeek').reset();

        this.validateForm.get('formInstance').get('months').clearValidators();
        this.validateForm.get('formInstance').get('months').markAsPristine();
        this.validateForm.get('formInstance').get('months').reset();

        this.validateForm.get('formInstance').get('date').clearValidators();
        this.validateForm.get('formInstance').get('date').markAsPristine();
        this.validateForm.get('formInstance').get('date').reset();

        if (this.modeSelected == 4) {
          this.setInitialValues();

          this.validateForm.get('formInstance').get('months').clearValidators();
          this.validateForm.get('formInstance').get('months').setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
          this.validateForm.get('formInstance').get('months').markAsDirty();

          this.validateForm.get('formInstance').get('date').clearValidators();
          this.validateForm.get('formInstance').get('date').setValidators([Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]);
          this.validateForm.get('formInstance').get('date').markAsDirty();
        }
        if (this.modeSelected == 3) {
          this.numberOfWeekChangeSelected = 1;
          this.daySelected = 1;

          this.validateForm.get('formInstance').get('daysOfWeek').clearValidators();
          this.validateForm.get('formInstance').get('daysOfWeek').setValidators([Validators.required]);
          this.validateForm.get('formInstance').get('daysOfWeek').markAsDirty();

          this.validateForm.get('formInstance').get('numberOfWeek').clearValidators();
          this.validateForm.get('formInstance').get('numberOfWeek').setValidators([Validators.required]);
          this.validateForm.get('formInstance').get('numberOfWeek').markAsDirty();
        }
        if (this.modeSelected == 2) {
          this.validateForm.get('formInstance').get('daysOfWeekMultiple').clearValidators();
          this.validateForm.get('formInstance').get('daysOfWeekMultiple').setValidators([Validators.required]);
          this.validateForm.get('formInstance').get('daysOfWeekMultiple').markAsDirty();
        }
      } else {
        this.validateForm.get('formVolume').get('daysOfWeek').clearValidators();
        this.validateForm.get('formVolume').get('daysOfWeek').markAsPristine();
        this.validateForm.get('formVolume').get('daysOfWeek').reset();

        this.validateForm.get('formVolume').get('daysOfWeekMultiple').clearValidators();
        this.validateForm.get('formVolume').get('daysOfWeekMultiple').markAsPristine();
        this.validateForm.get('formVolume').get('daysOfWeekMultiple').reset();

        this.validateForm.get('formVolume').get('numberOfWeek').clearValidators();
        this.validateForm.get('formVolume').get('numberOfWeek').markAsPristine();
        this.validateForm.get('formVolume').get('numberOfWeek').reset();

        this.validateForm.get('formVolume').get('months').clearValidators();
        this.validateForm.get('formVolume').get('months').markAsPristine();
        this.validateForm.get('formVolume').get('months').reset();

        this.validateForm.get('formVolume').get('date').clearValidators();
        this.validateForm.get('formVolume').get('date').markAsPristine();
        this.validateForm.get('formVolume').get('date').reset();

        if (this.modeSelected == 4) {
          this.setInitialValues();

          this.validateForm.get('formVolume').get('months').clearValidators();
          this.validateForm.get('formVolume').get('months').setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
          this.validateForm.get('formVolume').get('months').markAsDirty();

          this.validateForm.get('formVolume').get('date').clearValidators();
          this.validateForm.get('formVolume').get('date').setValidators([Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]);
          this.validateForm.get('formVolume').get('date').markAsDirty();
        }
        if (this.modeSelected == 3) {
          this.numberOfWeekChangeSelected = 1;
          this.daySelected = 1;

          this.validateForm.get('formVolume').get('daysOfWeek').clearValidators();
          this.validateForm.get('formVolume').get('daysOfWeek').setValidators([Validators.required]);
          this.validateForm.get('formVolume').get('daysOfWeek').markAsDirty();

          this.validateForm.get('formVolume').get('numberOfWeek').clearValidators();
          this.validateForm.get('formVolume').get('numberOfWeek').setValidators([Validators.required]);
          this.validateForm.get('formVolume').get('numberOfWeek').markAsDirty();
        }
        if (this.modeSelected == 2) {
          this.validateForm.get('formVolume').get('daysOfWeekMultiple').clearValidators();
          this.validateForm.get('formVolume').get('daysOfWeekMultiple').setValidators([Validators.required]);
          this.validateForm.get('formVolume').get('daysOfWeekMultiple').markAsDirty();
        }
      }
    }
  }

  numberOfWeekChange(value: string) {
    this.numberOfWeekChangeSelected = value;
  }

  dayOfWeekChange(value) {
    this.daySelected = value;
  }

  setInitialValues(): void {
    if (this.selectedOption == 'instance') {
      this.validateForm.get('formInstance').get('months').setValue(1);
      this.validateForm.get('formInstance').get('date').setValue(1);
    } else {
      this.validateForm.get('formVolume').get('months').setValue(1);
      this.validateForm.get('formVolume').get('date').setValue(1);
    }
    this.cdr.detectChanges();
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

  doCreateScheduleBackup() {

    console.log('click', this.validateForm.get('formInstance').valid);

    if (this.selectedOption == 'instance') {
      this.isLoadingAction = true;
      let formCreateSchedule = new FormCreateSchedule();
      formCreateSchedule.customerId = this.tokenService.get()?.userId;
      formCreateSchedule.name = this.validateForm.get('formInstance').get('name').value;
      formCreateSchedule.description = this.validateForm.get('formInstance').get('description').value;
      formCreateSchedule.maxBackup = this.validateForm.get('formInstance').get('maxBackup').value;
      formCreateSchedule.mode = this.modeSelected;
      formCreateSchedule.serviceType = 1;
      formCreateSchedule.instanceId = this.validateForm.get('formInstance').get('instanceId').value;
      formCreateSchedule.listAttachedVolume = this.validateForm.get('formInstance').get('volumeToBackupIds').value;
      // formCreateSchedule.backupPacketId = this.validateForm.get('formInstance').get('backupPackage').value;
      formCreateSchedule.runtime = this.datepipe.transform(this.validateForm.get('formInstance').get('times').value, 'yyyy-MM-ddTHH:mm:ss', 'vi-VI');
      if (formCreateSchedule.mode === 3) {
        formCreateSchedule.intervalWeek = this.validateForm.get('formInstance').get('numberOfWeek').value;
        formCreateSchedule.dayOfWeek = this.validateForm.get('formInstance').get('daysOfWeek').value;
      }
      if (formCreateSchedule.mode === 2) {
        formCreateSchedule.daysOfWeek = this.validateForm.get('formInstance').get('daysOfWeekMultiple').value;
      }
      if (formCreateSchedule.mode === 4) {
        formCreateSchedule.intervalMonth = this.validateForm.get('formInstance').get('months').value;
        formCreateSchedule.dayOfMonth = this.validateForm.get('formInstance').get('date').value;
      }
      this.backupScheduleService.create(formCreateSchedule).subscribe(data => {
        this.isLoadingAction = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('schedule.backup.notify.create.success'));
        this.nameList = [];
        this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
      }, error => {
        this.isLoadingAction = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('schedule.backup.notify.create.fail') + '. ' + error.error.detail);
      });
    } else {
      this.isLoadingAction = true;
      let formCreateSchedule1 = new FormCreateSchedule();
      formCreateSchedule1.customerId = this.tokenService.get()?.userId;
      formCreateSchedule1.name = this.validateForm.get('formVolume').get('name').value;
      formCreateSchedule1.description = this.validateForm.get('formVolume').get('description').value;
      formCreateSchedule1.maxBackup = this.validateForm.get('formVolume').get('maxBackup').value;
      formCreateSchedule1.mode = this.modeSelected;
      formCreateSchedule1.serviceType = 2;
      formCreateSchedule1.volumeId = this.validateForm.get('formVolume').get('volumeId').value;
      // formCreateSchedule1.backupPacketId = this.validateForm.get('formVolume').get('backupPackage').value;
      formCreateSchedule1.runtime = this.datepipe.transform(this.validateForm.get('formVolume').get('times').value, 'yyyy-MM-ddTHH:mm:ss', 'vi-VI');
      if (formCreateSchedule1.mode === 3) {
        formCreateSchedule1.intervalWeek = this.validateForm.get('formVolume').get('numberOfWeek').value;
        formCreateSchedule1.dayOfWeek = this.validateForm.get('formVolume').get('daysOfWeek').value;
      }
      if (formCreateSchedule1.mode === 2) {
        formCreateSchedule1.daysOfWeek = this.validateForm.get('formVolume').get('daysOfWeekMultiple').value;
      }
      if (formCreateSchedule1.mode === 4) {
        formCreateSchedule1.intervalMonth = this.validateForm.get('formVolume').get('months').value;
        formCreateSchedule1.dayOfMonth = this.validateForm.get('formVolume').get('date').value;
      }
      this.backupScheduleService.create(formCreateSchedule1).subscribe(data => {
        this.isLoadingAction = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('schedule.backup.volume.notify.create.success'));
        this.nameList = [];
        this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
      }, error => {
        this.isLoadingAction = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('schedule.backup.volume.notify.create.fail') + '. ' + error.error.detail);
      });
    }

  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.modeSelected = 1;

    this.projectService.getByProjectId(this.project).subscribe(data => {
      this.isLoading = false;
      this.sizeInCloudProject = data;
    }, error => {
      this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
      this.isLoading = false;
    });

    this.setInitialValues();
    this.getListInstances();
    this.getInstanceById();
    this.getListScheduleBackup();
    this.getListVolume();
  }
}
