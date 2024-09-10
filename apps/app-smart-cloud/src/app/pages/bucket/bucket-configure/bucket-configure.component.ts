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
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { BucketDetail } from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';

@Component({
  selector: 'one-portal-bucket-configure',
  templateUrl: './bucket-configure.component.html',
  styleUrls: ['../bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketConfigureComponent implements OnInit {
  bucketName: string;
  bucketDetail: BucketDetail = new BucketDetail();
  isLoading: boolean = false;
  isLoadingVersion: boolean = false;
  usage: any
  region = JSON.parse(localStorage.getItem('regionId'));
  constructor(
    private bucketService: BucketService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private objectSevice: ObjectStorageService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.bucketName = this.activatedRoute.snapshot.paramMap.get('bucketName');
    this.getBucketDetail();
    this.getUsageOfBucket()
  }

  getBucketDetail() {
    this.bucketService
      .getBucketDetail(this.bucketName, this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data === null || data === undefined) {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
            this.navigateToBucketList();
          } else {
            console.log(data);
            this.bucketDetail = data;
            this.cdr.detectChanges();
          }
        },
        error: (e) => {
          this.notification.error('', e.error.message);
          this.navigateToBucketList();
        },
      });
}

  setBucketACL() {
    this.isLoading = true;
    this.bucketService
      .setBucketACL(this.bucketName, this.bucketDetail.aclType, this.region)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.access.list.resize.success')
          );
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.isLoading = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.access.list.resize.fail')
          );
          this.cdr.detectChanges();
        },
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  getUsageOfBucket() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getUsageOfBucket(
        this.activatedRoute.snapshot.paramMap.get('bucketName'),
        this.region
      )
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          console.log(data);

          this.usage = data;
        },
        error: (e) => {
          // this.notification.error(
          //   this.i18n.fanyi('app.status.fail'),
          //   this.i18n.fanyi('app.bucket.getObject.fail')
          // );
        },
      });
  }

  setBucketVersioning() {
    this.isLoadingVersion = true;
    this.bucketService
      .setBucketVersioning(
        this.bucketName,
        this.bucketDetail.isVersioning,
        this.region
      )
      .subscribe({
        next: (data) => {
          this.isLoadingVersion = false;
          this.notification.success('', 'Điều chỉnh Versioning thành công');
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.isLoadingVersion = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.version.resize.fail')
          );
          this.cdr.detectChanges();
        },
      });
  }

  cancel() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  navigateToBucketList() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }
}
