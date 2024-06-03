import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { BucketDetail } from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-bucket-configure',
  templateUrl: './bucket-configure.component.html',
  styleUrls: ['../bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketConfigureComponent implements OnInit {
  bucketName: string;
  bucketDetail: BucketDetail = new BucketDetail();

  constructor(
    private bucketService: BucketService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.bucketName = this.activatedRoute.snapshot.paramMap.get('bucketName');
    this.bucketService
      .getBucketDetail(this.bucketName)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe((data) => {
        console.log(data);
        
        this.bucketDetail = data;
        this.cdr.detectChanges();
      });
  }

  setBucketACL() {
    this.bucketService
      .setBucketACL(this.bucketName, this.bucketDetail.aclType)
      .subscribe({
        next: (data) => {
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.access.list.resize.success')
          );
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.access.list.resize.fail')
          );
        },
      });
  }

  setBucketVersioning() {
    this.bucketService
      .setBucketVersioning(this.bucketName, this.bucketDetail.isVersioning)
      .subscribe({
        next: (data) => {
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
          this.notification.success('', 'Điều chỉnh Versioning thành công');
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.version.resize.fail')
          );
        },
      });
  }

  cancel() {
    this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
  }
}
