import {Component, Inject, OnInit, ViewChild} from '@angular/core';
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
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

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
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private packageSnapshotService: PackageSnapshotService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService) {
  }

  navigateToSnapshotPackage(){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages']);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages']);
    }
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.navigateToSnapshotPackage()
      }
    });
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  // getDetailPackageBackup(id) {
  //   this.packageBackupService.detail(id, this.project).subscribe(data => {
  //     console.log('data', data)
  //     this.packageBackupModel = data
  //   })
  // }

  getDetailPackageSnapshot(id) {
    this.packageSnapshotService.detail(id, this.project).subscribe(data => {
      console.log('data', data);
      this.packageSnapshotModel = data;
    });
  }

  navigateToExtend() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/extend/' + this.idPackageBackup])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/extend/' + this.idPackageBackup])
    }
    
  }

  navigateToEdit() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/edit/' + this.idPackageBackup])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/edit/' + this.idPackageBackup])
    }
  }

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type
      }
    });
  }
  url = window.location.pathname;
  ngOnInit() {
    this.idPackageBackup = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    const { regionId, projectId } = getCurrentRegionAndProject();
    this.region = regionId;
    this.project = projectId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    if (this.project && this.region) {
      this.loadProjects();
    }
    if (this.idPackageBackup) {
      // this.getDetailPackageBackup(this.idPackageBackup);
      this.getDetailPackageSnapshot(this.idPackageBackup);
    }
  }
}


