import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { IpFloatingService } from '../../shared/services/ip-floating.service';
import { FormSearchIpFloating, IpFloating } from '../../shared/models/ip-floating.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse, NotificationService, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { debounceTime, Subject } from 'rxjs';
import { FormSearchFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { TimeCommon } from 'src/app/shared/utils/common';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

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

  value: string = '';

  response: BaseResponse<any>;

  isLoading: boolean = false;

  isBegin: boolean = false;

  filteredData: any[];

  formSearchFileSystemSnapshot: FormSearchFileSystemSnapshot = new FormSearchFileSystemSnapshot()

  searchDelay = new Subject<boolean>();

  constructor(private fileSystemSnapshotService: FileSystemSnapshotService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notificationService: NotificationService) {
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
}

  onRegionChange(region: RegionModel) {
    console.log(region);
    
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
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

  search(search: string) {  
    this.value = search.toLowerCase().trim();
    this.getData()
  }
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;


  getData() {
    this.isLoading = true
    this.formSearchFileSystemSnapshot.vpcId = this.project
    this.formSearchFileSystemSnapshot.regionId = this.region
    this.formSearchFileSystemSnapshot.isCheckState = true
    this.formSearchFileSystemSnapshot.pageSize = this.pageSize
    this.formSearchFileSystemSnapshot.currentPage = this.pageIndex
    this.formSearchFileSystemSnapshot.name = this.value.toLowerCase().trim()
    this.formSearchFileSystemSnapshot.customerId = this.customerId
    console.log(this.formSearchFileSystemSnapshot);
    
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

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.customerId = this.tokenService.get()?.userId  
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {     
      this.getData();
    });

    this.notificationService.connection.on('UpdateStateShareSnapshot', (data) => {
      console.log(data);
      
      this.getData();
    });
  }
}
