import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import {
  ScheduleSnapshotVL,
  UpdateScheduleSnapshot,
} from 'src/app/shared/models/snapshotvl.model';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-snapshot-schedule-extend',
  templateUrl: './snapshot-schedule-edit.component.html',
  styleUrls: ['./snapshot-schedule-edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotScheduleEditComponent implements OnInit {
  region: number;
  project: number;
  scheduleSnapshot: ScheduleSnapshotVL = new ScheduleSnapshotVL();
  updateScheduleSnapshot: UpdateScheduleSnapshot = new UpdateScheduleSnapshot();
  snapshotMode: string = 'Theo tuần';
  numberOfweek: string = '1 tuần'
  numberArchivedCopies = 1;

  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);

  isLoading: boolean;
  customerId: number;
  volumeList: NzSelectOptionInterface[];
  userId: number;

  dateList = [
    { label: 'Chủ nhật', value: '0' },
    { label: 'Thứ hai', value: '1' },
    { label: 'Thứ ba', value: '2' },
    { label: 'Thứ tư', value: '3' },
    { label: 'Thứ năm', value: '4' },
    { label: 'Thứ sáu', value: '5' },
    { label: 'Thứ bảy', value: '6' },
  ];

  form: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
  });
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  ngOnInit(): void {
    const id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.customerId = this.tokenService.get()?.userId;
    this.doGetDetailSnapshotSchedule(id, this.customerId);
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private notification: NzNotificationService,
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef
  ) {}

  doGetDetailSnapshotSchedule(id: number, userId: number) {
    this.isLoading = true;
    this.snapshotService
      .getDetailSnapshotSchedule(id)
      .subscribe((data) => {
        if (data != null) {
          this.isLoading = false;
          this.scheduleSnapshot = data;
        } else {
          this.isLoading = false;
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy thông tin Snapshot Schedule thất bại'
          );
        }
      });
  }

  doGetListVolume() {
    this.isLoading = true;
    this.volumeList = [];
    this.volumeService
      .getVolumes(this.userId, this.project, this.region, 9999, 1, null, null)
      .subscribe({
        next: (next) => {
          next.records.forEach((volume) => {
            this.volumeList.push({ value: volume.id, label: volume.name });
          });
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('list volumes', this.volumeList);
        },
        error: (e) => {
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy danh sách Volume thất bại'
          );
          this.isLoading = false;
        },
      });
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot']);
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
    this.doGetListVolume();
  }

  update() {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Xác nhận điều chỉnh lịch Snapshot',
      nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện điều chỉnh lịch Snapshot?</p>`,
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => modal.destroy(),
        },
        {
          label: 'Đồng ý',
          type: 'primary',
          onClick: () => {
            this.updateScheduleSnapshot.id = this.scheduleSnapshot.id;
            this.updateScheduleSnapshot.dayOfWeek =
              this.scheduleSnapshot.daysOfWeek;
            this.updateScheduleSnapshot.daysOfWeek = [];
            this.updateScheduleSnapshot.description =
              this.scheduleSnapshot.description;
            this.updateScheduleSnapshot.intervalWeek = 0;
            this.updateScheduleSnapshot.mode = this.scheduleSnapshot.mode;
            this.updateScheduleSnapshot.dates = 0;
            this.updateScheduleSnapshot.duration = 0;
            this.updateScheduleSnapshot.name = this.scheduleSnapshot.name;
            this.updateScheduleSnapshot.runtime = this.scheduleSnapshot.runtime;
            this.updateScheduleSnapshot.intervalMonth = 0;
            this.updateScheduleSnapshot.customerId = this.customerId;
            this.updateScheduleSnapshot.projectId = this.project;
            this.updateScheduleSnapshot.regionId = this.region;
            this.snapshotService
              .editSnapshotSchedule(this.updateScheduleSnapshot)
              .subscribe({
                next: (next) => {
                  console.log(next);
                  this.notification.success(
                    '',
                    'Điều chỉnh lịch Snapshot thành công'
                  );
                  this.router.navigate([
                    '/app-smart-cloud/schedule/snapshot',
                  ]);
                },
                error: (e) => {
                  console.log(e);
                  this.notification.error(
                    '',
                    'Điều chỉnh lịch Snapshot không thành công'
                  );
                },
              });
            modal.destroy();
          },
        },
      ],
    });
  }
}
