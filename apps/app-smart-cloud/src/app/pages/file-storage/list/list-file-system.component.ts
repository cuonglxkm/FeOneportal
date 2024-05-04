import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseResponse, ProjectModel, ProjectService, RegionModel, SizeInCloudProject } from '../../../../../../../libs/common-utils/src';
import { FileSystemModel, FormSearchFileSystem } from '../../../shared/models/file-system.model';
import { FileSystemService } from '../../../shared/services/file-system.service';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-list-file-system',
  templateUrl: './list-file-system.component.html',
  styleUrls: ['./list-file-system.component.less']
})
export class ListFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<FileSystemModel[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  customerId: number;

  typeVpc: number;

  projectInfo: SizeInCloudProject = new SizeInCloudProject();

  constructor(private router: Router,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private projectService: ProjectService) {
  }

  onInputChange(value) {
    this.value = value;
    this.getListFileSystem(false)
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type
    this.getListFileSystem(true);
    this.getProject();
  }

  navigateToExtendFileSystem(id) {
    this.router.navigate(['/app-smart-cloud/file-storage/'+id+'/extend'])
  }
  navigateToCreateFileSystem(typeVpc) {
    //in vpc
    if(typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/create']);
    }

    //no vpc
    if(typeVpc == 0) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/create/normal'])
    }

  }

  navigateToResizeFileSystem(typeVpc, id) {
    //in vpc
    if(typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/resize/' + id]);
    }

    //no vpc
    if(typeVpc == 0) {
      this.router.navigate(['/app-smart-cloud/file-storage/file-system/' + id + '/resize'])
    }
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListFileSystem(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListFileSystem(false);
  }

  getListFileSystem(isBegin) {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = this.value;
    formSearch.isCheckState = false;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;

    this.fileSystemService.search(formSearch)

      .subscribe(data => {
        this.isLoading = false;
        console.log('data file system', data);
        this.response = data;

        if (isBegin) {
          this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
        }
      }, error => {
        this.isLoading = false;
        this.response = null;
      });
  }

  handleOkEdit() {
    this.getListFileSystem(false)
  }

  handleOkDelete() {
    this.getListFileSystem(false)
  }

  getProject() {
    this.projectService.getByProjectId(this.project).subscribe(data => {
      this.projectInfo = data

      console.log('info', this.projectInfo)
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getProject()

    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
    this.fileSystemService.model.subscribe(data => {
      console.log(data);
    });

  }
}
