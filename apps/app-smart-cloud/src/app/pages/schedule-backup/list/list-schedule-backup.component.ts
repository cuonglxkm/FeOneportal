import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BackupSchedule,
  CapacityBackupSchedule,
  FormSearchScheduleBackup
} from '../../../shared/models/schedule.model';
import { ScheduleService } from '../../../shared/services/schedule.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';

@Component({
  selector: 'one-portal-list-schedule-backup',
  templateUrl: './list-schedule-backup.component.html',
  styleUrls: ['./list-schedule-backup.component.less']
})
export class ListScheduleBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = null;
  value?: string = null;

  status = [
    { label: this.i18n.fanyi("app.order.status.All"), value: 'all' },
    { label: this.i18n.fanyi("service.status.active"), value: 'AVAILABLE' },
    { label: this.i18n.fanyi("app.status.not.done"), value: 'DISABLED' },
    { label: this.i18n.fanyi("app.status.suspend"), value: 'PAUSED' }
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

  constructor(private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private backupScheduleService: ScheduleService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.getListScheduleBackup(true);
    this.getCapacityBackup();
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.getListScheduleBackup(true);
    this.getCapacityBackup();

  }

  onChange(value: string) {
    console.log('abc', this.selectedValue);
    if (value === 'all') {
      this.selectedValue = '';
    } else {
      this.selectedValue = value;
    }
    this.getListScheduleBackup(false);
  }

  // onInputChange(value: string) {
  //   this.value = value;
  //   console.log('input text: ', this.value);
  //   this.getListScheduleBackup(false);
  // }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/create']);
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListScheduleBackup(false)
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListScheduleBackup(false)
  }

  getListScheduleBackup(isBegin) {
    this.isLoading = true;
    let formSearch = new FormSearchScheduleBackup();
    formSearch.scheduleStatus = this.selectedValue
    formSearch.scheduleName = this.value
    formSearch.projectId = this.project
    formSearch.regionId = this.region
    formSearch.pageIndex = this.pageIndex
    formSearch.pageSize = this.pageSize

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
    if (serviceType === 1) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/vm', id]);
    } else if (serviceType === 2) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/volume', id]);
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

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.selectedValue = 'all'
    // this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
    //   this.getListScheduleBackup(false);
    // });
  }
}
