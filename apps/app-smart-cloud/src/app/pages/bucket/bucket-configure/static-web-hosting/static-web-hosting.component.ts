import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
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
  @Input() bucketDetail: any;
  bucketWebsitecreate: BucketWebsite = new BucketWebsite();
  isLoading: boolean = false;
  region = JSON.parse(localStorage.getItem('regionId'));
  constructor(
    private bucketService: BucketService,
    private cdr: ChangeDetectorRef,
    private clipboardService: ClipboardService,
    private message: NzMessageService,
    private notification: NzNotificationService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
  }

  copyText(endPoint: string) {
    this.clipboardService.copyFromContent(endPoint);
    this.message.success('Copied to clipboard');
  }

  update() {
    this.isLoading = true
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
        .createBucketWebsite(this.bucketWebsitecreate, this.region)
        .subscribe({
          next: (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.static.web.hosting.create.success')
            );
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.static.web.hosting.create.fail')
            );
            this.cdr.detectChanges()
          },
        });
    } else {
      this.bucketService
        .deleteBucketWebsite({ bucketName: this.bucketName }, this.region)
        .subscribe({
          next: (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.static.web.hosting.create.success')
            );
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.static.web.hosting.create.fail')
            );
            this.cdr.detectChanges()
          },
        });
    }
  }

  cancel() {
    this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
  }
}
