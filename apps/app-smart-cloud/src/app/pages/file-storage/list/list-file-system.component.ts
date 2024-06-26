import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BaseResponse,
  NotificationService,
  ProjectModel,
  RegionModel
} from '../../../../../../../libs/common-utils/src';
import { FileSystemModel, FormSearchFileSystem } from '../../../shared/models/file-system.model';
import { FileSystemService } from '../../../shared/services/file-system.service';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'one-portal-list-file-system',
  templateUrl: './list-file-system.component.html',
  styleUrls: ['./list-file-system.component.less']
})
export class ListFileSystemComponent implements OnInit, OnDestroy {
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

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;

  constructor(
    private router: Router,
    private fileSystemService: FileSystemService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
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
        this.getListFileSystem(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListFileSystem(false);
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    setTimeout(() => {
      this.getListFileSystem(true);
      this.getProject();
    }, 2000);
  }

  navigateToExtendFileSystem(id) {
    this.router.navigate(['/app-smart-cloud/file-storage/' + id + '/extend']);
  }

  navigateToCreateFileSystem(typeVpc) {
    this.isLoading = true
    this.fileSystemService.checkRouter(this.region, this.project).subscribe({
      next: (data) => {
        this.isLoading = false
        //in vpc
        if (typeVpc == 1) {
          this.router.navigate([
            '/app-smart-cloud/file-storage/file-system/create'
          ]);
        } else {
          //no vpc
            this.router.navigate([
              '/app-smart-cloud/file-storage/file-system/create/normal'])
        }
      },
      error: (error) => {
        this.isLoading = false
        if (error.error.detail.includes('Vui lòng kiểm tra Router')) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.checkRouter.file.system')
          );
        } else if (
          error.error.detail.includes('Kiểm tra lại Router Interface')
        ) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.checkRouter.file.system.noGateway')
          );
        } else {
          this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
        }
      }
    });
  }

  navigateToResizeFileSystem(typeVpc, id) {
    //in vpc
    if (typeVpc == 1) {
      this.router.navigate([
        '/app-smart-cloud/file-storage/file-system/resize/vpc/' + id
      ]);
    } else {
      //no vpc
      this.router.navigate([
        '/app-smart-cloud/file-storage/file-system/resize/normal/' + id
      ]);
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
    formSearch.isCheckState = true;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;

    this.fileSystemService
      .search(formSearch)

      .subscribe(
        (data) => {
          this.isLoading = false;
          console.log('data file system', data);
          this.response = data;

          if (isBegin) {
            this.isCheckBegin =
              this.response.records.length < 1 || this.response.records === null ? true : false;
          }
        },
        error => {
          this.isLoading = false;
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
        }
      );
  }

  handleOkEdit() {
    setTimeout(() => {
      this.getListFileSystem(false);
    }, 1500);
  }

  handleOkDelete() {
    this.getListFileSystem(true);
  }

  getProject() {
    this.projectService.getByProjectId(this.project).subscribe((data) => {
      this.projectInfo = data;
    });
  }

  navigateToAccessRule(cloudFileSystem: string, id: number) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/' + cloudFileSystem + '/access-rule/list', { fileSystem: id }]);
  }

  onRegionInitComplete() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;;
  }

  ngOnInit() {

    // this.getProject();
    
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
    this.fileSystemService.model.subscribe((data) => {
      console.log(data);
    });

    this.notificationService.connection.on('UpdateStateFileStorage', (message) => {
      debugger
      if (message) {
        switch (message.actionType) {
          case 'CREATING':
          case 'RESIZED':
          case 'CREATED':
          case 'UPDATE':
          case 'DELETED':
          case 'EXTENDING':
          case 'DELETING':
          case 'ERROR':
          case 'AVAILABLE':
            this.getListFileSystem(true);
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
          //this.getListVolume(true);
          //}
          //break;
        }
      }
    });
    // if (!this.region && !this.project) {
    //   this.router.navigate(['/exception/500']);
    // }
    //
    // if (this.notificationService.connection == undefined) {
    //   this.notificationService.initiateSignalrConnection();
    // }
    //
    // this.notificationService.connection.on('UpdateVolume', (data) => {
    //   if (data) {
    //     let volumeId = data.serviceId;
    //
    //     var foundIndex = this.response.records.findIndex(x => x.id == volumeId);
    //     if (foundIndex > -1) {
    //       var record = this.response.records[foundIndex];
    //
    //       record.status = data.status;
    //       record.taskState = data.serviceStatus;
    //
    //       this.response.records[foundIndex] = record;
    //       this.cdr.detectChanges();
    //     }
    //   }
    // });
    this.onChangeInputChange();
  }
}
