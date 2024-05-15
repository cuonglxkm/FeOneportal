import { Component, Inject } from '@angular/core';
import { BackupVolume } from '../backup-volume.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BackupVolumeService } from '../../../../../shared/services/backup-volume.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { VolumeDTO } from '../../../../../shared/dto/volume.dto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-list-backup-volume',
  templateUrl: './list-backup-volume.component.html',
  styleUrls: ['./list-backup-volume.component.less']
})
export class ListBackupVolumeComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVpc: number
  isLoading: boolean = false

  //child component
  // @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  // private detailComponent: ComponentRef<DetailBackupVolumeComponent>;
  constructor(private service: BackupVolumeService,
              private volumeService: VolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private message: NzMessageService,
              private router: Router) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    // this.getListVolume(true);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    this.isLoading = true;
    // this.getListVolume(true);
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }
}
