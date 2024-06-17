import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { AccessRuleService } from '../../../../shared/services/access-rule.service';
import { BaseResponse, NotificationService, ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { AccessRule } from '../../../../shared/models/access-rule.model';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { FileSystemDetail, FileSystemModel } from '../../../../shared/models/file-system.model';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'one-portal-list-access-rule',
  templateUrl: './list-access-rule.component.html',
  styleUrls: ['./list-access-rule.component.less'],
})
export class ListAccessRuleComponent implements OnInit, OnDestroy{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  accessType: any = 1

  idFileSystem: any

  pageSize: number = 10
  pageIndex: number = 1

  isCheckBegin: boolean = false

  response: BaseResponse<AccessRule[]>

  isLoading: boolean = false

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private accessRuleService: AccessRuleService,
              private fileSystemService: FileSystemService,
              private notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  changeInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressed = false;
    this.dataSubjectInputSearch.next(value);
  }

  onChangeInputChange() {
    this.searchSubscription = this.dataSubjectInputSearch.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressed) {
        this.value = res.trim();
        this.getListAccessRule(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListAccessRule(false);
  }


  onAccessTypeSelect(value) {
    this.accessType = value
    this.getListAccessRule(false)
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
    let level = '';
    if(this.accessType == 1) {
      level = null
    }
    if(this.accessType == 2) {
      level = 'ro'
    }
    if(this.accessType == 3) {
      level = 'rw'
    }
    this.accessRuleService.getListAccessRule(this.idFileSystem, this.project, this.region, this.pageSize, this.pageIndex, this.value, level)
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

  fileSystem: FileSystemDetail = new FileSystemDetail()

  getFileSystemById() {
    this.fileSystemService.getFileSystemById(this.id, this.region, this.project).subscribe(data => {
      this.fileSystem = data
    })
  }

  handleCreateOk() {
    this.getListAccessRule(false)
  }

  handleDeleteOk() {
   setTimeout(() => {this.getListAccessRule(true)}, 500)
  }

  id: number

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId

    this.idFileSystem = this.activatedRoute.snapshot.paramMap.get('idFileSystem')
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('fileSystem'))
    console.log('id', this.idFileSystem)
    this.getFileSystemById()
    this.getListAccessRule(true);

    this.notificationService.connection.on('UpdateStateAccessRule', (message) => {
      if (message) {
        switch (message.actionType) {
          case "APPLYING":
          case "ACTIVE":
          case "DENYING":
          case "DELETED":
            this.getListAccessRule(true);
          break;

        }
      }
    });
    this.onChangeInputChange()
  }
}
