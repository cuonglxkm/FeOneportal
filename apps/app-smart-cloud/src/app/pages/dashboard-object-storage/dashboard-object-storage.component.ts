import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { SubUser } from '../../shared/models/sub-user.model';
import { Router } from '@angular/router';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { getCurrentRegionAndProject } from '@shared';
import { ObjectStorageService } from '../../shared/services/object-storage.service';
import { Summary, UserInfoObjectStorage } from '../../shared/models/object-storage.model';
import { BucketService } from '../../shared/services/bucket.service';
import { BucketModel } from '../../shared/models/bucket.model';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-dashboard-object-storage',
  templateUrl: './dashboard-object-storage.component.html',
  styleUrls: ['./dashboard-object-storage.component.less']
})
export class DashboardObjectStorageComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
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
    { value: 5, label: '5 phút' },
    { value: 15, label: '15 phút' },
    { value: 60, label: '1 giờ' },
    { value: 1440, label: '1 ngày' },
    { value: 10080, label: '1 tuần' },
    { value: 43200, label: '1 tháng' },
    { value: 129600, label: '3 tháng' }
  ];

  constructor(private router: Router,
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
      .getUserInfo()
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
            e.statusText,
            'Lấy Object Strorage không thành công'
          );
        },
      });
  } 

  onBucketChange(value) {
    this.bucketSelected = value;
    this.getSummaryObjectStorage();
  }

  onTimeChange(value) {
    this.timeSelected = value;
    this.getSummaryObjectStorage();
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  getSummaryObjectStorage() {
    console.log('time', this.timeSelected)
    this.objectStorageService.getMonitorObjectStorage(this.bucketSelected, this.timeSelected).subscribe(data => {
      console.log('summary', data);
      this.summary = data;
    });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.hasObjectStorage();

    this.bucketService.getListBucket(1, 9999, '').subscribe(data => {
      this.bucketList = data.records;
      this.bucketSelected = this.bucketList[0].bucketName
      console.log(this.bucketSelected)
      console.log(this.bucketList)
      this.getSummaryObjectStorage()
    });
  }
}
