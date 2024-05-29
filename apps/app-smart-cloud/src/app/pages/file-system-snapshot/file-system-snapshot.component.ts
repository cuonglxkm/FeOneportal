import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { IpFloatingService } from '../../shared/services/ip-floating.service';
import { FormSearchIpFloating, IpFloating } from '../../shared/models/ip-floating.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse, NotificationService, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { debounceTime } from 'rxjs';
import { FormSearchFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';

@Component({
  selector: 'one-portal-file-system',
  templateUrl: './file-system-snapshot.component.html',
  styleUrls: ['./file-system-snapshot.component.less'],
})
export class FileSystemSnapshotComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number;
  projectType: number;
  pageSize: number = 10;
  pageIndex: number = 1;

  value: string;

  response: BaseResponse<any>;

  isLoading: boolean = false;

  isBegin: boolean = false;

  filteredData: any[];

  formSearchFileSystemSnapshot: FormSearchFileSystemSnapshot = new FormSearchFileSystemSnapshot()

  constructor(private fileSystemSnapshotService: FileSystemSnapshotService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notificationService: NotificationService) {
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.refreshParams();
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    this.projectType = project.type;
    this.getData();
  }

  onPageSizeChange(event) {
    this.pageSize = event
    this.refreshParams();
    this.getData();
  }

  onPageIndexChange(event) {
    this.pageIndex = event;
    this.getData();
  }

  onInputChange(value: string): void {
    if (!value) { 
      this.filteredData = this.response.records; 
    } else {
      this.filteredData = this.response.records.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase().trim())
      ); 
    } 
  }


  getData() {
    this.isLoading = true
    this.formSearchFileSystemSnapshot.vpcId = this.project
    this.formSearchFileSystemSnapshot.regionId = this.region
    this.formSearchFileSystemSnapshot.isCheckState = true
    this.formSearchFileSystemSnapshot.pageSize = this.pageSize
    this.formSearchFileSystemSnapshot.currentPage = this.pageIndex
    this.formSearchFileSystemSnapshot.customerId = this.customerId
    this.fileSystemSnapshotService.getFileSystemSnapshot(this.formSearchFileSystemSnapshot)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
      this.response = data
      this.filteredData = data.records
    })
  }

  handleOkDeleteFileSystemSnapShot() {
    this.getData()
  }

  handleOkEditFileSystemSnapShot(){
    this.getData()
  }

  
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.customerId = this.tokenService.get()?.userId  
    if (this.notificationService.connection == undefined) {
      this.notificationService.initiateSignalrConnection();
    }
    this.notificationService.connection.on('UpdateStateShareSnapshot', (data) => {
      this.getData();
    });
  }
}
