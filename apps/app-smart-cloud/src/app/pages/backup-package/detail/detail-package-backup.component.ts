import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NonNullableFormBuilder } from '@angular/forms';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-detail-package-backup',
  templateUrl: './detail-package-backup.component.html',
  styleUrls: ['./detail-package-backup.component.less']
})
export class DetailPackageBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  packageBackupModel: PackageBackupModel = new PackageBackupModel();

  idPackageBackup: number;

  typeVPC: number;

  isLoading: boolean = false;

  isPermissionExtend: boolean = false;
  isPermissionResize: boolean = false;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService,
              private policyService: PolicyService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;

    this.isPermissionExtend = this.policyService.hasPermission("order:GetOrderAmount") && this.policyService.hasPermission("order:Create") && this.policyService.hasPermission("backup:GetBackupPacket");

    this.isPermissionResize = this.policyService.hasPermission("order:GetOrderAmount") && this.policyService.hasPermission("order:Create") && this.policyService.hasPermission("configuration:Get") && this.policyService.hasPermission("backup:GetBackupPacket");;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup/packages']);
  }

  getDetailPackageBackup(id) {
    this.isLoading = true;
    this.packageBackupService.detail(id, this.project).subscribe(data => {
      console.log('data', data);
      this.isLoading = false;
      this.packageBackupModel = data;
    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.backup.package.not.found'));
      this.router.navigate(['/app-smart-cloud/backup/packages']);
    });
  }

  navigateToExtend() {
    this.router.navigate(['/app-smart-cloud/backup/packages/extend/' + this.idPackageBackup]);
  }

  navigateToResize() {
    this.router.navigate(['/app-smart-cloud/backup/packages/resize/' + this.idPackageBackup]);
  }

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type;
      }
    });
  }

  ngOnInit() {
    this.idPackageBackup = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    // this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects();
    }
    if (this.idPackageBackup != null) {
      this.getDetailPackageBackup(this.idPackageBackup);
    }
  }
}
