import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupVm, BackupVMFormSearch} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import Pagination from "../../../shared/models/pagination";
import {AllowAddressPair} from "../../../shared/models/allow-address-pair";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

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
    {label: 'Tạm dừng', value: 'SUSPENDED'},
    {label: 'Lỗi', value: 'ERROR'}
  ]

  selectedValue: null

  formSearch: BackupVMFormSearch = new BackupVMFormSearch()

  collection: Pagination<BackupVm> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10
  };

  constructor(private backupVmService: BackupVmService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
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

  handleOkDelete() {
  }

  getListBackupVM(formSearch: BackupVMFormSearch) {
    this.isLoading = true;
    this.backupVmService.search(formSearch).subscribe(data => {
      this.isLoading = false
      this.collection = data
      console.log(this.collection)
    })
  }

  onChange(value) {
    this.selectedValue = value.value;
    console.log('selected', this.selectedValue)
    if (this.selectedValue === 'all') {
      this.formSearch.status = null
    } else {
      this.formSearch.status = this.selectedValue
    }
    this.getListBackupVM(this.formSearch)
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.formSearch.pageSize = pageSize;
    this.formSearch.currentPage = pageIndex
    this.getListBackupVM(this.formSearch);
  }

  ngOnInit(): void {
    console.log(this.region)
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
    console.log(this.formSearch)
  }
}
