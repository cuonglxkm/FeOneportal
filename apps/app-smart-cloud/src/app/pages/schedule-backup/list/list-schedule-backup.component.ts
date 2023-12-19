import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupSchedule, FormSearchScheduleBackup} from "../../../shared/models/schedule.model";
import {ScheduleService} from "../../../shared/services/schedule.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {BaseResponse} from "../../../../../../../libs/common-utils/src";

@Component({
  selector: 'one-portal-list-schedule-backup',
  templateUrl: './list-schedule-backup.component.html',
  styleUrls: ['./list-schedule-backup.component.less'],
})
export class ListScheduleBackupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = null
  value?: string;

  status = [
    {label: 'Tất cả', value: 'all'},
    {label: 'Hoạt động', value: 'ACTIVE'},
    {label: 'Gián đoạn', value: 'DISABLED'},
    {label: 'Tạm dừng', value: 'PAUSED'}
  ]

  listBackupSchedule: BackupSchedule[] = []
  formSearch: FormSearchScheduleBackup = new FormSearchScheduleBackup()
  customerId: number

  pageSize: number = 10
  pageIndex: number = 1

  response: BaseResponse<BackupSchedule[]>
  isLoading: boolean = false

  selectedOptionAction: any
  selectedAction: BackupSchedule

  isVisiblePaused: boolean = false
  isLoadingModalPaused: boolean = false

  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

  isVisibleRestore: boolean = false
  isLoadingRestore: boolean = false

  constructor(private router: Router,
              private backupScheduleService: ScheduleService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onChange(value: string) {
    console.log('abc', this.selectedValue)
    this.selectedValue = value;

  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/create'])
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.formSearch.pageSize = pageSize;
    this.formSearch.pageIndex = pageIndex
    this.getListScheduleBackup();
  }

  getListScheduleBackup() {
    this.isLoading = true
    this.backupScheduleService.search(this.formSearch).subscribe(data => {
      console.log(data)
      if(data.totalCount == 0) {
        this.isLoading = false
        this.router.navigate(['/app-smart-cloud/schedule/backup/blank'])
      } else {
        this.response = data
        this.listBackupSchedule = data.records
        this.isLoading = false
      }
    })
  }

  selectedOptionActionChange(value: any, data: any) {
    this.selectedOptionAction = value
    this.selectedAction = data
    switch (parseInt(value, 10)){
      case 1:
        this.navigateToEdit(this.selectedAction.serviceType)
        break;
      case 2:
        this.showModalPaused()
        break;
      case 3:
        this.showModalDelete()
        break;
      case 4:
        this.showModalRestore()
        break;
      case 5:
        break;
      default:
        break;
    }
  }

  navigateToEdit(serviceType: number) {
    if(serviceType === 1) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/vm'])
    } else if (serviceType === 2) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/volume'])
    }
  }

  //paused
  showModalPaused() {
    this.isVisiblePaused = true;
  }
  handlePausedCancel() {
    this.isVisiblePaused = false;
  }
  handlePausedOk() {
    this.isVisiblePaused = false;
  }

  //delete
  showModalDelete() {
    this.isVisibleDelete = true;
  }
  handleDeleteCancel() {
    this.isVisibleDelete = false;
  }
  handleDeletedOk() {
    this.isVisibleDelete = false;
  }

  //restore
  showModalRestore() {
    this.isVisibleRestore = true;
  }
  handleRestoreCancel() {
    this.isVisibleRestore = false;
  }
  handleRestoredOk() {
    this.isVisibleRestore = false;
  }

  ngOnInit(): void {
    this.formSearch.customerId = this.tokenService.get()?.userId
    this.formSearch.pageIndex = 1
    this.formSearch.pageSize = 10
    this.getListScheduleBackup()
  }
}
