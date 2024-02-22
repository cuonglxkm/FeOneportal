import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {
  BackupSchedule,
  CapacityBackupSchedule,
  FormAction,
  FormSearchScheduleBackup
} from "../../../shared/models/schedule.model";
import {ScheduleService} from "../../../shared/services/schedule.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {BaseResponse} from "../../../../../../../libs/common-utils/src";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {ProjectService} from "../../../shared/services/project.service";
import {getCurrentRegionAndProject} from "@shared";

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

  isVisiblePlay: boolean = false
  isLoadingPlay: boolean = false

  formAction: FormAction = new FormAction()
  idSchedule: number

  responseCapacityBackup: CapacityBackupSchedule[] = []
  loadingCapacity: boolean = false

  typeVPC: number
  isBegin: boolean = false

  constructor(private router: Router,
              private backupScheduleService: ScheduleService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private projectService: ProjectService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.getListScheduleBackup(true)
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.formSearch.pageIndex = this.pageIndex
    this.formSearch.pageSize = this.pageSize
    this.getListScheduleBackup(true)
  }

  onChange(value: string) {
    console.log('abc', this.selectedValue)
    if(value === 'all') {
      this.selectedValue = ''
    } else {
      this.selectedValue = value;
    }

    this.formSearch.scheduleStatus = this.selectedValue
    this.getListScheduleBackup(false)
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
    this.formSearch.scheduleName = this.value
    this.getListScheduleBackup(false)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/create'])
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageIndex = pageIndex
    this.formSearch.pageIndex = this.pageIndex
    this.formSearch.pageSize = this.pageSize
    this.getListScheduleBackup(false);
  }

  getListScheduleBackup(isBegin) {
    this.isLoading = true
    console.log(this.formSearch.pageIndex)
    console.log(this.formSearch.pageSize)

    this.formSearch.regionId = this.region;
    this.formSearch.projectId = this.project;

    console.log(this.formSearch)

    this.backupScheduleService.search(this.formSearch).subscribe(data => {
      console.log(data)
        this.response = data
        this.listBackupSchedule = data.records
        this.isLoading = false
      if (isBegin) {
        this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }

    })
  }

  navigateToEdit(serviceType: number, id: number) {
    if(serviceType === 1) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/vm',  id])
    } else if (serviceType === 2) {
      this.router.navigate(['/app-smart-cloud/schedule/backup/edit/volume',  id])
    }
  }

  //paused
  showModalPaused(id: number) {
    this.isVisiblePaused = true;
    this.formAction.scheduleId = id
  }
  handlePausedCancel() {
    this.isVisiblePaused = false;
    this.getListScheduleBackup(false)
  }
  handlePausedOk() {
    this.formAction.customerId = this.tokenService.get()?.userId
    this.formAction.actionType = 'pause'
    console.log('action', this.formAction)
    this.backupScheduleService.action(this.formAction).subscribe(data => {
      this.isVisiblePaused = false;
      this.isVisiblePaused = false;
      this.notification.success('Thành công', 'Tạm dừng lịch backup thành công')
      this.getListScheduleBackup(false)
    }, error =>  {
      this.isVisiblePaused = false;
      this.isVisiblePaused = false;
      this.notification.error('Thất bại','Tạm dừng lịch backup thất bại')
      this.getListScheduleBackup(false)
    })

  }

  //delete
  showModalDelete(id: number) {
    this.isVisibleDelete = true;
    this.idSchedule = id
  }
  handleDeleteCancel() {
    this.isVisibleDelete = false;
    this.getListScheduleBackup(false)
  }
  handleDeletedOk() {
    this.backupScheduleService.delete(this.customerId, this.idSchedule).subscribe(data => {
      this.isVisibleDelete = false;
      this.notification.success('Thành công', 'Xóa lịch backup thành công')
      this.getListScheduleBackup(false)
    }, error =>  {
      this.isVisibleDelete = false;
      this.notification.error('Thất bại','Xóa lịch backup thất bại')
      this.getListScheduleBackup(false)
    })
  }

  //tiep tuc
  showModalPlay(id: number) {
    this.formAction.scheduleId = id
    this.isVisiblePlay = true;
  }
  handlePlayCancel() {
    this.isVisiblePlay = false;
    this.getListScheduleBackup(false)
  }
  handlePlaydOk() {
    this.formAction.customerId = this.tokenService.get()?.userId
    this.formAction.actionType = 'play'
    this.backupScheduleService.action(this.formAction).subscribe(data => {
      this.isVisiblePlay = false;
      this.isLoadingPlay = false;
      this.notification.success('Thành công', 'Tiếp tục lịch backup thành công')
      this.getListScheduleBackup(false)
    }, error =>  {
      this.isVisiblePlay = false;
      this.isLoadingPlay = false;
      this.notification.error('Thất bại','Tiếp tục lịch backup thất bại')
      this.getListScheduleBackup(false)
    })
  }

  //khoi dong
  showModalRestore(id: number) {
    this.formAction.scheduleId = id
    this.isVisibleRestore = true;
  }
  handleRestoreCancel() {
    this.isVisibleRestore = false;
    this.getListScheduleBackup(false)
  }
  handleRestoredOk() {
    console.log('id', this.formAction)
    this.formAction.customerId = this.tokenService.get()?.userId
    this.formAction.actionType = 'reactive'
    this.backupScheduleService.action(this.formAction).subscribe(data => {
      this.isVisibleRestore = false;
      this.isLoadingRestore = false
      this.notification.success('Thành công', 'Khôi phục lập lịch backup thành công')
      this.getListScheduleBackup(false)
    }, error =>  {
      this.isVisibleRestore = false;
      this.isLoadingRestore = false
      this.notification.error('Thất bại','Khôi phục lập lịch backup thất bại')
      this.getListScheduleBackup(false)
    })
  }

  getCapacityBackup() {
    this.loadingCapacity = true
    this.backupScheduleService.getCapacityBackup(this.region, this.project).subscribe(data => {
      this.loadingCapacity = false
      this.responseCapacityBackup = data
    }, error => {
      this.loadingCapacity = false
      this.responseCapacityBackup = null
    })
  }

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type
      }
    });
  }

  ngOnInit(): void {
    this.formSearch.pageIndex = this.pageIndex
    this.formSearch.pageSize = this.pageSize
    this.formSearch.regionId = this.region;
    this.formSearch.projectId = this.project;

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    if (this.project && this.region) {
      this.loadProjects()
    }

    this.getListScheduleBackup(true)

    this.getCapacityBackup()
  }
}
