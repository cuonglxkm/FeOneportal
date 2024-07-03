import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ScheduleSnapshotVL } from 'src/app/shared/models/snapshotvl.model';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { debounceTime, finalize, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { size } from 'lodash';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { time } from 'echarts';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'one-portal-list-schedule-snapshot',
  templateUrl: './snapshot-schedule-list.component.html',
  styleUrls: ['./snapshot-schedule-list.component.less']
})
export class SnapshotScheduleListComponent implements OnInit {
  region: number;
  project: number;

  searchStatus: string = '';
  searchName: string = '';

  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
    description: ['', [Validators.maxLength(255)]]
  })

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px'
  };

  status = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang khởi tạo', value: 'DANGKHOITAO' },
    { label: 'Hủy', value: 'HUY' },
    { label: 'Tạm ngừng', value: 'TAMNGUNG' }
  ];

  pageSize: number = 10;
  pageNumber: number = 1;
  listOfData: ScheduleSnapshotVL[];
  totalData: number;
  isLoadingEntities: boolean = true;
  customerId: number;

  actionSelected: number;
  isBegin = false;
  searchDelay = new Subject<boolean>();
  response: any;
  isVisibleDelete = false;
  dataAction: any;
  nameDelete: any;
  disableDelete: boolean;
  loadingDelete = false;
  isVisibleRestart = false;
  loadingRestart: any;

  searchSnapshotScheduleList(checkBegin: any) {
    this.doGetSnapSchedules(this.pageSize, this.pageNumber, this.region, this.project, this.searchName, '', checkBegin);
  }

  private doGetSnapSchedules(pageSize: number, pageNumber: number, regionId: number, projectId: number, name: string, volumeName: string, checkBegin: boolean) {
    this.isLoadingEntities = true;
    this.listOfData = [];
    this.snapshot.getListSchedule(pageSize, pageNumber, regionId, projectId, name, volumeName, '')
      .subscribe({
        next: (next) => {
          this.response = next;
          this.totalData = next.totalCount;
          this.listOfData = next.records;
          this.isLoadingEntities = false;
          if (checkBegin) {
            if (this.response?.records == undefined || this.response?.records.length == 0) {
              this.isBegin = true;
            } else {
              this.isBegin = false;
            }
          }
        },
        error: (error) => {
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy danh sách lịch Snapshot thất bại'
          );
          this.isLoadingEntities = false;
        }
      });
  }

  constructor(
    private router: Router,
    private datepipe: DatePipe,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private snapshot: SnapshotVolumeService,
    private modalService: NzModalService,
    private snapshotVolumeService: SnapshotVolumeService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService
  ) {
  }

  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId;
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe((checkBegin: boolean) => {
      this.searchSnapshotScheduleList(checkBegin);
    });
  }

  navigateToUpdate(id: number) {
    console.log(id);
  }

  showModalSuppend(id: number) {
    console.log(id);
  }

  showModalDelete(id: number) {
    console.log(id);
  }

  enableDelete(data: any) {
    this.isVisibleDelete = true;
    this.dataAction = data;
  }

  DeleteSnapshot() {
    this.loadingDelete = true;
    this.snapshotVolumeService.deleteSnapshotSchedule(this.dataAction.id, this.customerId, this.region, this.project)
      .pipe(finalize(() => {
        this.loadingDelete = false;
        this.handleCancel();
      }))
      .subscribe((result: any) => {
        if (result == true) {
          this.notification.success('', 'Xóa lịch Snapshot thành công');
          this.doGetSnapSchedules(this.pageSize, this.pageNumber, this.region, this.project, this.searchName, '', true);
        } else {
          this.notification.error(
            '',
            'Xóa lịch Snapshot không thành công'
          );
        }
      });
  }

  // doPauseSnapshotSchedule(id: number) {
  //   const modal: NzModalRef = this.modalService.create({
  //     nzTitle: 'Tạm dừng lịch Snapshot',
  //     nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện tạm dừng lịch Snapshot?</p>`,
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
  //           this.snapshotVolumeService
  //             .actionSchedule(
  //               id,
  //               'suspend',
  //               this.customerId,
  //               this.region,
  //               this.project
  //             )
  //             .subscribe({
  //               next: (next) => {
  //                 this.notification.success(
  //                   'Success',
  //                   'Tạm dừng lịch Snapshot thành công.'
  //                 );
  //                 this.doGetSnapSchedules(
  //                   this.pageSize,
  //                   this.pageNumber,
  //                   this.region,
  //                   this.project,
  //                   this.searchName,
  //                   '',true
  //                 );
  //               },
  //               error: (e) => {
  //                 this.notification.error(
  //                   'Có lỗi xảy ra',
  //                   'Tạm dừng lịch Snapshot thất bại.'
  //                 );
  //               },
  //             });
  //           modal.destroy();
  //         },
  //       },
  //     ],
  //   });
  // }

  // doResumeSnapshotSchedule(id: number) {
  //   const modal: NzModalRef = this.modalService.create({
  //     nzTitle: 'Tiếp tục lịch Snapshot',
  //     nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện tiếp tục lịch Snapshot?</p>`,
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
  //           this.snapshotVolumeService
  //             .actionSchedule(
  //               id,
  //               'restore',
  //               this.customerId,
  //               this.region,
  //               this.project
  //             )
  //             .subscribe({
  //               next: (next) => {
  //                 this.notification.success(
  //                   'Success',
  //                   'Tiếp tục lịch Snapshot thành công.'
  //                 );
  //                 this.doGetSnapSchedules(
  //                   this.pageSize,
  //                   this.pageNumber,
  //                   this.region,
  //                   this.project,
  //                   this.searchName,
  //                   '',
  //                   true
  //                 );
  //               },
  //               error: (e) => {
  //                 this.notification.error(
  //                   'Có lỗi xảy ra',
  //                   'Tiếp tục lịch Snapshot thất bại.'
  //                 );
  //               },
  //             });
  //           modal.destroy();
  //         },
  //       },
  //     ],
  //   });
  // }

  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/detail/' + id]);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/edit/' + id]);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create', {
      snapshotTypeCreate: 2
    }]);
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.searchSnapshotScheduleList(true);
  }

  onPageSizeChange($event: number) {
    this.pageSize = $event;
    this.searchSnapshotScheduleList(false);
  }

  onPageIndexChange($event: number) {
    this.pageNumber = $event;
    this.searchSnapshotScheduleList(false);
  }

  enableEdit(data: any) {
    this.dataAction = data;
    this.isVisibleUpdate = true;
    this.validateForm.controls['name'].setValue(data.name)
    this.validateForm.controls['description'].setValue(data.description)
    this.time = data.nextRuntime;
  }

  enableRestart(data: any) {
    this.isVisibleRestart = true;
    this.dataAction = data;
  }

  handleCancel() {
    this.isVisibleDelete = false;
    this.isVisibleRestart = false;
    this.isVisibleUpdate = false;
  }

  confirmNameDelete($event: any) {
    if ($event == this.dataAction.name) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  openIpDeleteCf() {
    if (this.disableDelete == false) {
      this.DeleteSnapshot();
    }
  }

  restartSnapshot() {
    this.loadingRestart = true;
    this.snapshotVolumeService.actionSchedule(this.dataAction.id,
      'restore',
      this.customerId,
      this.region,
      this.project)
      .pipe(finalize(() => {
        this.loadingRestart = false;
        this.handleCancel();
      }))
      .subscribe(
        result => {
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Khôi phục lịch Snapshot thành công');
          this.doGetSnapSchedules(this.pageSize, this.pageNumber, this.region, this.project, this.searchName, '', true);
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), 'Khôi phục lịch Snapshot không thành công');
        });
  }

  isVisibleUpdate = false;
  isLoadingUpdate = false;

  handleUpdateOk() {
    this.isLoadingUpdate = true;
    let data = {
      id: this.dataAction.id,
      mode: 1,
      projectId: this.project,
      regionId: this.region,
      name: this.validateForm.controls['name'].value,
      description: this.validateForm.controls['description'].value,
      runtime: this.datepipe.transform(
        this.time,
        'yyyy-MM-ddTHH:mm:ss',
        'vi-VI'
      ),
    }
    this.snapshotVolumeService.editSnapshotSchedule(data)
      .pipe(finalize(() => {
        this.isLoadingUpdate = false;
        this.handleCancel();
      }))
      .subscribe(
      data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), 'Edit lịch Snapshot thành công');
        this.searchSnapshotScheduleList(true);
      },
      error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'Edit lịch Snapshot không thành công');
      }
    )
  }

   time : any;
}
