import {Component, Input} from '@angular/core';
import {BackupVolume} from "../backup-volume.model";
import {IpPublicService} from "../../../../../shared/services/ip-public.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ListBackupVolumeComponent} from "../list-backup-volume/list-backup-volume.component";
import {log} from "@delon/util";
import {BackupVolumeService} from "../../../../../shared/services/backup-volume.service";
import {BehaviorSubject} from "rxjs";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {RegionModel} from "../../../../../shared/models/region.model";

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
              private service: BackupVolumeService) {}

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
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }
}
