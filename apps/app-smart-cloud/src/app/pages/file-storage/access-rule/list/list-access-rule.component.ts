import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { AccessRuleService } from '../../../../shared/services/access-rule.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { AccessRule } from '../../../../shared/models/access-rule.model';

@Component({
  selector: 'one-portal-list-access-rule',
  templateUrl: './list-access-rule.component.html',
  styleUrls: ['./list-access-rule.component.less'],
})
export class ListAccessRuleComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  accessType: any

  idFileSystem: any

  pageSize: number = 10
  pageIndex: number = 1

  isCheckBegin: boolean = false

  response: BaseResponse<AccessRule[]>

  isLoading: boolean = false
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private accessRuleService: AccessRuleService) {
  }

  onInputChange(value) {
    this.value = value
  }

  onAccessTypeSelect(value) {
    this.accessType = value
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListAccessRule(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListAccessRule(false);
  }

  getListAccessRule(isBegin) {
    this.isLoading = true
    console.log('id cloud', this.idFileSystem)
    this.accessRuleService.getListAccessRule(this.idFileSystem, this.project, this.region, this.pageSize, this.pageIndex)
      .subscribe(data=> {
      this.response = data
      this.isLoading = false
        if (isBegin) {
          this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
        }
    }, error => {
        this.isLoading = false
        this.response = null
      })
  }

  handleCreateOk() {
    this.getListAccessRule(false)
  }

  handleDeleteOk() {
    setTimeout(() => {this.getListAccessRule(true)}, 1500)
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId

    this.idFileSystem = this.activatedRoute.snapshot.paramMap.get('idFileSystem')
    console.log('id', this.idFileSystem)
    this.getListAccessRule(true)
  }
}
