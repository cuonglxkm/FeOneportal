import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
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
  bucketdaitail: BucketDetail = new BucketDetail();

  constructor(
    private bucketService: BucketService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.bucketName = this.activatedRoute.snapshot.paramMap.get('bucketName');
    this.bucketService
      .getBucketDetail(this.bucketName)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe((data) => {
        this.bucketdaitail = data;
        this.cdr.detectChanges();
      });
  }

  setBucketACL() {
    this.bucketService
      .setBucketACL(this.bucketName, this.bucketdaitail.aclType)
      .subscribe({
        next: (data) => {
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
          this.notification.success(
            '',
            'Điều chỉnh Access Control List thành công'
          );
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Điều chỉnh Access Control List không thành công'
          );
        },
      });
  }

  setBucketVersioning() {
    this.bucketService
      .setBucketVersioning(this.bucketName, this.bucketdaitail.isVersioning)
      .subscribe({
        next: (data) => {
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
          this.notification.success('', 'Điều chỉnh Versioning thành công');
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Điều chỉnh Versioning không thành công'
          );
        },
      });
  }
}
