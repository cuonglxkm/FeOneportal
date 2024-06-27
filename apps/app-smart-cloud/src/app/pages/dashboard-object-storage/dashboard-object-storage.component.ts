import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { SubUser } from '../../shared/models/sub-user.model';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { ObjectStorageService } from '../../shared/services/object-storage.service';
import { Summary, UserInfoObjectStorage } from '../../shared/models/object-storage.model';
import { BucketService } from '../../shared/services/bucket.service';
import { BucketModel } from '../../shared/models/bucket.model';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

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

  summary: Summary[];

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
        },
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
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
    this.getSummaryObjectStorage();
  }



  getSummaryObjectStorage() {
    console.log('time', this.timeSelected)
    this.objectStorageService.getMonitorObjectStorage(this.bucketSelected, this.timeSelected, this.region).subscribe(data => {
      console.log('summary', data);
      this.summary = data;
    });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.hasObjectStorage();

    this.bucketService.getListBucket(1, 9999, '', this.region).subscribe(data => {
      this.bucketList = data.records;
      this.bucketSelected = this.bucketList[0].bucketName
      console.log(this.bucketSelected)
      console.log(this.bucketList)
      this.getSummaryObjectStorage()
    });
  }
}
