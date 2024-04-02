import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { FormSearchNetwork, NetWorkModel } from '../../../shared/models/vlan.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { FileSystemDetail } from 'src/app/shared/models/file-system.model';
import { FileSystemService } from 'src/app/shared/services/file-system.service';


@Component({
  selector: 'one-portal-file-system-snapshot-detail',
  templateUrl: './file-system-snapshot-detail.component.html',
  styleUrls: ['./file-system-snapshot-detail.component.less'],
})
export class FileSystemSnapshotDetailComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  fileSystemSnapshotId: number
  fileSystemId: number

  isLoading: boolean = false

  fileSystemSnapshotDetail: any;

  fileSystem: FileSystemDetail = new FileSystemDetail();

  constructor(private fileSystemSnapshotService: FileSystemSnapshotService,
              private router: Router,
              private fileSystemService: FileSystemService,
              private activatedRoute: ActivatedRoute) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/list'])
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/list'])
  }

  getFileSystemSnapshotById(id) {
    this.isLoading = true
    this.fileSystemSnapshotService.getFileSystemSnapshotById(id).subscribe(data => {
      this.fileSystemSnapshotDetail = data
      console.log(data);
      this.fileSystemId = data.shareId
      this.isLoading = false
      this.getFileSystemById(data.shareId)
    }, error => {
      this.fileSystemSnapshotDetail = null
      this.isLoading = false
    })
  }

  getFileSystemById(id) {
    this.isLoading = true
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
      this.fileSystem = data
      console.log(data);
      
      this.isLoading = false
    }, error => {
      this.fileSystem = null
      this.isLoading = false
    })
  }

  ngOnInit() {
    this.fileSystemSnapshotId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getFileSystemSnapshotById(this.fileSystemSnapshotId)
  }
}
