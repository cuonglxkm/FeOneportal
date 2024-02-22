import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {BackupVm, SystemInfoBackup, VolumeBackup} from "../../../shared/models/backup-vm";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ProjectService} from "../../../shared/services/project.service";
import {getCurrentRegionAndProject} from "@shared";

@Component({
  selector: 'one-portal-detail-backup-vm',
  templateUrl: './detail-backup-vm.component.html',
  styleUrls: ['./detail-backup-vm.component.less'],
})
export class DetailBackupVmComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  backupVm: BackupVm;

  systemInfoBackups: SystemInfoBackup[] = []
  volumeBackups: VolumeBackup[] = []

  nameSecurityGroup = []
  nameSecurityGroupText: string
  nameSecurityGroupTextUnique: string[]
  userId: number

  volum

  constructor(private backupVmService: BackupVmService,
              private route: ActivatedRoute,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private projectService: ProjectService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/backup-vm'])
      }
    });
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    console.log(this.project)
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId
    const selectedDetailBackupId = this.route.snapshot.paramMap.get('id')
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log(selectedDetailBackupId);
    if (selectedDetailBackupId !== undefined) {
      this.backupVmService.detail(parseInt(selectedDetailBackupId)).subscribe(data => {
        this.backupVm = data
        this.systemInfoBackups = this.backupVm.systemInfoBackups
        this.volumeBackups = this.backupVm.volumeBackups
        this.backupVm.securityGroupBackups.forEach(item => {
          this.nameSecurityGroup.push(item.sgName)
        })

        this.nameSecurityGroupTextUnique = Array.from(new Set(this.nameSecurityGroup))
        this.nameSecurityGroupText = this.nameSecurityGroupTextUnique.join(', ')
        console.log('name', this.nameSecurityGroup)
        console.log('data', this.backupVm)
      })
    }
  }
}
