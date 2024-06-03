import {Component, Inject, OnInit} from '@angular/core';
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {BackupVm, SystemInfoBackup, VolumeBackup} from "../../../shared/models/backup-vm";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {getCurrentRegionAndProject} from "@shared";
import {
  RegionModel,
  ProjectModel,
} from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'one-portal-detail-backup-vm',
  templateUrl: './detail-backup-vm.component.html',
  styleUrls: ['./detail-backup-vm.component.less'],
})
export class DetailBackupVmComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  backupVm: BackupVm;

  systemInfoBackups: SystemInfoBackup[] = []
  volumeBackups: VolumeBackup[] = []

  nameSecurityGroup = []
  nameSecurityGroupTextUnique: string
  nameSecurityGroupText: string[]

  nameFlavorTextUnique: string
  nameFlavorText: string[]
  nameFlavor = []

  nameVolumeBackupAttach = []
  nameVolumeBackupAttachName: string[]
  nameVolumeBackupAttachNameUnique: string


  userId: number
  typeVpc: number
  projectDetail: SizeInCloudProject
  backupPackageDetail: PackageBackupModel = new PackageBackupModel();
  constructor(private backupVmService: BackupVmService,
              private route: ActivatedRoute,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private projectService: ProjectService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private backupPackageService: PackageBackupService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    // this.projectService.getByRegion(this.region).subscribe(data => {
    //   if (data.length) {
    //     localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/backup-vm'])
    //   }
    // });
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.typeVpc = project?.type
    console.log(this.project)
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  getBackupVmById(id) {
    this.backupVmService.detail(id).subscribe(data => {
      this.backupVm = data
      this.systemInfoBackups = this.backupVm.systemInfoBackups
      this.volumeBackups = this.backupVm.volumeBackups
      this.backupVm?.securityGroupBackups.forEach(item => {
        this.nameSecurityGroup?.push(item.sgName)
      })

      this.backupVm?.systemInfoBackups.forEach(item => {
        this.nameFlavor?.push(item.osName)
      })

      this.backupVm?.volumeBackups.forEach(item => {
        if(item.isBootable == false) {
          this.nameVolumeBackupAttach?.push(item.name)
        }
      })

      this.nameSecurityGroupText = Array.from(new Set(this.nameSecurityGroup))
      this.nameSecurityGroupTextUnique = this.nameSecurityGroupText.join('\n')
      console.log('name', this.nameSecurityGroup)
      console.log('data', this.backupVm)
      console.log('unique', this.nameSecurityGroupText)

      this.nameFlavorText = Array.from(new Set(this.nameFlavor))
      this.nameFlavorTextUnique = this.nameFlavorText.join('\n')
      console.log('name', this.nameFlavorText)
      console.log('unique', this.nameFlavorTextUnique)

      this.nameVolumeBackupAttachName = Array.from(new Set(this.nameVolumeBackupAttach))
      this.nameVolumeBackupAttachNameUnique = this.nameVolumeBackupAttachName.join('\n')
      console.log('name', this.nameVolumeBackupAttachName)
      console.log('unique', this.nameVolumeBackupAttachNameUnique)

      this.getBackupPackage(this.backupVm?.backupPacketId);
    }, error => {
      if(error.error.detail.includes('Not Found!')) {
        this.router.navigate(['/app-smart-cloud/backup-vm'])
        this.notification.error('', error.error.detail)
      }
     this.notification.error('', error.error.detail)
    })
  }

  getInfoProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data
    })
  }

  getBackupPackage(value) {
    this.backupPackageService.detail(value).subscribe(data => {
      this.backupPackageDetail = data;
    });
  }


  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId
    const selectedDetailBackupId = this.route.snapshot.paramMap.get('id')
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log(selectedDetailBackupId);
    if (selectedDetailBackupId !== undefined || selectedDetailBackupId !== null || selectedDetailBackupId !== '') {
      this.getInfoProjectVpc(parseInt(selectedDetailBackupId))
      this.getBackupVmById(parseInt(selectedDetailBackupId))
    }
  }
}
