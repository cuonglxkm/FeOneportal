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
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { getCurrentRegionAndProject } from '@shared';
import { FormSearchPackageSnapshot } from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';

@Component({
  selector: 'one-portal-create-schedule-snapshot',
  templateUrl: './snapshot-schedule-create.component.html',
  styleUrls: ['./snapshot-schedule-create.component.less'],
})
export class SnapshotScheduleCreateComponent implements OnInit {
  region: number;
  project: number;

  isLoading: boolean;
  showWarningName: boolean;
  contentShowWarningName: string;
  volumeId: number;
  snapshotPackageId: number;
  volumeList: NzSelectOptionInterface[] = [];
  snapshotPackageList: NzSelectOptionInterface[] = [];
  userId: number;
  dateStart: string;
  descSchedule: string = '';
  listOfSelectedDate: string[] = [];
  daysOfWeekSelected: string = '';
  numberArchivedCopies = 1;
  selectedValueRadio = 'normal';

  time: Date = new Date();
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  dateList: NzSelectOptionInterface[] = [
    { label: 'Chủ nhật', value: '0' },
    { label: 'Thứ hai', value: '1' },
    { label: 'Thứ ba', value: '2' },
    { label: 'Thứ tư', value: '3' },
    { label: 'Thứ năm', value: '4' },
    { label: 'Thứ sáu', value: '5' },
    { label: 'Thứ bảy', value: '6' },
  ];

  dateOptions: NzSelectOptionInterface[] = [
    { label: 'Hằng ngày', value: '1' },
    { label: 'Theo thứ', value: '2' },
    { label: 'Theo tuần', value: '3' },
    { label: 'Theo tháng', value: '4' },
  ];

  daysOfWeek = [
    { label: 'Thứ 2', value: '1' },
    { label: 'Thứ 3', value: '2' },
    { label: 'Thứ 4', value: '3' },
    { label: 'Thứ 5', value: '4' },
    { label: 'Thứ 6', value: '5' },
    { label: 'Thứ 7', value: '6' },
    { label: 'Chủ nhật', value: '7' },
  ];

  numberOfWeek = [
    { label: '1 Tuần', value: '1' },
    { label: '2 Tuần', value: '2' },
    { label: '3 Tuần', value: '3' },
  ];

  validateForm: FormGroup<{
    radio: FormControl<any>
  }> = this.fb.group({
    radio: [''],
  })

