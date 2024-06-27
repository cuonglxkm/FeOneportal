import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
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

@Component({
  selector: 'one-portal-bucket-list',
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketListComponent implements OnInit {
  objectStorage: ObjectStorage = new ObjectStorage();
  listBucket: BucketModel[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  total: number;
  value: string = '';
  loading: boolean = true;
  isLoadingDeleteOS: boolean = false;
  searchDelay = new Subject<boolean>();
  user: any
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private bucketService: BucketService,
    private objectSevice: ObjectStorageService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private clipboardService: ClipboardService,
    private message: NzMessageService,
    private loadingSrv: LoadingService
  ) {}
  hasOS: boolean = undefined;
  region = JSON.parse(localStorage.getItem('regionId'));
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
      this.hasObjectStorageInfo()
      this.hasObjectStorage();
      this.searchDelay
        .pipe(debounceTime(TimeCommon.timeOutSearch))
        .subscribe(() => {
          this.search();
        });
  }



  hasObjectStorageInfo() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getUserInfo(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data) {
            this.hasOS = true;
            this.search();
          } else {
            this.hasOS = false;
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.error.detail,
            this.i18n.fanyi('app.notification.object.storage.fail')
          );
        },
      });
  }
  hasObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getObjectStorage()
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          this.user = data;
          this.getUserById(this.user.id);
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.getObject.fail')
          );
        },
      });
  }

  private getUserById(id: number) {
    this.bucketService
      .getUserById(id)
      .subscribe({
        next: (data) => {
          this.objectStorage = data;
          console.log(this.objectStorage);
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.getObject.fail')
          );
        },
      });
  }
  


  search() {
    this.loading = true;
    this.bucketService
      .getListBucket(this.pageNumber, this.pageSize, this.value.trim(), this.region)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listBucket = data.records;
          this.total = data.totalCount;
        },
        error: (e) => {
          this.listBucket = [];
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.getBucket.fail')
          );
        },
      });
  }

  searchBucket(search: string) {
    this.value = search.trim();
    this.search();
  }

  copyText(endPoint: string) {
    this.clipboardService.copyFromContent(endPoint);
    this.message.success('Copied to clipboard');
  }

  createBucket() {
    this.router.navigate(['/app-smart-cloud/object-storage/bucket/create']);
  }

  configure(bucketName: string) {
    this.router.navigate([
      `/app-smart-cloud/object-storage/bucket/configure/${bucketName}`,
    ]);
  }

  extendObjectStorage() {
    this.router.navigate([
      `/app-smart-cloud/object-storage/extend/${this.objectStorage.id}`,
    ]);
  }

  resizeObjectStorage() {
    this.router.navigate([
      `/app-smart-cloud/object-storage/edit/${this.objectStorage.id}`,
    ]);
  }

  deleteObjectStorage() {
    this.isVisibleDeleteOS = true
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
  }

  handleOkDeleteBucket() {
    if (this.codeVerify == this.bucketDeleteName) {
      this.bucketService.deleteBucket(this.bucketDeleteName, this.region).subscribe({
        next: (data) => {
          if (data == 'Thao tác thành công') {
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.bucket.delete.bucket.success')
            );
            this.isVisibleDeleteBucket = false;
            this.search();
          } else {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.delete.bucket.fail')
            );
          }
        },
        error: (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.delete.bucket.fail')
          );
        },
      });
    } else {
      this.notification.error(
        this.i18n.fanyi('app.status.fail'),
        this.i18n.fanyi('app.bucket.delete.bucket.fail1')
      );
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
    this.bucketService
      .deleteOS(this.user.id)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.notification.success('', 'Xóa Object Storage thành công');
          this.isVisibleDeleteOS = false;
          this.isLoadingDeleteOS = false;
          this.hasObjectStorageInfo();
          this.cdr.detectChanges()
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Xóa Object Storage không thành công');
          this.isLoadingDeleteOS = false;
          this.cdr.detectChanges()
        },
      });
  }
}
