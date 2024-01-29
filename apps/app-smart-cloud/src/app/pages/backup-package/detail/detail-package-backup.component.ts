import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NonNullableFormBuilder} from "@angular/forms";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PackageBackupModel} from "../../../shared/models/package-backup.model";

@Component({
  selector: 'one-portal-detail-package-backup',
  templateUrl: './detail-package-backup.component.html',
  styleUrls: ['./detail-package-backup.component.less'],
})
export class DetailPackageBackupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  packageBackupModel: PackageBackupModel = new PackageBackupModel()

  idPackageBackup: number

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
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


  ngOnInit() {
    this.idPackageBackup = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.idPackageBackup != null) {
      this.getDetailPackageBackup(this.idPackageBackup)
    }
  }
}
