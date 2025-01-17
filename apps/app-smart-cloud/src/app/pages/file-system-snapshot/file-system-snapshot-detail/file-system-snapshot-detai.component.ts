import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemDetail } from 'src/app/shared/models/file-system.model';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-file-system-snapshot-detail',
  templateUrl: './file-system-snapshot-detail.component.html',
  styleUrls: ['./file-system-snapshot-detail.component.less'],
})
export class FileSystemSnapshotDetailComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  fileSystemSnapshotId: number
  fileSystemId: number

  isLoading: boolean = false

  fileSystemSnapshotDetail: any;

  fileSystem: FileSystemDetail = new FileSystemDetail();

  typeVPC: number
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private fileSystemSnapshotService: FileSystemSnapshotService,
              private router: Router,
              private fileSystemService: FileSystemService,
              private activatedRoute: ActivatedRoute,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService) {
  }

  onRegionChange(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/file-system-snapshot'])
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id
    this.typeVPC = project?.type;
  }

  userChangeProject(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/file-system-snapshot'])
  }

  getFileSystemSnapshotById(id) {
    this.isLoading = true
    this.fileSystemSnapshotService.getFileSystemSnapshotById(id, this.project).subscribe(data => {
      if(data){
        this.fileSystemSnapshotDetail = data;
        this.fileSystemId = data.shareId;
        this.getFileSystemById(data.shareId);
      } else {
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.storage.not.exist'));
        this.router.navigate([
          '/app-smart-cloud/file-system-snapshot',
        ]);
      }
      this.isLoading = false;
    }, error => {
      this.fileSystemSnapshotDetail = null
      this.isLoading = false;
    })
  }

  getFileSystemById(id) {
    this.fileSystemService.getFileSystemById(id, this.region, this.project).subscribe(data => {
      this.fileSystem = data
    }, error => {
      this.fileSystem = null
    })
  }

  navigateToExtend(){
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/extend/' + this.fileSystemSnapshotId])
  }

  ngOnInit() {
    this.fileSystemSnapshotId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getFileSystemSnapshotById(this.fileSystemSnapshotId)
  }
}
