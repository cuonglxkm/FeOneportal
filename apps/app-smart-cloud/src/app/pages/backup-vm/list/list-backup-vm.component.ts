import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {BackupVm, BackupVMFormSearch} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import Pagination from "../../../shared/models/pagination";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {getCurrentRegionAndProject} from "@shared";
import { RegionModel, ProjectModel, NotificationService } from '../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectService } from 'src/app/shared/services/project.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-list-backup-vm',
  templateUrl: './list-backup-vm.component.html',
  styleUrls: ['./list-backup-vm.component.less'],
})
export class ListBackupVmComponent implements OnInit, OnDestroy {

  region = JSON.parse(localStorage.getItem('regionId'));

  project = JSON.parse(localStorage.getItem('projectId'));

  value?: string;

  isVisibleDelete: boolean = false

  isLoading: boolean = false;

  status = [
    {label: this.i18n.fanyi('app.status.all'), value: 'all'},
    {label: this.i18n.fanyi('app.status.running'), value: 'AVAILABLE'},
    {label: this.i18n.fanyi('app.status.suspend'), value: 'SUSPENDED'},
    {label: this.i18n.fanyi('app.status.error'), value: 'ERROR'}
  ]

  selectedValue?: string = null

  formSearch: BackupVMFormSearch = new BackupVMFormSearch()

  collection: Pagination<BackupVm> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10
  };

  pageSize: number = 10
  pageIndex: number = 1

  userId: number

  id: number

  selectedOptionAction: string
  selectedAction: BackupVm

  isBegin: boolean = false

  typeVPC: number

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  isCreateOrder: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private backupVmService: BackupVmService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private notification: NzNotificationService,
              private projectService: ProjectService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notificationService: NotificationService,
              private policyService: PolicyService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.formSearch.regionId = this.region
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.formSearch.projectId = this.project;
    this.typeVPC = project?.type;
    this.getListBackupVM(true);
    this.isCreateOrder = this.policyService.hasPermission("backup:InstanceBackupList") && 
      this.policyService.hasPermission("backup:ListBackupPacket") &&
      this.policyService.hasPermission("offer:Search") && 
      this.policyService.hasPermission("instance:List") && 
      this.policyService.hasPermission("backup:GetBackupPacket") &&
      this.policyService.hasPermission("offer:Get") && 
      this.policyService.hasPermission("instance:Get") && 
      this.policyService.hasPermission("securitygroup:GetSecurityGroupByInstance") && 
      this.policyService.hasPermission("instance:InstanceListVolume") && 
      this.policyService.hasPermission("order:Create");
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
        this.getListBackupVM(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListBackupVM(false);
  }

  showModalDelete(id: number): void {
    this.isVisibleDelete = true;
    this.id = id
  }

  handleCancelDelete(): void {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.getListBackupVM(true)
  }

  handleOkUpdate() {
    setTimeout(() => {this.getListBackupVM(false)}, 1500)
  }

  getListBackupVM(isBegin) {
    this.formSearch = this.getParam();
    this.isLoading = true;
    this.backupVmService.search(this.formSearch).subscribe(data => {
      this.isLoading = false
      this.collection = data
      if((this.collection.records == null || this.collection.records.length < 1) && this.pageIndex != 1) {
        this.pageIndex = 1
        this.getListBackupVM(false);
      }
      if (isBegin) {
        this.isBegin = this.collection?.records.length < 1 || this.collection?.records === null ? true : false;
      }
    }, error => {
      this.isLoading = true;
      this.collection = null;
      if(error.status == 403) {
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission', { serviceName: 'Danh sách Backup VM' })
        );
      } else {
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
      }
    })

  }

  onChange(value: string) {
    this.selectedValue = value;
    if (this.selectedValue === 'all') {
      this.formSearch.status = null
    } else {
      this.formSearch.status = value
    }
    this.formSearch.currentPage = 1
    console.log('form search', this.formSearch)
    this.getListBackupVM(false)
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListBackupVM(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListBackupVM(false)
  }

  isLoadingAction: boolean = false
  navigateToCreateBackup() {
    // this.dataService.setSelectedObjectId(id)
    this.isLoadingAction = true
    if(this.typeVPC == 1) {
      this.isLoadingAction = false
      this.router.navigate(['/app-smart-cloud/backup-vm/create/vpc']);
    }

    if(this.typeVPC != 1) {
      this.isLoadingAction = false
      this.router.navigate(['/app-smart-cloud/backup-vm/create/no-vpc']);
    }

  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId
    this.formSearch.currentPage = 1
    this.formSearch.pageSize = 10
    this.isLoading = true;

    this.selectedValue = this.status[0].value
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    this.onChangeInputChange()
    // setTimeout(() => {this.getListBackupVM(true)}, 1500)

    this.notificationService.connection.on('UpdateInstanceBackup', (message) => {
      if (message) {
        switch (message.actionType) {
          case "CREATING":
            this.getListBackupVM(true);
            break;
          case "CREATED":
            this.getListBackupVM(true);
            break;
          case "RESIZING":
          case "RESIZED":
          case "EXTENDING":
          case "EXTENDED":
          case "DELETING":
            this.getListBackupVM(true);
            break;
          case "DELETED":
            this.getListBackupVM(true);
            break;
          case "RESTORING":
          case "RESTORED":
            this.getListBackupVM(false);
            break;
          }
      }
    });
  }

  getParam(): BackupVMFormSearch {
    this.formSearch.regionId = this.region

    this.formSearch.customerId = this.tokenService.get()?.userId
    this.formSearch.projectId = this.project

    if (this.value === undefined) {
      this.formSearch.instanceBackupName = null
    } else {
      this.formSearch.instanceBackupName = this.value
    }

    return this.formSearch
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/backup-vm/detail-backup-vm/' + id])
  }

  navigateToRestore(id: number) {
    let hasRoleSI = localStorage.getItem('role').includes('SI')
    if (this.typeVPC == 1 || hasRoleSI) {
      this.router.navigate(['/app-smart-cloud/backup-vm/restore-backup-vm-vpc/' + id])
    } else {
      this.router.navigate(['/app-smart-cloud/backup-vm/restore-backup-vm/' + id])
    }
  }

  getSuspendedReason(suspendedReason: string) {
    switch (suspendedReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "":
      default:
        break;
    }
  }

  selectedActionChange(value: any, data: BackupVm) {
    this.selectedOptionAction = value
    this.selectedAction = data
    switch (parseInt(value, 10)) {
      case 1:
        this.navigateToRestore(data.id)
        break;
      case 2:
        this.showModalDelete(data.id)
        break;
      default:
        break;
    }
  }
}
