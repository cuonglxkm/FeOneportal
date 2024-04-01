import { Component } from '@angular/core';
import Pagination from "../../../../shared/models/pagination";
import {BackupVm} from "../../../../shared/models/backup-vm";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";
import {Router} from "@angular/router";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";

@Component({
  selector: 'one-portal-blank-volume',
  templateUrl: './blank-volume.component.html',
  styleUrls: ['./blank-volume.component.less'],
})
export class BlankVolumeComponent {
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
