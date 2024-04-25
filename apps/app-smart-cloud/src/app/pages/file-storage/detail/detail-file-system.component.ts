import { Component, OnInit } from '@angular/core';
import { FileSystemService } from '../../../shared/services/file-system.service';
import { FileSystemDetail } from '../../../shared/models/file-system.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-detail-file-system',
  templateUrl: './detail-file-system.component.html',
  styleUrls: ['./detail-file-system.component.less'],
})
export class DetailFileSystemComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  fileSystemId: number
  fileSystemName: string

  isLoading: boolean = false

  fileSystem: FileSystemDetail = new FileSystemDetail();

  typeVpc: number


  constructor(private fileSystemService: FileSystemService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private clipboardService: ClipboardService) {
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
  }

  projectChanged(project: ProjectModel) {
    this.typeVpc = project?.type
    this.project = project?.id
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
  }

  getFileSystemById(id) {
    this.isLoading = true
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
      this.fileSystem = data
      this.isLoading = false
      this.fileSystemName = data.name
    }, error => {
      this.fileSystem = null
      this.isLoading = false
    })
  }

  copyText(data) {
    this.clipboardService.copyFromContent(data);
  }

  navigateToResize(typeVpc) {
    if(typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/resize/' + this.fileSystemId])
    }
    if(typeVpc == 0) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/' + this.fileSystemId + '/resize' ])

    }
  }
  ngOnInit() {
    this.fileSystemId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getFileSystemById(this.fileSystemId)
  }
}
