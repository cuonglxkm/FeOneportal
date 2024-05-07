import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import {
  BucketDetail,
  BucketWebsite,
} from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-static-web-hosting',
  templateUrl: './static-web-hosting.component.html',
  styleUrls: ['./static-web-hosting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticWebHostingComponent implements OnInit {
  @Input() bucketName: string;
  bucketDetail: BucketDetail = new BucketDetail();
  bucketWebsitecreate: BucketWebsite = new BucketWebsite();

  constructor(
    private bucketService: BucketService,
    private cdr: ChangeDetectorRef,
    private clipboardService: ClipboardService,
    private message: NzMessageService,
    private notification: NzNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bucketService.getBucketDetail(this.bucketName).subscribe((data) => {
      this.bucketDetail = data;
      this.cdr.detectChanges();
    });
  }

  copyText(endPoint: string) {
    this.clipboardService.copyFromContent(endPoint);
    this.message.success('Copied to clipboard');
  }

  update() {
    if (this.bucketDetail.isWebsite) {
      this.bucketWebsitecreate.bucketName = this.bucketName;
      this.bucketWebsitecreate.indexDocumentSuffix =
        this.bucketDetail.indexDocumentSuffix;
      this.bucketWebsitecreate.errorDocument = this.bucketDetail.errorDocument;
      if (this.bucketDetail.checkRedirectAllRequests) {
        this.bucketWebsitecreate.redirectAllRequestsTo =
          this.bucketDetail.redirectAllRequestsTo;
      } else {
        this.bucketWebsitecreate.redirectAllRequestsTo = '';
      }

      this.bucketService
        .createBucketWebsite(this.bucketWebsitecreate)
        .subscribe({
          next: (data) => {
            this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
            this.notification.success(
              '',
              'Chỉnh sửa Static Web Hosting thành công'
            );
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Chỉnh sửa Static Web Hosting không thành công'
            );
          },
        });
    } else {
      this.bucketService
        .deleteBucketWebsite({ bucketName: this.bucketName })
        .subscribe({
          next: (data) => {
            this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
            this.notification.success(
              '',
              'Chỉnh sửa Static Web Hosting thành công'
            );
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Chỉnh sửa Static Web Hosting không thành công'
            );
          },
        });
    }
  }

  cancel() {
    this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
  }
}
