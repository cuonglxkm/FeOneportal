import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-detail-schedule-snapshot',
  templateUrl: './snapshotp-schedule-detail.component.html',
  styleUrls: ['./snapshotp-schedule-detail.component.less'],
})
export class SnapshotScheduleDetailComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean;
  scheduleName: string;
  showWarningName: boolean;
  contentShowWarningName: string;

  customerID: number;
  volumeId: number;
  volumeName: string;

  userId: number;
  timeString: any;
  scheduleStartTime: string;
  dateStart: any;
  descSchedule: string;

  dateList = new Map();
  data: any;
  typeSnapshot: any;
  typeProject: number;
  labelMode = 'Hằng ngày';
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  url = window.location.pathname;
  ngOnInit(): void {
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    const id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.customerID = this.tokenService.get()?.userId;
    this.dateList.set('0', 'Chủ nhật');
    this.dateList.set('1', 'Thứ hai');
    this.dateList.set('2', 'Thứ ba');
    this.dateList.set('3', 'Thứ tư');
    this.dateList.set('4', 'Thứ năm');
    this.dateList.set('5', 'Thứ sáu');
    this.dateList.set('6', 'Thứ bảy');

    this.doGetDetailSnapshotSchedule(id, this.customerID);
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private notification: NzNotificationService
  ) {}

  doGetDetailSnapshotSchedule(id: number, userId: number) {
    this.isLoading = true;
    this.snapshotService
      .getDetailSnapshotSchedule(id)
      .subscribe((data) => {
        if (data != null) {
          this.isLoading = false;
          this.data = data;
          this.scheduleName = data.name;
          this.volumeId = data.serviceId;
          this.volumeName = data.volumeName;
          this.timeString = Date.parse(data.runtime);
          if (data.snapshotType == 1) {
            this.typeSnapshot = 'VM (Máy ảo)';
          } else {
            this.typeSnapshot = 'Volume';
          }
          let myRuntime: Date = new Date(data.runtime);
          this.scheduleStartTime =
            myRuntime.getHours().toString().padStart(2, '0') +
            ':' +
            myRuntime.getMinutes().toString().padStart(2, '0') +
            ':' +
            myRuntime.getSeconds().toString().padStart(2, '0');
          this.dateStart = this.dateList.get(data.daysOfWeek);
          this.descSchedule = data.description;
          console.log(data);
        } else {
          this.isLoading = false;
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy thông tin Snapshot Schedule thất bại'
          );
        }
      },error =>{      
        if(error.status===404){
          this.router.navigate(['/app-smart-cloud/schedule/snapshot']);
          this.notification.error('Thất bại',error.error.title );
        }
        
      });
  }
  navigateToSnapshotSchedule() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule-advance/snapshot']);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot']);
    }
  }
  goBack() {
    this.navigateToSnapshotSchedule()
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.typeProject = project?.type;
  }

  onUserProjectChange($event: any) {
    this.navigateToSnapshotSchedule()
  }
}