  form: FormGroup<{
    name: FormControl<string>;
    volume: FormControl<number>;
    selectedDate: FormControl<string>;
    snapshotPackageId: FormControl<number>;
    mode: FormControl<string>;
    daysOfWeek: FormControl<string[]>;
    intervalMonth: FormControl<number>;
    dates: FormControl<number>;
    intervalWeek: FormControl<number>;
    maxSnapshot: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
    volume: [0, [Validators.required]],
    selectedDate: ['', [Validators.required]],
    mode: [this.dateOptions[0].value as string, Validators.required],
    snapshotPackageId: [0 as number, [Validators.required]],
    daysOfWeek: [[] as string[], Validators.required],
    intervalMonth: [
      1 as number,
      [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)],
    ],
    dates: [1, [Validators.required]],
    intervalWeek: [null as number],
    maxSnapshot: [1, [Validators.required]]
  });

  
  snapshotMode = this.dateOptions[0].value;

  modeChange(value: string) {
    this.form.controls.selectedDate.clearValidators();
    this.form.controls.selectedDate.markAsPristine();
    this.form.controls.selectedDate.reset();

    this.form.controls.daysOfWeek.clearValidators();
    this.form.controls.daysOfWeek.markAsPristine();
    this.form.controls.daysOfWeek.reset();

    this.form.controls.intervalWeek.clearValidators();
    this.form.controls.intervalWeek.markAsPristine();
    this.form.controls.intervalWeek.reset();

    this.form.controls.intervalMonth.clearValidators();
    this.form.controls.intervalMonth.markAsPristine();
    this.form.controls.intervalMonth.reset();

    this.form.controls.dates.clearValidators();
    this.form.controls.dates.markAsPristine();
    this.form.controls.dates.reset();
    if (value === '1') {
      this.form.controls.mode.setValue('1');
    } else if (value === '2') {
      this.form.controls.mode.setValue('2');
      this.form.controls.daysOfWeek.setValidators([
        Validators.required,
      ]);
      this.form.controls.daysOfWeek.markAsDirty();
      this.form.controls.daysOfWeek.reset();
    } else if (value === '3') {
      this.form.controls.mode.setValue('3');

      this.form.controls.selectedDate.setValidators([
        Validators.required,
      ]);
      this.form.controls.selectedDate.markAsDirty();
      this.form.controls.selectedDate.reset();

      this.form.controls.intervalWeek.setValidators([
        Validators.required,
      ]);
      this.form.controls.intervalWeek.markAsDirty();
      this.form.controls.intervalWeek.reset();
    } else if (value === '4') {
      this.form.controls.mode.setValue('4');
      this.form.controls.intervalMonth.setValidators([
        Validators.required,
        Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/),
      ]);
      this.form.controls.intervalMonth.markAsDirty();
      this.form.controls.intervalMonth.reset();

      this.form.controls.dates.setValidators([
        Validators.required,
      ]);
      this.form.controls.dates.markAsDirty();
      this.form.controls.dates.reset();
    }
  }

  getDayLabelMulti(selectedValue: string): string {
    const selectedDay = this.daysOfWeek.find(
      (day) => day.value === selectedValue
    );
    return selectedDay ? selectedDay.label : '';
  }

  getDayLabel(selectedValue: string): string {
    const selectedDay = this.daysOfWeek.find(
      (day) => day.value === selectedValue
    );
    return selectedDay ? selectedDay.label : '';
  }

  ngOnInit(): void {
    const now = new Date();
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.userId = this.tokenService.get()?.userId;
    this.doGetListSnapshotPackage()
  }

  doGetListVolume() {
    this.isLoading = true;
    this.volumeList = [];
    this.volumeService
      .getVolumes(this.userId, this.project, this.region, 1000, 1, null, null)
      .subscribe({
        next: (next) => {
          next.records.forEach((volume) => {
            this.volumeList.push({ value: volume.id, label: volume.name });
          });
          this.isLoading = false;
          console.log('list volumes', this.volumeList);
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy danh sách Volume thất bại'
          );
          this.isLoading = false;
        },
      });
  }

  doGetListSnapshotPackage() {
    this.snapshotPackageList = []
    this.formSearchPackageSnapshot.projectId = this.project
    this.formSearchPackageSnapshot.regionId = this.region
    this.formSearchPackageSnapshot.packageName = ''
    this.formSearchPackageSnapshot.pageSize = 100
    this.formSearchPackageSnapshot.currentPage = 1
    this.formSearchPackageSnapshot.status = 'all'
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      .subscribe(data => {
        console.log(data);
        
        data.records.forEach(data => {
          this.snapshotPackageList.push({label: data.packageName, value: data.id});
        })
    }, error => {
      this.isLoading = false
      this.snapshotPackageList = null
    })
  }

  onChangeStatus(){
    console.log('Selected option changed:', this.selectedValueRadio)
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private packageSnapshotService: PackageSnapshotService
  ) {
    this.form.get('daysOfWeek').valueChanges.subscribe((selectedDays: string[]) => {
      this.listOfSelectedDate = selectedDays;
    });
  }

  request = new CreateScheduleSnapshotDTO();
  create() {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Xác nhận tạo lịch Snapshot',
      nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện tạo lịch Snapshot?</p>`,
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
            this.isLoading = true;
            this.request.dayOfWeek = this.form.controls.selectedDate.value;
            this.request.daysOfWeek = this.form.controls.daysOfWeek.value;
            this.request.description = this.descSchedule;
            this.request.intervalWeek = this.form.controls.intervalWeek.value; 
            this.request.mode = parseInt(this.form.controls.mode.value); 
            this.request.dates = this.form.controls.dates.value;
            this.request.duration = 0;
            this.request.volumeId = this.form.controls.volume.value;
            this.request.runtime = this.time.toISOString();
            this.request.intervalMonth = this.form.controls.intervalMonth.value;
            this.request.maxBaxup = this.form.controls.maxSnapshot.value;
            this.request.snapshotPacketId = 0;
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
                  this.router.navigate([
                    '/app-smart-cloud/schedule/snapshot/list',
                  ]);
                } else {
                  this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
                  this.isLoading = false;
                }
              },
              (e) => {
                this.notification.error(e.statusText, 'Tạo lịch thất bại');
                this.isLoading = false;
              }
            );
            modal.destroy();
          },
        },
      ],
    });
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
