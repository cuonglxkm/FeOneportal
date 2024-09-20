import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import { debounceTime, finalize, Subject } from 'rxjs';
import { BucketModel } from 'src/app/shared/models/bucket.model';
import { ObjectStorage } from 'src/app/shared/models/object-storage.model';
import { BucketService } from 'src/app/shared/services/bucket.service';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { TimeCommon } from 'src/app/shared/utils/common';
import {
  NotificationService,
  ProjectModel,
  RegionModel,
} from '../../../../../../libs/common-utils/src';
import { RegionSelectDropdownComponent } from 'src/app/shared/components/region-select-dropdown/region-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { size } from 'lodash';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-bucket-list',
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.less'],
})
export class BucketListComponent implements OnInit {
  currentRegion: RegionModel;
  @ViewChild('bucketInputName') bucketInputName!: ElementRef<HTMLInputElement>;
  objectStorage: ObjectStorage = new ObjectStorage();
  listBucket: BucketModel[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  total: number;
  value: string = '';
  isInput: boolean = false;
  loading: boolean = false;
  isLoadingDeleteOS: boolean = false;
  searchDelay = new Subject<boolean>();
  user: any;
  usage: any;
  userinfo: any = null;
  url = window.location.pathname;
  isLoadingDeleteBucket: boolean = false;
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private bucketService: BucketService,
    private objectSevice: ObjectStorageService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private clipboardService: ClipboardService,
    private message: NzMessageService,
    private loadingSrv: LoadingService,
    private notificationService: NotificationService,
    private fb: NonNullableFormBuilder,
    private policyService: PolicyService
  ) {}
  hasOS: boolean = undefined;
  region: number;
  isExtendOrder: boolean = false;
  isResizeOrder: boolean = false;
  isDeleteOS: boolean = false;
  isCreateBucket: boolean = false;

