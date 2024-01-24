import {Component, Inject, OnInit} from "@angular/core";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VolumeService} from "../../../shared/services/volume.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";

@Component({
  selector: 'one-portal-detail-schedule-snapshot',
  templateUrl: './snapshotp-schedule-detail.component.html',
  styleUrls: ['./snapshotp-schedule-detail.component.less'],
})
export class SnapshotScheduleDetailComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean;
  scheduleName: string;
  showWarningName: boolean;
  contentShowWarningName: string;

  customerID: number;

  volumeId: number;

  volumeList: NzSelectOptionInterface[];
  userId: number;
  scheduleStartTime:string;
  dateStart: any;
  descSchedule: string;

  dateList = new Map();

  ngOnInit(): void {
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
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private snapshotService: SnapshotVolumeService,
              private volumeService: VolumeService,
              private notification: NzNotificationService) {
  }

  doGetDetailSnapshotSchedule(id: number, userId: number){
    this.isLoading = true;
    this.snapshotService.getDetailSnapshotSchedule(id, userId).subscribe(
      data => {
        if(data != null){
          this.isLoading = false;
          this.scheduleName = data.name;
          this.volumeId = data.serviceId;
          this.scheduleStartTime = data.runtime;
          this.dateStart = this.dateList.get(data.daysOfWeek);
          this.descSchedule = data.description;
          console.log(data);
        }else{
          this.isLoading = false;
          this.notification.error('Có lỗi xảy ra','Lấy thông tin Snapshot Schedule thất bại');
        }
      }
    )
  }
  goBack(){
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
}
