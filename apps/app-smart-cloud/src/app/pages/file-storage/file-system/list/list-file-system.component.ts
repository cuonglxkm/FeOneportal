import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { Router } from '@angular/router';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { FileSystemModel, FormSearchFileSystem } from '../../../../shared/models/file-system.model';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-list-file-system',
  templateUrl: './list-file-system.component.html',
  styleUrls: ['./list-file-system.component.less']
})
export class ListFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<FileSystemModel[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  customerId: number;

  constructor(private router: Router,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  onInputChange(value) {
    this.value = value;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.getListFileSystem(true);
  }

  navigateToCreateFileSystem() {
    this.router.navigate(['/app-smart-cloud/networks/file-storage/file-system/create']);
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


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
    this.fileSystemService.model.subscribe(data => {
      console.log(data);
    });
  }
}
