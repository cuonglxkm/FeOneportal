import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { PackageBackupModel, ServiceInPackage } from '../../../shared/models/package-backup.model';
import {
  BaseResponse,
  NotificationService,
  ProjectModel,
  RegionModel
} from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-list-packages-backup',
  templateUrl: './list-packages-backup.component.html',
  styleUrls: ['./list-packages-backup.component.less']
})
export class ListPackagesBackupComponent implements OnInit, OnDestroy {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 10;
  pageIndex: number = 1;

  isLoading: boolean = false;

  value: string = '';

  customerId: number;

  packageBackupModel: PackageBackupModel = new PackageBackupModel();
  response: BaseResponse<PackageBackupModel[]>;

  isVisibleDelete: boolean = false;
  isLoadingDelete: boolean = false;

  isVisibleUpdate: boolean = false;
  isLoadingUpdate: boolean = false;

  selectedValue: string;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    namePackage: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  });

  valueDelete: string;

  typeVPC: number;

  isCheckBegin: boolean = false;

  options = [
    { label: this.i18n.fanyi('app.status.all'), value: '' },
    { label: this.i18n.fanyi('app.status.running'), value: 'AVAILABLE' },
    { label: this.i18n.fanyi('app.status.error'), value: 'ERROR' },
    { label: this.i18n.fanyi('app.status.suspend'), value: 'SUSPENDED' }
  ];

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;

  projectName: string;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService,
              private notificationService: NotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project?.type
    this.projectName = project?.projectName
    this.getListPackageBackups(true);
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value);
    this.getListPackageBackups(false);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/backup/packages/create']);
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListPackageBackups(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListPackageBackups(false);
  }

  onChange(value) {
    console.log('selected', value);
    this.selectedValue = value;
    this.getListPackageBackups(false);
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
        this.getListPackageBackups(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListPackageBackups(false);
  }

  getListPackageBackups(isBegin) {
    this.isLoading = true;

    this.packageBackupService.search(this.value, this.selectedValue, this.project, this.region, this.pageSize, this.pageIndex).subscribe(data => {
      this.isLoading = false;
      this.response = data;
      if((this.response.records == null || this.response.records.length < 1) && this.pageIndex != 1) {
        this.pageIndex = 1
        this.getListPackageBackups(false);
      }
      if (isBegin) {
        this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    }, error => {
      this.isLoading = false;
      this.response = null;
    });
  }


  navigateToResize(id) {
    this.router.navigate(['/app-smart-cloud/backup/packages/resize/' + id]);
  }

  navigateToExtend(id) {
    this.router.navigate(['/app-smart-cloud/backup/packages/extend/' + id])
  }

  handleDeletedOk() {
    setTimeout(() => {this.getListPackageBackups(true);}, 2000)

  }

  handleUpdateOk() {
    setTimeout(() => {this.getListPackageBackups(false);}, 2000)
  }

  getSuspendedReason(suspendedReason: string) {
    switch (suspendedReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "VIPHAMDIEUKHOAN":
        return this.i18n.fanyi('service.status.violation')
      default:
        break;
    }
  }

  ngOnInit() {
    this.customerId = this.tokenService.get()?.userId;
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.selectedValue = this.options[0].value;
    this.onChangeInputChange();
    if (!this.region && !this.project) {
      this.router.navigate(['/exception/500']);
    }

    this.notificationService.connection.on('UpdateStateBackupPackage', (message) => {
      if (message) {
        switch (message.actionType) {
          case 'CREATED':
            this.getListPackageBackups(true);
            break;
          //case "CREATED":
          // let volumeId = message.serviceId;
          // var foundIndex = this.response.records.findIndex(x => x.id == volumeId);
          // if (foundIndex > -1) {
          //   var record = this.response.records[foundIndex];
          //   record.serviceStatus = message.data?.serviceStatus;
          //   record.createDate = message.data?.creationDate;
          //   record.expirationDate = message.data?.expirationDate;
          //   this.response.records[foundIndex] = record;
          //   this.cdr.detectChanges();
          // }
          // else
          // {
          // this.getListVolume(true);
          //}
          //break;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
