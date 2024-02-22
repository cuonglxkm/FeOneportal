import {Component} from '@angular/core';
import {BackupVolume} from "../backup-volume.model";
import {Router} from "@angular/router";
import {BackupVolumeService} from "../../../../../shared/services/backup-volume.service";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {RegionModel} from "../../../../../shared/models/region.model";
import {ProjectService} from "../../../../../shared/services/project.service";

@Component({
  selector: 'one-portal-detail-backup-volume',
  templateUrl: './detail-backup-volume.component.html',
  styleUrls: ['./detail-backup-volume.component.less'],
})
export class DetailBackupVolumeComponent {
  receivedData: BackupVolume;
  regionId: any;
  projectId: any;

  constructor(private router: Router,
              private service: BackupVolumeService,
              private projectService: ProjectService,) {
  }

  ngOnInit() {
    this.service.sharedData$.subscribe(data => {
      this.receivedData = data;
    });
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.projectService.getByRegion(this.regionId).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/backup-volume']);
      }
    });
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }
}