  ngOnInit(): void {
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    this.hasObjectStorageInfo();
    //connect hub
    this.notificationService.connection.on('UpdateOSBucket', (data) => {
      if (data) {
        let actionType = data.actionType;
        switch (actionType) {
          case 'DELETING':
            this.reloadTable();
          case 'DELETED':
            this.reloadTable();
        }
      }
    });

    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.refreshParams();
        this.search();
      });
  }

  checkPermissionExtend() {
    this.isExtendOrder =
      this.policyService.hasPermission('order:Create') &&
      this.policyService.hasPermission('objectstorages:ObjectStorageUser') &&
      this.policyService.hasPermission('order:GetOrderAmount');
  }

  checkPermissionResize() {
    this.isResizeOrder =
      this.policyService.hasPermission('order:Create') &&
      this.policyService.hasPermission('objectstorages:ObjectStorageUser') &&
      this.policyService.hasPermission('order:GetOrderAmount') &&
      this.policyService.hasPermission('configuration:Get');
  }

  checkPermissionDeleteOS() {
    this.isDeleteOS = this.policyService.hasPermission('objectstorages:Delete');
  }

  checkPermissionCreateBucket() {
    this.isCreateBucket = this.policyService.hasPermission(
      'objectstorages:CreateBucket'
    );
  }

  nameBucketValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.bucketDeleteName) {
      return { nameMismatch: true };
    }
    return null;
  }

  onPageSizeChange(event: any) {
    this.pageSize = event;
    this.search();
  }

  onPageIndexChange(event: any) {
    this.pageNumber = event;
    this.search();
  }

  hasObjectStorageInfo() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    console.log(this.objectStorage);
    this.objectSevice
      .getUserInfo(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data) {
            this.userinfo = data;
            this.hasObjectStorage();
            this.getUsageOfUser();
          } else {
            this.hasOS = false;
          }
        },
        error: (e) => {
          if (e.status == 403) {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.non.permission', { serviceName: 'Thông tin Object Storage' })
            );
            this.hasOS = true;
          }else{
            this.notification.error(
              e.error.detail,
              this.i18n.fanyi('app.notification.object.storage.fail')
            );
          }
        },
      });
  }
  hasObjectStorage() {
    
    this.objectSevice
      .getObjectStorage(this.region)

      .subscribe({
        next: (data) => {
          console.log(data);
          this.hasOS = true;
          this.user = data;
          this.getUserById(this.user.id);
        },
        error: (e) => {
          if (e.status == 403) {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.non.permission', { serviceName: 'Thông tin User' })
            );
          }else{
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.getObject.fail')
            );
          }
          this.hasOS = true;
        },
      });
  }

  getUsageOfUser() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getUsageOfUser(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          this.usage = data;
        },
        // error: (e) => {
        //   this.notification.error(
        //     this.i18n.fanyi('app.status.fail'),
        //     this.i18n.fanyi('app.bucket.getObject.fail')
        //   );
        // },
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    console.log(this.region);

    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  refreshParams() {
    this.pageNumber = 1;
    this.pageSize = 10;
  }

  projectChanged(project: ProjectModel) {
        this.search();
        this.checkPermissionExtend();
        this.checkPermissionCreateBucket();
        this.checkPermissionDeleteOS();
        this.checkPermissionResize();
  }

  getUserById(id: number) {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.bucketService
      .getUserById(id)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data.status !== 'LOI' && data.status !== 'HUY') {
            this.hasOS = true;
            this.objectStorage = data;
            console.log(this.objectStorage);
          } else {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('Không tìm thấy tài nguyên')
            );
          }
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.getObject.fail')
          );
          this.objectStorage = null
          console.log(this.objectStorage);
        },
      });
  }

  search() {
    this.loading = true;
    this.bucketService
      .getListBucket(
        this.pageNumber,
        this.pageSize,
        this.value.trim(),
        this.region
      )
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.listBucket = data.records;
          this.total = data.totalCount;
        },
        error: (e) => {
          this.loading = false;
          this.listBucket = [];
          if (e.status == 403) {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.non.permission', { serviceName: 'Danh sách Bucket' })
            );
          } else {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.getBucket.fail')
            );
          }
        },
      });
  }
  reloadTable() {
    this.search();
  }
  searchBucket(search: string) {
    this.value = search.trim();
    this.refreshParams();
    this.search();
  }

  copyText(endPoint: string) {
    this.clipboardService.copyFromContent(endPoint);
    this.message.success('Copied to clipboard');
  }

  createBucket() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([
        '/app-smart-cloud/object-storage-advance/bucket/create',
      ]);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket/create']);
    }
  }

  configure(bucketName: string) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([
        `/app-smart-cloud/object-storage-advance/bucket/configure/${bucketName}`,
      ]);
    } else {
      this.router.navigate([
        `/app-smart-cloud/object-storage/bucket/configure/${bucketName}`,
      ]);
    }
  }

  extendObjectStorage() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/object-storage-advance/extend`]);
    } else {
      this.router.navigate([`/app-smart-cloud/object-storage/extend`]);
    }
  }

  resizeObjectStorage() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/object-storage-advance/edit`]);
    } else {
      this.router.navigate([`/app-smart-cloud/object-storage/edit`]);
    }
  }

  handleGoToDetail(bucketName) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([
        `/app-smart-cloud/object-storage-advance/bucket/${bucketName}`,
      ]);
    } else {
      this.router.navigate([
        `/app-smart-cloud/object-storage/bucket/${bucketName}`,
      ]);
    }
  }

  deleteObjectStorage() {
    this.isVisibleDeleteOS = true;
  }

  isVisibleDeleteBucket: boolean = false;
  bucketDeleteName: string;
  titleModalDeleteBucket: string;
  codeVerify: string;
  modalDeleteBucket(bucketName: string) {
    this.isVisibleDeleteBucket = true;
    this.codeVerify = '';
    this.bucketDeleteName = bucketName;
    this.titleModalDeleteBucket =
      this.i18n.fanyi('app.bucket.delete.bucket') + ' ' + bucketName;
  }

  handleCancelDeleteBucket() {
    this.isVisibleDeleteBucket = false;
    this.codeVerify = '';
    this.isInput = false;
  }

  handleOkDeleteBucket() {
    this.isLoadingDeleteBucket = true;
    if (this.codeVerify == this.bucketDeleteName) {
      this.isInput = false;
      this.bucketService
        .deleteBucket(this.bucketDeleteName, this.region)
        .subscribe({
          next: (data) => {
            this.isLoadingDeleteBucket = false;
            this.isVisibleDeleteBucket = false;
            this.codeVerify = '';
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.bucket.delete.bucket.success')
            );
            this.search();
          },
          error: (error) => {
            this.isLoadingDeleteBucket = false;
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.delete.bucket.fail')
            );
          },
        });
    } else {
      this.isLoadingDeleteBucket = false;
      this.isInput = true;
    }
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOkDeleteBucket();
    }
  }

  isVisibleDeleteOS: boolean = false;
  modalDeleteOS() {
    this.isVisibleDeleteOS = true;
  }

  handleCancelDeleteOS() {
    this.isVisibleDeleteOS = false;
  }

  handleOkDeleteOS() {
    this.isLoadingDeleteOS = true;
    this.bucketService.deleteOS(this.user.id).subscribe({
      next: (data) => {
        console.log(data);
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Xóa Object Storage thành công'
        );
        this.isVisibleDeleteOS = false;
        this.isLoadingDeleteOS = false;
        this.hasObjectStorageInfo();
      },
      error: (error) => {
        console.log(error.error);
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          'Xóa Object Storage không thành công'
        );
        this.isLoadingDeleteOS = false;
      },
    });
  }

  protected readonly size = size;
}
