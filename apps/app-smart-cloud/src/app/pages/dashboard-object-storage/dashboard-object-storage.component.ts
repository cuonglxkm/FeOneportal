import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { BaseResponse, RegionModel } from '../../../../../../libs/common-utils/src';
import { SubUser } from '../../shared/models/sub-user.model';
import { Router } from '@angular/router';
import { ObjectStorageService } from '../../shared/services/object-storage.service';
import { Summary } from '../../shared/models/object-storage.model';
import { BucketService } from '../../shared/services/bucket.service';
import { BucketModel } from '../../shared/models/bucket.model';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-dashboard-object-storage',
  templateUrl: './dashboard-object-storage.component.html',
  styleUrls: ['./dashboard-object-storage.component.less']
})
export class DashboardObjectStorageComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<SubUser[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  bucketList: BucketModel[];

  bucketSelected: any;
  timeSelected: any = 5;
  url = window.location.pathname;
  summary: Summary[];

  newDate: Date = new Date();

  times = [
    { value: 5, label: '5 ' + this.i18n.fanyi('app.minute') },
    { value: 15, label: '15 ' + this.i18n.fanyi('app.minute') },
    { value: 60, label: '1 ' + this.i18n.fanyi('app.hour') },
    { value: 1440, label: '1 ' + this.i18n.fanyi('app.day') },
    { value: 10080, label: '1 ' + this.i18n.fanyi('app.week') },
    { value: 43200, label: '1 ' + this.i18n.fanyi('app.month') },
    { value: 129600, label: '3 ' + this.i18n.fanyi('app.months') }
  ];

  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private router: Router,
              private objectStorageService: ObjectStorageService,
              private cdr: ChangeDetectorRef,
              private loadingSrv: LoadingService,
              private notification: NzNotificationService,
              private bucketService: BucketService) {
  }

  hasOS: boolean = undefined;

  hasObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectStorageService
      .getUserInfo(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data) {
            this.hasOS = true;
          } else {
            this.hasOS = false;
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.getObject.fail')
          );
        }
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/dashboard']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/dashboard']);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onBucketChange(value) {
    this.bucketSelected = value;
    this.getSummaryObjectStorage();
  }

  onTimeChange(value) {
    this.timeSelected = value;
    this.newDate = new Date();
    this.getSummaryObjectStorage();
  }


  getSummaryObjectStorage() {
    console.log('time', this.timeSelected);
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectStorageService.getMonitorObjectStorage(this.bucketSelected, this.timeSelected, this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe(data => {
        this.summary = data;
      });
  }

  ngOnInit() {
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    ;
    this.hasObjectStorage();
    this.bucketService.getListBucket(1, 9999, '', this.region).subscribe(data => {
      this.bucketList = data.records;
      this.bucketSelected = this.bucketList[0].bucketName;
      console.log(this.bucketSelected);
      console.log(this.bucketList);
      this.getSummaryObjectStorage();
    });
  }

  navigateToDashboard() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/dashboard']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/dashboard']);
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
