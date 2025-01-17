import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { IpFloatingService } from '../../shared/services/ip-floating.service';
import { FormSearchIpFloating, IpFloating } from '../../shared/models/ip-floating.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { debounceTime } from 'rxjs';
import { FileSystemSnapshotScheduleModel, FormSearchFileSystemSsSchedule } from 'src/app/shared/models/filesystem-snapshot-schedule';
import { FileSystemSnapshotScheduleService } from 'src/app/shared/services/file-system-snapshot-schedule.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-file-system',
  templateUrl: './file-system-snapshot-schedule.component.html',
  styleUrls: ['./file-system-snapshot-schedule.component.less'],
})
export class FileSystemSnapshotScheduleComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number

  pageSize: number = 5
  pageIndex: number = 1

  value: string

  response: BaseResponse<FileSystemSnapshotScheduleModel[]>

  isLoading: boolean = false

  isBegin: boolean = false
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private fileSystemSnapshotScheduleService: FileSystemSnapshotScheduleService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
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
    // this.projectType = project.type;
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

  onInputChange(value){
    if(value == undefined || value == ""){
      this.value = null
    }
    
    this.value = value
    this.getData()
  }

  handleDeleteSchedule(){
    this.getData()
  }
  


  getData() {
    this.isLoading = true
    let formSearchFileSystemSsSchedule: FormSearchFileSystemSsSchedule = new FormSearchFileSystemSsSchedule()
    formSearchFileSystemSsSchedule.searchValue = this.value
    formSearchFileSystemSsSchedule.regionId = this.region
    formSearchFileSystemSsSchedule.pageSize = this.pageSize
    formSearchFileSystemSsSchedule.pageNumber = this.pageIndex
    formSearchFileSystemSsSchedule.projectId = this.project
    this.fileSystemSnapshotScheduleService.getFileSystemSsSchedule(formSearchFileSystemSsSchedule)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
        console.log('data', data)
      this.response = data
    })
  }

  handleOkCreateFileSystemSnapShot() {
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
  }
}
