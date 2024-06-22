import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NonNullableFormBuilder} from "@angular/forms";
import {PackageBackupModel} from "../../../shared/models/package-backup.model";
import {getCurrentRegionAndProject} from "@shared";
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from 'src/app/shared/services/project.service';
import { PackageSnapshotModel } from '../../../shared/models/package-snapshot.model';
import { PackageSnapshotService } from '../../../shared/services/package-snapshot.service';

@Component({
  selector: 'one-portal-detail-package-snapshot',
  templateUrl: './detail-package-snapshot.component.html',
  styleUrls: ['./detail-package-snapshot.component.less'],
})
export class DetailSnapshotComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  packageBackupModel: PackageBackupModel = new PackageBackupModel()
  packageSnapshotModel: PackageSnapshotModel = new PackageSnapshotModel();
  idPackageBackup: number

  typeVPC: number

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private packageSnapshotService: PackageSnapshotService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/backup/packages'])
      }
    });
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  getDetailPackageBackup(id) {
    this.packageBackupService.detail(id, this.project).subscribe(data => {
      console.log('data', data)
      this.packageBackupModel = data
    })
  }

  getDetailPackageSnapshot(id) {
    this.packageSnapshotService.detail(id, this.project).subscribe(data => {
      console.log('data', data);
      this.packageSnapshotModel = data;
    });
  }

  navigateToExtend() {
    this.router.navigate(['/app-smart-cloud/snapshot/packages/extend/' + this.idPackageBackup])
  }

  navigateToEdit() {
    this.router.navigate(['/app-smart-cloud/snapshot/packages/edit/' + this.idPackageBackup])
  }

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type
      }
    });
  }
  ngOnInit() {
    this.idPackageBackup = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    const { regionId, projectId } = getCurrentRegionAndProject();
    this.region = regionId;
    this.project = projectId;
    if (this.project && this.region) {
      this.loadProjects();
    }
    if (this.idPackageBackup) {
      this.getDetailPackageBackup(this.idPackageBackup);
      this.getDetailPackageSnapshot(this.idPackageBackup);
    }
  }
}


