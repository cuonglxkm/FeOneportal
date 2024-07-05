import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BackupSchedule,
  CapacityBackupSchedule,
  FormSearchScheduleBackup
} from '../../../shared/models/schedule.model';
import { ScheduleService } from '../../../shared/services/schedule.service';
import { BaseResponse, NotificationService, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-list-schedule-backup',
  templateUrl: './list-schedule-backup.component.html',
  styleUrls: ['./list-schedule-backup.component.less']
})
export class ListScheduleBackupComponent implements OnInit, OnDestroy {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = null;
  value?: string = '';

  status = [
    { label: this.i18n.fanyi('app.status.all'), value: 'all' },
    { label: this.i18n.fanyi('service.status.active'), value: 'ACTIVE' },
    { label: this.i18n.fanyi('app.status.not.done'), value: 'DISABLED' },
    { label: this.i18n.fanyi('app.status.suspend'), value: 'PAUSED' }
  ];

  listBackupSchedule: BackupSchedule[] = [];
  customerId: number;
  searchDelay = new Subject<boolean>();
  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<BackupSchedule[]>;
  isLoading: boolean = false;

  selectedAction: BackupSchedule;

  responseCapacityBackup: CapacityBackupSchedule[] = [];
  loadingCapacity: boolean = false;

  typeVPC: number;
  isBegin: boolean = false;

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;

  projectName: string;

  backupPackageModel: PackageBackupModel = new PackageBackupModel()

  constructor(private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private backupScheduleService: ScheduleService,
              private backupPackageService: PackageBackupService,
              private notification: NzNotificationService,
              private notificationService: NotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.getListScheduleBackup(true);
    this.getCapacityBackup();
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.projectName = project?.projectName
    this.getListScheduleBackup(true);
    this.getCapacityBackup();
  }

  onChange(value: string) {
    console.log('abc', this.selectedValue);
    if (value == 'all') {
      this.selectedValue = '';
    } else {
      this.selectedValue = value;
    }
    this.getListScheduleBackup(false);
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  changeInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressed = false;
    this.dataSubjectInputSearch.next(value);
  }

  onChangeInputChange() {
    this.searchSubscription = this.dataSubjectInputSearch.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressed) {
        this.value = res.trim();
        this.getListScheduleBackup(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListScheduleBackup(false);
  }

  // onInputChange(value: string) {
  //   this.value = value;
  //   console.log('input text: ', this.value);
  //   this.getListScheduleBackup(false);
  // }

  navigateToCreate(typeVpc: number) {
    console.log('type vpc')
    if(typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/create/vpc']);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/backup/create']);
    }

  }

  navigateToCreateVpc() {

  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListScheduleBackup(false);
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListScheduleBackup(false);
  }

  getListScheduleBackup(isBegin) {
    this.isLoading = true;
    let formSearch = new FormSearchScheduleBackup();
    if (this.selectedValue == 'all') {
      formSearch.scheduleStatus = '';
    } else {
      formSearch.scheduleStatus = this.selectedValue;
    }
    formSearch.scheduleName = this.value;
    formSearch.projectId = this.project;
    formSearch.regionId = this.region;
    formSearch.pageIndex = this.pageIndex;
    formSearch.pageSize = this.pageSize;


    this.backupScheduleService.search(formSearch).subscribe(data => {
      console.log(data);
      this.response = data;
      this.listBackupSchedule = data.records;
      this.isLoading = false;
      if (isBegin) {
        this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    }, error => {
      this.response = null;
      this.isLoading = false;
    });
  }

  navigateToEdit(serviceType: number, id: number) {
    console.log('serviceType', serviceType);
    console.log('id', serviceType);
    if (serviceType === 1) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/vm/', id]);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/volume/', id]);
    }
  }

  //paused
  handlePausedOk() {
    this.getListScheduleBackup(false);
  }

  //delete
  handleDeletedOk() {
    this.getListScheduleBackup(false);
  }

  //tiep tuc
  handlePlaydOk() {
    this.getListScheduleBackup(false);
  }

  //khoi dong
  handleRestoredOk() {
    this.getListScheduleBackup(false);
  }

  getCapacityBackup() {
    this.loadingCapacity = true;
    this.backupScheduleService.getCapacityBackup(this.region, this.project).subscribe(data => {
      this.loadingCapacity = false;
      this.responseCapacityBackup = data;
    }, error => {
      this.loadingCapacity = false;
      this.responseCapacityBackup = null;
    });
  }

  isLoadingBackupPackage: boolean = false
  getBackupPackage(id) {
    this.isLoadingBackupPackage = true
    this.backupPackageService.detail(id, this.project).subscribe(data => {
      this.isLoadingBackupPackage = false
      this.backupPackageModel = data;
    }, error => {
      this.isLoadingBackupPackage = false
      this.notification.error(error.statusText, this.i18n.fanyi('app.failData'))
    })
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.selectedValue = 'all';
    this.onChangeInputChange();
    // this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
    //   this.getListScheduleBackup(false);
    // });

    this.notificationService.connection.on('UpdateBackupSchedule', (message) => {
      if (message) {
        switch (message.actionType) {
          case "PROCESSING":
          case "COMPLETED":
            this.getListScheduleBackup(false);
          break;
          }
      }
    });
  }
}
