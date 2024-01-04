import {Component, Inject} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupVm, BackupVMFormSearch} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import Pagination from "../../../shared/models/pagination";

@Component({
  selector: 'one-portal-blank-backup-vm',
  templateUrl: './blank-backup-vm.component.html',
  styleUrls: ['./blank-backup-vm.component.less'],
})
export class BlankBackupVmComponent {
  region: number;

  project: number;

  collection: Pagination<BackupVm> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10
  };

  isLoading: boolean = false;

  constructor(private backupVmService: BackupVmService,
              private router: Router) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.getListBackupVM()
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    console.log('select')
    this.getListBackupVM()
  }

  getListBackupVM() {
    const initFormSearch = new BackupVMFormSearch();
    initFormSearch.regionId = this.region
    // initFormSearch.customerId = this.tokenService.get()?.userId
    initFormSearch.projectId = this.project
    initFormSearch.instanceBackupName = null
    initFormSearch.currentPage = 1
    initFormSearch.pageSize = 10
    this.isLoading = true
    this.backupVmService.search(initFormSearch).subscribe(data => {
      this.isLoading = false
      console.log('data', data)
      if (data.totalCount) {
        this.router.navigate(['/app-smart-cloud/backup-vm'])
      }
      this.collection = data

    })
  }




}
