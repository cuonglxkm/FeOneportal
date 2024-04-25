import {Component, Inject} from '@angular/core';
import {BackupVm, BackupVMFormSearch} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import Pagination from "../../../shared/models/pagination";
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

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
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    console.log('select')
  }

}
