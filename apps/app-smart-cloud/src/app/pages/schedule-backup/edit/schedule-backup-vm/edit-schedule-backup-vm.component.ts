import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BackupSchedule, FormEditSchedule, FormSearchScheduleBackup } from '../../../../shared/models/schedule.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DatePipe } from '@angular/common';
import { ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { PackageBackupModel } from '../../../../shared/models/package-backup.model';
import { PackageBackupService } from '../../../../shared/services/package-backup.service';
import { ProjectService } from '../../../../shared/services/project.service';
import { SizeInCloudProject } from '../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-extend-schedule-backup-vm',
  templateUrl: './edit-schedule-backup-vm.component.html',
  styleUrls: ['./edit-schedule-backup-vm.component.less']
})
export class EditScheduleBackupVmComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  modeType: any = '4';
  mode = [
    { label: this.i18n.fanyi('schedule.backup.label.each.day'), value: 1 },
    { label: this.i18n.fanyi('schedule.backup.label.each.number.day'), value: 2 },
    { label: this.i18n.fanyi('schedule.backup.label.each.week'), value: 3 },
    { label: this.i18n.fanyi('schedule.backup.label.each.month'), value: 4 }
  ];
  numberOfWeek = [
    { label: '1 ' + this.i18n.fanyi('app.Week'), value: '1' },
    { label: '2 ' + this.i18n.fanyi('app.Week'), value: '2' },
    { label: '3 ' + this.i18n.fanyi('app.Week'), value: '3' }
  ];
  daysOfWeek = [
    { label: this.i18n.fanyi('schedule.backup.monday'), value: '1' },
    { label: this.i18n.fanyi('schedule.backup.tuesday'), value: '2' },
    { label: this.i18n.fanyi('schedule.backup.wednesday'), value: '3' },
    { label: this.i18n.fanyi('schedule.backup.thursday'), value: '4' },
    { label: this.i18n.fanyi('schedule.backup.friday'), value: '5' },
    { label: this.i18n.fanyi('schedule.backup.saturday'), value: '6' },
    { label: this.i18n.fanyi('schedule.backup.sunday'), value: '7' }
  ];
  isLoading: boolean = false;
  numberOfWeekChangeSelected: string;


  customerId: number;
  idSchedule: number;
  backupSchedule: BackupSchedule;
  listVolume: any[];
  nameList: string[] = [];

  formEdit: FormEditSchedule = new FormEditSchedule();

  validateForm: FormGroup<{
    backupMode: FormControl<number>
    name: FormControl<string>
    description: FormControl<string>
    months: FormControl<number>
    times: FormControl<Date>
    numberOfWeek: FormControl<number>
    date: FormControl<number>
    daysOfWeek: FormControl<string>
    daysOfWeekMultiple: FormControl<string[]>
  }> = this.fb.group({
    backupMode: [4, [Validators.required]],
    name: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]],
    description: [null as string, [Validators.maxLength(255)]],
    months: [1, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
    times: [new Date(), [Validators.required]],
    numberOfWeek: [1],
    date: [1, [Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]],
    daysOfWeek: [''],
    daysOfWeekMultiple: [[] as string[]]
  });

  typeVpc: number;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private scheduleService: ScheduleService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private backupPackageService: PackageBackupService,
              private projectService: ProjectService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              public datepipe: DatePipe) {

  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);

  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null;
    }
  }

  backupPackageDetail = new PackageBackupModel();

  getBackupPackageDetail(id) {
    this.backupPackageService.detail(id, this.project).subscribe(data => {
      this.backupPackageDetail = data;
    });
  }

  modeChange(value) {
    this.validateForm.controls.daysOfWeek.clearValidators();
    this.validateForm.controls.daysOfWeek.markAsPristine();
    this.validateForm.controls.daysOfWeek.reset();

    this.validateForm.controls.daysOfWeekMultiple.clearValidators();
    this.validateForm.controls.daysOfWeekMultiple.markAsPristine();
    this.validateForm.controls.daysOfWeekMultiple.reset();

    this.validateForm.controls.numberOfWeek.clearValidators();
    this.validateForm.controls.numberOfWeek.markAsPristine();
    this.validateForm.controls.months.reset();

    this.validateForm.controls.months.clearValidators();
    this.validateForm.controls.months.markAsPristine();
    this.validateForm.controls.months.reset();

    this.validateForm.controls.date.clearValidators();
    this.validateForm.controls.date.markAsPristine();
    this.validateForm.controls.date.reset();
    if (value === 1) {
      this.modeType = 1;
    } else if (value === 2) {
      this.modeType = 2;

      this.validateForm.controls.daysOfWeekMultiple.clearValidators();
      this.validateForm.controls.daysOfWeekMultiple.markAsPristine();
      this.validateForm.controls.daysOfWeekMultiple.reset();
      this.validateForm.controls.daysOfWeekMultiple.setValidators([Validators.required])

    } else if (value === 3) {
      this.modeType = 3;

      this.validateForm.controls.daysOfWeek.setValue('1');
      this.numberOfWeekChangeSelected = '1'

      this.validateForm.controls.daysOfWeek.setValidators([Validators.required]);
      this.validateForm.controls.daysOfWeek.markAsDirty();

      this.validateForm.controls.numberOfWeek.setValidators([Validators.required]);
      this.validateForm.controls.numberOfWeek.markAsDirty();
    } else if (value === 4) {
      this.modeType = 4;
      this.validateForm.controls.months.setValidators([Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]);
      this.validateForm.controls.months.markAsDirty();
      this.validateForm.controls.months.reset();

      this.validateForm.controls.date.setValidators([Validators.required, Validators.pattern(/^[1-9]|[12][0-9]|3[01]*$/)]);
      this.validateForm.controls.date.markAsDirty();
      this.validateForm.controls.date.reset();
    }
  }

  numberOfWeekChange(value: string) {
    this.numberOfWeekChangeSelected = value;
    console.log('weeek', this.numberOfWeekChangeSelected);
  }

  getData(): FormEditSchedule {
    this.formEdit.customerId = this.tokenService.get()?.userId;
    this.formEdit.name = this.validateForm.controls.name.value;
    this.formEdit.description = this.validateForm.controls.description.value;
    this.formEdit.mode = this.validateForm.controls.backupMode.value;
    this.formEdit.serviceType = 1;
    if (this.formEdit.mode === 3) {
      this.formEdit.intervalWeek = this.validateForm.controls.numberOfWeek.value;
      this.formEdit.dayOfWeek = this.validateForm.controls.daysOfWeek.value;
    }
    if (this.formEdit.mode === 2) {
      this.formEdit.daysOfWeek = this.validateForm.controls.daysOfWeekMultiple.value;
    }
    if (this.formEdit.mode === 4) {
      this.formEdit.intervalMonth = this.validateForm.controls.months.value;
      this.formEdit.dayOfMonth = this.validateForm.controls.date.value;
    }
    return this.formEdit;
  }

  isLoadingAction: boolean = false
  submitForm() {
    this.isLoadingAction = true;
    if (this.validateForm.valid) {
      this.formEdit = this.getData();
      this.formEdit.runtime = this.datepipe.transform(this.validateForm.controls.times.value, 'yyyy-MM-ddTHH:mm:ss', 'vi-VI');

      // this.route.params.subscribe((params) => {
      //     this.idSchedule = params['id']
      this.formEdit.scheduleId = this.idSchedule;
      // })
      this.scheduleService.edit(this.formEdit).subscribe(data => {
        this.isLoadingAction = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('schedule.backup.notify.edit.success'));
        this.nameList = [];
        this.getListScheduleBackup();
        this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
      }, error => {
        this.isLoadingAction = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('schedule.backup.notify.edit.fail'));
        this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
      });
    } else {
      console.log('invalid', this.validateForm.getRawValue());
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  nameVolumeAttach: string;
  getDetail(customerId: number, id: number) {
    this.isLoading = true;

    this.scheduleService.detail(customerId, id).subscribe(data => {
      this.backupSchedule = data;
      this.isLoading = false;
      console.log('type vpc', this.typeVpc)
      if(this.typeVpc ==  1) {
        this.getStorageByVpc(this.project)
      } else {
        this.getBackupPackageDetail(this.backupSchedule?.backupPackageId);
      }
      this.validateForm.controls.backupMode.setValue(this.backupSchedule?.mode);
      this.validateForm.controls.times.setValue(this.backupSchedule?.runtime);
      this.validateForm.controls.name.setValue(this.backupSchedule?.name);
      this.validateForm.controls.description.setValue(this.backupSchedule?.description);
      this.validateForm.controls.months.setValue(this.backupSchedule?.interval);
      this.validateForm.controls.date.setValue(this.backupSchedule?.dates);
      this.numberOfWeekChangeSelected = this.backupSchedule?.interval.toString();
      this.validateForm.controls.numberOfWeek.setValue(parseInt(this.numberOfWeekChangeSelected, 10));
      this.validateForm.controls.daysOfWeek.setValue(this.backupSchedule?.daysOfWeek);
      this.validateForm.controls.daysOfWeekMultiple.setValue(this.backupSchedule?.daysOfWeek?.split(','));

      if (this.backupSchedule && this.backupSchedule.backupScheduleItems) {
        const itemNames = this.backupSchedule.backupScheduleItems.map(item => item.itemName);
        console.log('xyz', itemNames);
        this.nameVolumeAttach = itemNames.join(', ');
      }
      console.log('abc',this.nameVolumeAttach);
      data.backupScheduleItems?.forEach(item => {
        if (this.listVolume?.length > 0) {
          this.listVolume.push(item.itemName);
        } else {
          this.listVolume = [item.itemName];
        }
      });
      if(this.project != this.backupSchedule.projectId) {
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
        this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
      }

    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
      this.router.navigate(['/app-smart-cloud/schedule/backup/list']);
    });
  }

  getListScheduleBackup() {
    let formSearchBackupSchedule = new FormSearchScheduleBackup();
    formSearchBackupSchedule.regionId = this.region;
    formSearchBackupSchedule.projectId = this.project;
    formSearchBackupSchedule.pageSize = 9999;
    formSearchBackupSchedule.pageIndex = 1;
    formSearchBackupSchedule.customerId = this.tokenService.get()?.userId;
    formSearchBackupSchedule.scheduleName = '';
    formSearchBackupSchedule.scheduleStatus = '';
    this.scheduleService.search(formSearchBackupSchedule).subscribe(data => {
      console.log('name', data?.records);
      data?.records?.forEach(item => {
        this.nameList?.push(item.name);
        console.log(this.nameList);
      });

    });
  }

  inputMonthMode(event) {
    if (event.target.value === '0') {
      event.target.value = 1;
      this.validateForm.controls.months.setValue(1);
    }
  }

  inputDayInMonthMode(event) {
    if (event.target.value === '0') {
      event.target.value = 1;
      this.validateForm.controls.date.setValue(1);
    }
  }

  sizeInGb: SizeInCloudProject;
  getStorageByVpc(id) {
    this.projectService.getByProjectId(id).subscribe(data => {
      if(data.cloudProject.type == 'VPC') {
        this.sizeInGb = data
        this.typeVpc = 1
      }
    })
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.customerId = this.tokenService.get()?.userId;
    this.getStorageByVpc(this.project)
    this.route.params.subscribe((params) => {
      this.idSchedule = params['id'];
      if (this.idSchedule !== undefined) {
        this.validateForm.get('maxBackup')?.disable();
        this.validateForm.get('backupPackage')?.disable();
        this.validateForm.get('instanceId')?.disable();
        this.validateForm.get('volumeToBackupIds')?.disable();
        this.getListScheduleBackup();
        this.getDetail(this.customerId, this.idSchedule);
        console.log('typeVpc', this.typeVpc)
      }
    });


  }
}
