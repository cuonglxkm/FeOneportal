import { Component, Inject, OnInit } from '@angular/core';
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
import { DatePipe } from '@angular/common';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

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
  volumeList: NzSelectOptionInterface[] = [];
  userId: number;
  scheduleStartTime: string;
  dateStart: string;
  descSchedule: string = '';
  snapshotMode: string = 'Theo tuần';
  numberOfweek: string = '1 tuần'
  numberArchivedCopies = 1;
  selectedValueRadio = 'normal';
  snapshotPackageList: NzSelectOptionInterface[] = []
  time: Date = new Date();
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);


  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  validateForm: FormGroup<{
    radio: FormControl<any>
  }> = this.fb.group({
    radio: [''],
  })

  form: FormGroup<{
    name: FormControl<string>;
    volume: FormControl<number>;
    selectedDate: FormControl<string>;
    snapshotPackage: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
    volume: [null as number, [Validators.required]],
    selectedDate: ['', [Validators.required]],
    snapshotPackage: [null as number, [Validators.required]],
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
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.userId = this.tokenService.get()?.userId;
    this.doGetListSnapshotPackage()
  }

  getDayLabel(selectedValue: string): any {
    const selectedDay = this.dateList.find(
      (day) => day.value === selectedValue
    );
    return selectedDay ? selectedDay.label : '';
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
    this.formSearchPackageSnapshot.status = ''
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
    this.form.controls.volume.clearValidators();
    this.form.controls.volume.markAsPristine();
    this.form.controls.volume.reset();

    this.form.controls.snapshotPackage.clearValidators();
    this.form.controls.snapshotPackage.markAsPristine();
    this.form.controls.snapshotPackage.reset();

    if(this.selectedValueRadio === 'package'){
      this.form.controls.snapshotPackage.setValidators([
        Validators.required,
      ]);
      this.form.controls.snapshotPackage.markAsDirty();
      this.form.controls.snapshotPackage.reset();
    }
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private packageSnapshotService: PackageSnapshotService,
    private datepipe: DatePipe
  ) {}


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
            this.request.dayOfWeek = this.dateStart;
            this.request.daysOfWeek = [];
            this.request.description = this.descSchedule;
            this.request.intervalWeek = 1; // fix cứng số tuần  = 1;
            this.request.mode = 3; //fix cứng chế độ = theo tuần ;
            this.request.dates = 0;
            this.request.duration = 0;
            this.request.volumeId = this.form.controls.volume.value === null ? 0 : this.form.controls.volume.value;
            this.request.runtime = this.datepipe.transform(
              this.time,
              'yyyy-MM-ddTHH:mm:ss',
              'vi-VI'
            );
            this.request.intervalMonth = 0;
            this.request.maxBaxup = 1; // fix cứng số bản
            this.request.snapshotPacketId = this.form.controls.snapshotPackage.value === null ? 0 : this.form.controls.snapshotPackage.value;
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
