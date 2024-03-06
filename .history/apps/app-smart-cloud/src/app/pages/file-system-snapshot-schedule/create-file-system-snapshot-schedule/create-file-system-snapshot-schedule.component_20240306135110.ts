import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { FormSearchNetwork, NetWorkModel } from '../../../shared/models/vlan.model';


@Component({
  selector: 'one-portal-create-file-system-snapshot',
  templateUrl: './create-file-system-snapshot-schedule.component.html',
  styleUrls: ['./create-file-system-snapshot-schedule.component.less'],
})
export class CreateFileSystemSnapshotScheduleComponent implements OnInit{
  // region: number;
  // project: number;

  // isLoading: boolean;
  // showWarningName: boolean;
  // contentShowWarningName: string;
  // volumeId: number;
  // volumeList: NzSelectOptionInterface[] = [];
  // userId: number;
  // scheduleStartTime: string;
  // dateStart: string;
  // descSchedule: string = '';
  // snapshotMode: string = 'Theo tuần';
  // numberArchivedCopies = 1;

  // time: Date = new Date();
  // defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);

  // form: FormGroup<{
  //   name: FormControl<string>;
  //   volume: FormControl<number>;
  //   selectedDate: FormControl<string>;
  // }> = this.fb.group({
  //   name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
  //   volume: [0, [Validators.required]],
  //   selectedDate: ['', [Validators.required]],
  // });

  // dateList: NzSelectOptionInterface[] = [
  //   { label: 'Chủ nhật', value: '0' },
  //   { label: 'Thứ hai', value: '1' },
  //   { label: 'Thứ ba', value: '2' },
  //   { label: 'Thứ tư', value: '3' },
  //   { label: 'Thứ năm', value: '4' },
  //   { label: 'Thứ sáu', value: '5' },
  //   { label: 'Thứ bảy', value: '6' },
  // ];

  ngOnInit(): void {
    // const now = new Date();
    // this.scheduleStartTime =
    //   now.getHours().toString() +
    //   ':' +
    //   now.getUTCMinutes().toString() +
    //   ':' +
    //   now.getSeconds().toString();
    // this.userId = this.tokenService.get()?.userId;
  }

  // doGetListVolume() {
  //   this.isLoading = true;
  //   this.volumeList = [];
  //   this.volumeService
  //     .getVolumes(this.userId, this.project, this.region, 1000, 1, null, null)
  //     .subscribe({
  //       next: (next) => {
  //         next.records.forEach((volume) => {
  //           this.volumeList.push({ value: volume.id, label: volume.name });
  //         });
  //         this.isLoading = false;
  //         console.log('list volumes', this.volumeList);
  //       },
  //       error: (e) => {
  //         this.notification.error(
  //           'Có lỗi xảy ra',
  //           'Lấy danh sách Volume thất bại'
  //         );
  //         this.isLoading = false;
  //       },
  //     });
  // }

  constructor(
    private router: Router,
    // @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    // private fb: NonNullableFormBuilder,
    // private snapshotService: SnapshotVolumeService,
    // private volumeService: VolumeService,
    // private modalService: NzModalService,
    // private notification: NzNotificationService
  ) {}

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/list']);
  }
  // request = new CreateScheduleSnapshotDTO();
  // create() {
  //   const modal: NzModalRef = this.modalService.create({
  //     nzTitle: 'Xác nhận tạo lịch Snapshot',
  //     nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện tạo lịch Snapshot?</p>`,
  //     nzFooter: [
  //       {
  //         label: 'Hủy',
  //         type: 'default',
  //         onClick: () => modal.destroy(),
  //       },
  //       {
  //         label: 'Đồng ý',
  //         type: 'primary',
  //         onClick: () => {
  //           this.isLoading = true;
  //           this.request.dayOfWeek = this.dateStart;
  //           this.request.daysOfWeek = [];
  //           this.request.description = this.descSchedule;
  //           this.request.intervalWeek = 1; // fix cứng số tuần  = 1;
  //           this.request.mode = 3; //fix cứng chế độ = theo tuần ;
  //           this.request.dates = 0;
  //           this.request.duration = 0;
  //           this.request.volumeId = this.volumeId;
  //           this.request.runtime = this.time.toISOString();
  //           this.request.intervalMonth = 0;
  //           this.request.maxBaxup = 1; // fix cứng số bản
  //           this.request.snapshotPacketId = 0;
  //           this.request.customerId = this.userId;
  //           this.request.projectId = this.project;
  //           this.request.regionId = this.region;
  //           console.log(this.request);
  //           this.snapshotService.createSnapshotSchedule(this.request).subscribe(
  //             (data) => {
  //               if (data != null) {
  //                 console.log(data);
  //                 this.isLoading = false;
  //                 this.notification.success('Success', 'Tạo lịch thành công');
  //                 this.router.navigate([
  //                   '/app-smart-cloud/schedule/snapshot/list',
  //                 ]);
  //               } else {
  //                 this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
  //                 this.isLoading = false;
  //               }
  //             },
  //             (error) => {
  //               console.log(error);
  //               this.notification.error('Có lỗi xảy ra', 'Tạo lịch thất bại');
  //               this.isLoading = false;
  //             }
  //           );
  //           modal.destroy();
  //         },
  //       },
  //     ],
  //   });
  // }

  // checkSpecialSnapshotName(str: string): boolean {
  //   //check ký tự đặc biệt
  //   const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  //   return specialCharacters.test(str);
  // }

  // onRegionChange(region: RegionModel) {
  //   this.region = region.regionId;
  // }

  // onProjectChange(project: ProjectModel) {
  //   this.project = project?.id;
  //   this.doGetListVolume();
  // }
}
