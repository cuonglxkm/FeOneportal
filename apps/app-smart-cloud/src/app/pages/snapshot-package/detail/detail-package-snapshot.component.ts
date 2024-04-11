import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NonNullableFormBuilder} from "@angular/forms";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PackageBackupModel} from "../../../shared/models/package-backup.model";
import {getCurrentRegionAndProject} from "@shared";
import {ProjectService} from "../../../shared/services/project.service";

@Component({
  selector: 'one-portal-detail-package-snapshot',
  templateUrl: './detail-package-snapshot.component.html',
  styleUrls: ['./detail-package-snapshot.component.less'],
})
export class DetailSnapshotComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  packageBackupModel: PackageBackupModel = new PackageBackupModel()

  idPackageBackup: number

  typeVPC: number

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
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
    this.packageBackupService.detail(id).subscribe(data => {
      console.log('data', data)
      this.packageBackupModel = data
    })
  }

  navigateToExtend() {
    this.router.navigate(['/app-smart-cloud/backup/packages/extend/' + this.idPackageBackup])
  }

  navigateToEdit() {
    this.router.navigate(['/app-smart-cloud/backup/packages/edit/' + this.idPackageBackup])
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
    this.idPackageBackup = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    // this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects()
    }
    if(this.idPackageBackup != null) {
      this.getDetailPackageBackup(this.idPackageBackup)
    }
  }
}