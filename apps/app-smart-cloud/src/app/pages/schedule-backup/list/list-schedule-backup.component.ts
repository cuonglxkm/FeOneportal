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
  constructor(private router: Router,
              private backupScheduleService: ScheduleService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.formSearch.pageIndex = this.pageIndex
    this.formSearch.pageSize = this.pageSize
    this.getListScheduleBackup()
  }

  onChange(value: string) {
    console.log('abc', this.selectedValue)
    if(value === 'all') {
      this.selectedValue = ''
    } else {
      this.selectedValue = value;
    }

    this.formSearch.scheduleStatus = this.selectedValue
    this.getListScheduleBackup()
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
    this.formSearch.scheduleName = this.value
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
    this.getListScheduleBackup();
  }

  getListScheduleBackup() {
    this.isLoading = true
    console.log(this.formSearch.pageIndex)
    console.log(this.formSearch.pageSize)
    this.backupScheduleService.search(this.formSearch).subscribe(data => {
      console.log(data)
        this.response = data
        this.listBackupSchedule = data.records
        this.isLoading = false

    })
  }

  selectedOptionActionChange(value: any, data: any) {
    this.selectedOptionAction = value
    this.selectedAction = data
    switch (parseInt(value, 10)){
      case 1:
        this.navigateToEdit(this.selectedAction.serviceType, this.selectedAction.id)
        break;
      case 2:
        this.showModalPaused(this.selectedAction.id)
        break;
      case 3:
        this.showModalDelete(this.selectedAction.id)
        break;
      case 4:
        console.log(this.selectedAction.id)
        this.showModalRestore(this.selectedAction.id)
        break;
      case 5:
        this.showModalPlay(this.selectedAction.id)
        break;
      default:
        break;
    }
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
    this.getListScheduleBackup()
  }
  handlePausedOk() {
    this.formAction.customerId = this.tokenService.get()?.userId
    this.formAction.actionType = 'pause'
    console.log('action', this.formAction)
    this.backupScheduleService.action(this.formAction).subscribe(data => {
      this.isVisiblePaused = false;
      this.isVisiblePaused = false;
      this.notification.success('Thành công', 'Tạm dừng lịch backup thành công')
      this.getListScheduleBackup()
    }, error =>  {
      this.isVisiblePaused = false;
      this.isVisiblePaused = false;
      this.notification.error('Thất bại','Tạm dừng lịch backup thất bại')
      this.getListScheduleBackup()
    })

  }

  //delete
  showModalDelete(id: number) {
    this.isVisibleDelete = true;
    this.idSchedule = id
  }
  handleDeleteCancel() {
    this.isVisibleDelete = false;
    this.getListScheduleBackup()
  }
  handleDeletedOk() {
    this.backupScheduleService.delete(this.customerId, this.idSchedule).subscribe(data => {
      this.isVisibleDelete = false;
      this.notification.success('Thành công', 'Xóa lịch backup thành công')
      this.getListScheduleBackup()
    }, error =>  {
      this.isVisibleDelete = false;
      this.notification.error('Thất bại','Xóa lịch backup thất bại')
      this.getListScheduleBackup()
    })
  }

  //tiep tuc
  showModalPlay(id: number) {
    this.formAction.scheduleId = id
    this.isVisiblePlay = true;
  }
  handlePlayCancel() {
    this.isVisiblePlay = false;
    this.getListScheduleBackup()
  }
  handlePlaydOk() {
    this.formAction.customerId = this.tokenService.get()?.userId
    this.formAction.actionType = 'play'
    this.backupScheduleService.action(this.formAction).subscribe(data => {
      this.isVisiblePlay = false;
      this.isLoadingPlay = false;
      this.notification.success('Thành công', 'Tiếp tục lịch backup thành công')
      this.getListScheduleBackup()
    }, error =>  {
      this.isVisiblePlay = false;
      this.isLoadingPlay = false;
      this.notification.error('Thất bại','Tiếp tục lịch backup thất bại')
      this.getListScheduleBackup()
    })
  }

  //khoi dong
  showModalRestore(id: number) {
    this.formAction.scheduleId = id
    this.isVisibleRestore = true;
  }
  handleRestoreCancel() {
    this.isVisibleRestore = false;
    this.getListScheduleBackup()
  }
  handleRestoredOk() {
    console.log('id', this.formAction)
    this.formAction.customerId = this.tokenService.get()?.userId
    this.formAction.actionType = 'reactive'
    this.backupScheduleService.action(this.formAction).subscribe(data => {
      this.isVisibleRestore = false;
      this.isLoadingRestore = false
      this.notification.success('Thành công', 'Khôi phục lập lịch backup thành công')
      this.getListScheduleBackup()
    }, error =>  {
      this.isVisibleRestore = false;
      this.isLoadingRestore = false
      this.notification.error('Thất bại','Khôi phục lập lịch backup thất bại')
      this.getListScheduleBackup()
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

  ngOnInit(): void {
    console.log(this.pageSize)
    console.log(this.pageIndex)
    this.formSearch.customerId = this.tokenService.get()?.userId
    this.formSearch.pageIndex = this.pageIndex
    this.formSearch.pageSize = this.pageSize
    this.getListScheduleBackup()
    this.getCapacityBackup()
  }
}
