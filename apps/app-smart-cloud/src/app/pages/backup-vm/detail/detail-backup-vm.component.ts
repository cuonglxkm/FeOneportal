import {Component, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {BackupVm} from "../../../shared/models/backup-vm";
import {Location} from "@angular/common";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'one-portal-detail-backup-vm',
  templateUrl: './detail-backup-vm.component.html',
  styleUrls: ['./detail-backup-vm.component.less'],
})
export class DetailBackupVmComponent implements OnInit{

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  backupVm: BackupVm;

  constructor(private backupVmService: BackupVmService,
              private location: Location,
              private route: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }
  projectChanged(project: ProjectModel) {
    this.project = project?.id
    console.log(this.project)
  }

  goBack() {
    this.location.back();
  }
  ngOnInit(): void {
    const selectedDetailBackupId = this.route.snapshot.paramMap.get('id')
    console.log(selectedDetailBackupId);
    if(selectedDetailBackupId !== undefined) {
      this.backupVmService.detail(parseInt(selectedDetailBackupId)).subscribe(data => {
        this.backupVm = data
        console.log('data' , this.backupVm)
      })
    }
  }
}
