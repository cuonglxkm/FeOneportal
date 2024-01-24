import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ScheduleSnapshotVL } from 'src/app/shared/models/snapshotvl.model';

@Component({
  selector: 'one-portal-list-schedule-snapshot',
  templateUrl: './snapshot-schedule-list.component.html',
  styleUrls: ['./snapshot-schedule-list.component.less'],
})
export class SnapshotScheduleListComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  searchStatus: string = '';
  searchName: string = '';

  status = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang khởi tạo', value: 'DANGKHOITAO' },
    { label: 'Hủy', value: 'HUY' },
    { label: 'Tạm ngừng', value: 'TAMNGUNG' },
  ];

  pageSize: number = 10;
  pageNumber: number = 1;
  listOfData: ScheduleSnapshotVL;
  totalData: number;
  isLoadingEntities: boolean;
  customerID: number;

  actionSelected: number;

  onQueryParamsChange(params: NzTableQueryParams) {
    const { pageSize, pageIndex } = params;
    this.pageSize = pageSize;
    this.pageNumber = pageIndex;
    this.searchSnapshotScheduleList();
  }
  searchSnapshotScheduleList() {
    this.doGetSnapSchedules(
      this.pageSize,
      this.pageNumber,
      this.region,
      this.project,
      this.searchName,
      '',
      this.searchStatus
    );
  }

  private doGetSnapSchedules(
    pageSize: number,
    pageNumber: number,
    regionId: number,
    projectId: number,
    name: string,
    volumeName: string,
    status: string
  ) {
    this.isLoadingEntities = true;
    this.snapshot
      .getListSchedule(
        pageSize,
        pageNumber,
        regionId,
        projectId,
        name,
        volumeName,
        status
      )
      .subscribe(
        (data) => {
          this.totalData = data.totalCount;
          this.listOfData = data.records;
          this.isLoadingEntities = false;
        },
        (error) => {
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy danh sách lịch Snapshot thất bại'
          );
          this.isLoadingEntities = false;
        }
      );
  }

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private snapshot: SnapshotVolumeService,
    private modalService: NzModalService,
    private snapshotVolumeService: SnapshotVolumeService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.customerID = this.tokenService.get()?.userId;
  }

  selectedActionChange(value: any, data: any) {}

  navigateToUpdate(id: number) {
    console.log(id);
  }
  showModalSuppend(id: number) {
    console.log(id);
  }

  showModalDelete(id: number) {
    console.log(id);
  }

  onChange(value: string) {
    console.log('abc', this.searchStatus);
    this.searchStatus = value;
    this.searchSnapshotScheduleList();
  }

  DeleteSnapshot(id: number) {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Xóa lịch Snapshot',
      nzContent: `<p>Vui lòng cân nhắc thật kỹ trước khi click nút <b>Đồng ý</b>. Quý khách chắc chắn muốn thực hiện xóa lịch Snapshot?</p>`,
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
            this.doDeleteSnapshotSchedule(id);
            modal.destroy();
          },
        },
      ],
    });
  }

  doDeleteSnapshotSchedule(id: number) {
    console.log('Delete:  ' + id);
  }
  doPauseSnapshotSchedule(id: number) {
    this.isLoadingEntities = true;
    this.snapshotVolumeService
      .actionSchedule(id, 'suspend', this.customerID, this.region, this.project)
      .subscribe((data) => {
        if (data) {
          this.notification.success('Success', 'Tạm dừng lịch thành công.');
          this.isLoadingEntities = false;
        } else {
          this.notification.error(
            'Có lỗi xảy ra',
            'Tạm dừng Entities thất bại.'
          );
          this.isLoadingEntities = false;
        }
      });
  }
  doResumeSnapshotSchedule(id: number) {
    this.isLoadingEntities = true;
    this.snapshotVolumeService
      .actionSchedule(id, 'restore', this.customerID, this.region, this.project)
      .subscribe((data) => {
        if (data) {
          this.notification.success('Success', 'Tiếp tục lịch thành công.');
          this.isLoadingEntities = false;
        } else {
          this.notification.error('Có lỗi xảy ra', 'Tiếp tục lịch thất bại.');
          this.isLoadingEntities = false;
        }
      });
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/detail/' + id]);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create']);
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.searchSnapshotScheduleList();
  }
}
