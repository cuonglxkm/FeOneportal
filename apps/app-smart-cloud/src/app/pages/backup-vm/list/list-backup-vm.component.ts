import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupVm, BackupVMFormSearch} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import Pagination from "../../../shared/models/pagination";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-list-backup-vm',
  templateUrl: './list-backup-vm.component.html',
  styleUrls: ['./list-backup-vm.component.less'],
})
export class ListBackupVmComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  value?: string;

  isVisibleDelete: boolean = false

  isLoading: boolean = false;

  status = [
    {label: 'Tất cả', value: 'all'},
    {label: 'Hoạt động', value: 'AVAILABLE'},
    {label: 'Tạm dừng', value: 'SUSPENDED'}
  ]

  serviceStatusMapping = {
    KHOITAO: '-'
  }

  selectedValue?: string = null

  formSearch: BackupVMFormSearch = new BackupVMFormSearch()

  collection: Pagination<BackupVm> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10
  };

  userId: number

  constructor(private backupVmService: BackupVmService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  showModalDelete(): void {
    this.isVisibleDelete = true;
  }

  handleCancelDelete(): void {
    this.isVisibleDelete = false;
  }

  handleOkDelete(id: number) {
    this.isLoading = true
    this.backupVmService.delete(id).subscribe(data => {
      this.isLoading = false
      this.notification.success('Thành công', 'Xóa thành công')
    }, error => {
      this.isLoading = false
      this.notification.error('Thất bại', 'Xóa thất bại')
    })
  }

  getListBackupVM() {
    this.formSearch = this.getParam();
    this.isLoading = true;
    this.backupVmService.search(this.formSearch).subscribe(data => {
      this.isLoading = false
      this.collection = data
      console.log(this.collection)
    })
  }

  onChange(value: string) {
    this.selectedValue = value;
    if (this.selectedValue === 'all') {
      this.formSearch.status = null
    } else {
      this.formSearch.status = value
    }
    this.getListBackupVM()
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.formSearch.pageSize = pageSize;
    this.formSearch.currentPage = pageIndex
    this.getListBackupVM();
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId
  }

  getParam() : BackupVMFormSearch {
    this.formSearch.regionId = this.region

    // this.formSearch.customerId = this.tokenService.get()?.userId
    // this.formSearch.projectId = this.project

    this.formSearch.customerId = null
    this.formSearch.projectId = null


    if (this.value === undefined) {
      this.formSearch.instanceBackupName = null
    } else {
      this.formSearch.instanceBackupName = this.value
    }
    this.formSearch.pageSize = 10
    this.formSearch.currentPage = 1
    return this.formSearch
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/backup-vm/detail-backup-vm/'+id])
  }
}
