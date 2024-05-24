import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemDetail } from 'src/app/shared/models/file-system.model';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

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

  breadcrumbItems = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Dịch vụ hạ tầng' },
    { label: 'File Storage' },
    { label: 'File System Snapshot', link: '/app-smart-cloud/file-system-snapshot/list' },
    { label: 'Chi tiết File System Snapshot' }
  ];

  constructor(private fileSystemSnapshotService: FileSystemSnapshotService,
              private router: Router,
              private fileSystemService: FileSystemService,
              private activatedRoute: ActivatedRoute) {
  }

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/list'])
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id
    this.typeVPC = project?.type;
  }

  userChangeProject(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/file-system-snapshot/list'])
  }

  getFileSystemSnapshotById(id) {
    this.isLoading = true
    this.fileSystemSnapshotService.getFileSystemSnapshotById(id).subscribe(data => {
      this.fileSystemSnapshotDetail = data
      this.fileSystemId = data.shareId
      this.getFileSystemById(data.shareId)
      this.isLoading = false
    }, error => {
      this.fileSystemSnapshotDetail = null
      this.isLoading = false
    })
  }

  getFileSystemById(id) {
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
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
