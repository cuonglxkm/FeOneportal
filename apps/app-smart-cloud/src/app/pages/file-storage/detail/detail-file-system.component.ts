import { Component, OnInit } from '@angular/core';
import { FileSystemService } from '../../../shared/services/file-system.service';
import { FileSystemDetail } from '../../../shared/models/file-system.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-detail-file-system',
  templateUrl: './detail-file-system.component.html',
  styleUrls: ['./detail-file-system.component.less']
})
export class DetailFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  fileSystemId: number;
  fileSystemName: string;

  isLoading: boolean = true;

  fileSystem: FileSystemDetail = new FileSystemDetail();

  typeVpc: number;


  constructor(private fileSystemService: FileSystemService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private clipboardService: ClipboardService,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  projectChanged(project: ProjectModel) {
    this.typeVpc = project?.type;
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  getFileSystemById(id) {
    this.isLoading = true;
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
      this.fileSystem = data;
      this.isLoading = false;
      this.fileSystemName = data.name;
    }, error => {
      console.log('error', error);
      this.isLoading = false;
      if(error.error?.detail.includes('The resource could not be found.')){
        this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
        this.notification.error('Thất bại', 'File System không tồn tại');
      } else {
        this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
        this.notification.error('Thất bại', error.error.message);
      }


    });
  }

  copyText(data) {
    this.clipboardService.copyFromContent(data);
  }

  //vpc = 1, no vpc = 0
  navigateToResize(typeVpc) {
    if (typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/resize/vpc/' + this.fileSystemId ]);
    }
    if (typeVpc == 0) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/resize/normal/' + this.fileSystemId]);

    }
  }

  navigateToExtend() {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/' + this.fileSystemId + '/extend']);
  }

  ngOnInit() {
    this.fileSystemId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idFileSystem'));
    console.log('id file system', this.fileSystemId)
    setTimeout(() => {
      this.getFileSystemById(this.fileSystemId);
    }, 2500);
  }
}
