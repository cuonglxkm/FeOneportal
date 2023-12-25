import {Component, Inject, OnInit} from "@angular/core";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {SnapshotVolumeService} from "../../../shared/services/snapshot-volume.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VolumeService} from "../../../shared/services/volume.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {CreateScheduleSnapshotDTO} from "../../../shared/models/snapshotvl.model";

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

  volumeId: number;

  volumeList: NzSelectOptionInterface[];
  userId: number;
  scheduleStartTime:string;
  dateStart: any;
  descSchedule: string;
  ngOnInit(): void {
  }
  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private snapshotService: SnapshotVolumeService,
              private volumeService: VolumeService,
              private notification: NzNotificationService) {
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
