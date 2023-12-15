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
  ngOnInit(): void {
    this.formSearch.customerId = this.tokenService.get()?.userId
    this.formSearch.pageIndex = 1
    this.formSearch.pageSize = 10
    this.getListScheduleBackup()
  }
}
