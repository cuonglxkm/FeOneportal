import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { finalize } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { InstancesService } from '../../instances/instances.service';
import { checkPossiblePressNumber } from '../../../shared/utils/common';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-create-schedule-snapshot',
  templateUrl: './snapshot-schedule-create.component.html',
  styleUrls: ['./snapshot-schedule-create.component.less'],
})
export class SnapshotScheduleCreateComponent implements OnInit {
  region: number;
  project: number;
  @Input() snapshotTypeCreate: any = 2; // VM:1 Volume:0 none:2
  isLoading: boolean;
  volumeId: number;
  volumeList: NzSelectOptionInterface[] = [];
  userId: number;
  dateStart: string;
  descSchedule: string = '';
  snapshotMode: string = 'Theo tuần';
  mode: string = 'Hằng ngày'
  numberArchivedCopies = 1;
  selectedValueRadio = 'normal';
  snapshotPackageList: NzSelectOptionInterface[] = []
  time: Date = new Date();
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);

  //new
  snapShotArray = [
    { label: 'Snapshot Volume', value: 0 },
    { label: 'Snapshot máy ảo', value: 1 }
  ];

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  validateForm: FormGroup<{
    radio: FormControl<any>
  }> = this.fb.group({
    radio: [''],
  })

  form: FormGroup<{
    name: FormControl<string>;
    volume: FormControl<number>;
    snapshotPackage: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
    volume: [null as number, []],
    snapshotPackage: [null as number, []],
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
    this.doGetListSnapshotPackage();
    this.loadSnapshotPackage();
    this.loadVolumeList();
    this.loadVmList();
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

  constructor(
    private router: Router,
    private loadingSrv: LoadingService,
    private activatedRoute: ActivatedRoute,
    private instancesService: InstancesService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
    private snapshotService: SnapshotVolumeService,
    private volumeService: VolumeService,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private packageSnapshotService: PackageSnapshotService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private datepipe: DatePipe
  ) {}


  request = new CreateScheduleSnapshotDTO();
  projectType: number;
  snapshotPackageLoading: boolean ;
  selectedSnapshotPackage: any;
  snapshotPackageArray: any;
  selectedSnapshotType = 0; // 0 vlome 1 vm
  volumeLoading: boolean | string;
  selectedVolume: any;
  vmLoading: boolean | string;
  selectedVM: any;
  volumeArray: any;
  vmArray: any;
  numOfVersion = 1;
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
            // this.request.dayOfWeek = this.dateStart;
            // this.request.daysOfWeek = [];
            this.request.description = this.descSchedule;
            // this.request.intervalWeek = 1; // fix cứng số tuần  = 1;
            this.request.mode = 1; //fix cứng chế độ = theo tuần ;
            // this.request.dates = 0;
            // this.request.duration = 0;
            // this.request.volumeId = ((this.selectedSnapshotType==0 && this.snapshotTypeCreate==2) || this.snapshotTypeCreate==0) ?  : '';
            this.request.runtime = this.datepipe.transform(
              this.time,
              'yyyy-MM-ddTHH:mm:ss',
              'vi-VI'
            );
            // this.request.intervalMonth = 0;
            // this.request.maxBaxup = 1; // fix cứng số bản
            this.request.snapshotPacketId = this.projectType == 1 ? '' :this.selectedSnapshotPackage.id;
            this.request.serviceInstanceId = ((this.selectedSnapshotType==1 && this.snapshotTypeCreate==2) || this.snapshotTypeCreate==1) ? this.selectedVM.id : this.selectedVolume.id;
            this.request.maxSnapshot = this.numOfVersion
            this.request.snapshotType = ((this.selectedSnapshotType==1 && this.snapshotTypeCreate==2) || this.snapshotTypeCreate==1) ? 1 : 0;
            this.request.customerId = this.userId;
            this.request.projectId = this.project;
            this.request.regionId = this.region;
            this.snapshotService.createSnapshotSchedule(this.request).subscribe(
              data => {
                  console.log(data);
                  this.isLoading = false;
                  this.notification.success('Success', 'Tạo lịch thành công');
                  this.router.navigate([
                    '/app-smart-cloud/schedule/snapshot/list',
                  ]);
              },
              error => {
                this.notification.error(this.i18n.fanyi("app.status.fail"), 'Tạo lịch thất bại',error.error.message);
                this.isLoading = false;
              }
            );
            modal.destroy();
          },
        },
      ],
    });
  }
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.doGetListVolume();
    this.projectType = project?.type;
  }

  onUserChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list'])
  }

  private loadSnapshotPackage() {
    this.formSearchPackageSnapshot.projectId = this.project;
    this.formSearchPackageSnapshot.regionId = this.region;
    this.formSearchPackageSnapshot.packageName = '';
    this.formSearchPackageSnapshot.pageSize = 9999999;
    this.formSearchPackageSnapshot.currentPage = 1;
    this.formSearchPackageSnapshot.status = '';
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      .pipe(finalize(() => {
        this.snapshotPackageLoading = false;
      }))
      .subscribe(
        data => {
          this.snapshotPackageArray = data.records;
        }
      );
  }

  changePackageSnapshot() {

  }

  changeTypeSnaphot() {
    this.selectedVolume = undefined;
    this.selectedVM = undefined;
  }

  changeVmVolume() {

  }

  private loadVolumeList() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region, 9999, 1, 'KHOITAO', '')
      .pipe(finalize(() => {
        this.volumeLoading = false;
      }))
      .subscribe(
        data => {
          this.volumeArray = data?.records.filter(item => {
            return ['AVAILABLE', 'IN-USE'].includes(item?.serviceStatus);
          });
          // if (this.activatedRoute.snapshot.paramMap.get('volumeId') != undefined) {
          //   // this.selectedSnapshotType = 0;
          //   console.log('volume array', this.volumeArray);
          //   this.selectedVolume = this.volumeArray?.filter(e => e.id == this.idVolume)[0];
          //   console.log('selected volume', this.selectedVolume);
          // } else {
          //   this.selectedVolume = null;
          //   // this.selectedSnapshotType = 1;
          // }
          // this.volumeArray = data.records;
        }
      );
  }

  private loadVmList() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.instancesService.search(1, 9999, this.region, this.project, '', '', true, this.tokenService.get()?.userId)
      .pipe(finalize(() => {
        this.loadingSrv.close();
        this.vmLoading = false;
      }))
      .subscribe(
        data => {
          const rs1 = data.records.filter(item => {
            return item.taskState === 'ACTIVE';
          });
          this.vmArray = rs1;
          // if (this.activatedRoute.snapshot.paramMap.get('instanceId') != undefined || this.activatedRoute.snapshot.paramMap.get('instanceId') != null) {
          //   // this.selectedSnapshotType = 1;
          //   this.selectedVM = this.vmArray.filter(e => e.id == Number.parseInt(this.activatedRoute.snapshot.paramMap.get('instanceId')))[0];
          // } else {
          //   this.selectedVM = null;
          //   // this.selectedSnapshotType = 0;
          // }
        }
      );
  }

  // checkPossiblePress($event: KeyboardEvent) {
  //
  // }
  protected readonly checkPossiblePress = checkPossiblePressNumber;
}
