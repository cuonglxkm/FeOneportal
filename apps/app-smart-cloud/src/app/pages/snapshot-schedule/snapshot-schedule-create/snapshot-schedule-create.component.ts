import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { CreateScheduleSnapshotDTO } from '../../../shared/models/snapshotvl.model';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'one-portal-create-schedule-snapshot',
  templateUrl: './snapshot-schedule-create.component.html',
  styleUrls: ['./snapshot-schedule-create.component.less'],
})
export class SnapshotScheduleCreateComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean;
  showWarningName: boolean;
  contentShowWarningName: string;
  volumeId: number;
  volumeList: NzSelectOptionInterface[] = [];
  userId: number;
  scheduleStartTime: string;
  dateStart: string;
  descSchedule: string;
  snapshotMode: string = 'Theo tuần'
  numberArchivedCopies = 1;

  time: Date = new Date(0, 0, 0, 0, 0, 0);
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);

  form: FormGroup<{
    name: FormControl<string>;
    volume: FormControl<number>;
    selectedDate: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
    volume: [0, [Validators.required]],
    selectedDate: ['', [Validators.required]],
  });

  dateList: NzSelectOptionInterface[] = [
    { label: 'Chủ nhật', value: '0' },
    { label: 'Thứ hai', value: '1' },
    { label: 'Thứ ba', value: '2' },
    { label: 'Thứ tư', value: '3' },
    { label: 'Thứ năm', value: '4' },
    { label: 'Thứ sáu', value: '5' },
    { label: 'Thứ bảy', value: '6' },
  ];

  ngOnInit(): void {
    const now = new Date();
    this.scheduleStartTime =
      now.getHours().toString() +
      ':' +
      now.getUTCMinutes().toString() +
      ':' +
      now.getSeconds().toString();
    this.userId = this.tokenService.get()?.userId;
  }

  doGetListVolume() {
    this.isLoading = true;
    this.volumeList = [];
    this.volumeService.getVolumes(this.userId, this.project, this.region,
        1000,
        1,
        null,
        null
      )
      .subscribe(
        (data) => {
          data.records.forEach((volume) => {
            this.volumeList.push({ value: volume.id, label: volume.name });
          });
          this.isLoading = false;
        },
        (error) => {
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy danh sách Volume thất bại'
          );
          this.isLoading = false;
        }
      );
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private notification: NzNotificationService
  ) {}

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
  }
  request = new CreateScheduleSnapshotDTO();
  create() {
    this.isLoading = true;
    this.request.dayOfWeek = this.dateStart;
    this.request.daysOfWeek = null;
    this.request.description = this.descSchedule;
    this.request.intervalWeek = 1; // fix cứng số tuần  = 1;
    this.request.mode = 3; //fix cứng chế độ = theo tuần ;
    this.request.dates = null;
    this.request.duration = null;
    this.request.volumeId = this.volumeId;
    this.request.runtime = new Date().toISOString();
    this.request.intervalMonth = null;
    this.request.maxBaxup = 1; // fix cứng số bản
    this.request.snapshotPacketId = null;
    this.request.customerId = this.userId;
    this.request.projectId = this.project;
    this.request.regionId = this.region;
    console.log(this.request);
    this.snapshotService.createSnapshotSchedule(this.request).subscribe(
      (data) => {
        if (data != null) {
          console.log(data);
          this.isLoading = false;
          this.notification.success('Success', 'Tạo lịch thành công');
          this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
        } else {
          this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
          this.isLoading = false;
        }
      },
      (error) => {
        console.log(error);
        this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
        this.isLoading = false;
      }
    );
  }

  checkSpecialSnapshotName(str: string): boolean {
    //check ký tự đặc biệt
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharacters.test(str);
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.doGetListVolume();
  }
}
