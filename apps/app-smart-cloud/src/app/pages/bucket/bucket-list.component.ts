import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import { finalize } from 'rxjs';
import { BucketModel } from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-bucket-list',
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketListComponent implements OnInit {
  listBucket: BucketModel[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;
  total: number;
  searchValue: string = '';
  loading: boolean = true;

  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private clipboardService: ClipboardService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.search();
  }

  search() {
    this.loading = true;
    this.bucketService
      .getListBucket(this.pageNumber, this.pageSize, this.searchValue)
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
            e.statusText,
            'Lấy danh sách Bucket không thành công'
          );
        },
      });
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
    this.router.navigate(['/app-smart-cloud/object-storage/extend']);
  }

  updateObjectStorage() {}

  deleteObjectStorage() {}

  isVisibleDeleteBucket: boolean = false;
  bucketDeleteName: string;
  titleModalDeleteBucket: string;
  modalDeleteBucket(bucketName: string) {
    this.isVisibleDeleteBucket = true;
    this.bucketDeleteName = bucketName;
    this.titleModalDeleteBucket = 'Xóa Bucket ' + bucketName;
  }

  handleCancelDeleteBucket() {
    this.isVisibleDeleteBucket = false;
  }

  handleOkDeleteBucket() {
    this.isVisibleDeleteBucket = false;
    this.bucketService.deleteBucket(this.bucketDeleteName).subscribe({
      next: (data) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Xóa Bucket thành công');
          this.search();
        } else {
          this.notification.error('', 'Xóa Bucket không thành công');
        }
      },
      error: (error) => {
        this.notification.error(
          error.statusText,
          'Xóa Bucket không thành công'
        );
      },
    });
  }

  isVisibleDeleteOS: boolean = false;
  modalDeleteOS() {
    this.isVisibleDeleteOS = true;
  }

  handleCancelDeleteOS() {
    this.isVisibleDeleteOS = false;
  }

  handleOkDeleteOS() {
    this.isVisibleDeleteOS = false;
    this.notification.success('', 'Xóa Router thành công');

    // this.dataService
    //   .deleteRouter(this.cloudId, this.region, this.projectId)
    //   .subscribe({
    //     next: (data) => {
    //       console.log(data);
    //       this.notification.success('', 'Xóa Router thành công');
    //       this.reloadTable();
    //     },
    //     error: (error) => {
    //       console.log(error.error);
    //       this.notification.error('', 'Xóa Router không thành công');
    //     },
    //   });
  }
}
