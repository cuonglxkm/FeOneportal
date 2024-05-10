import { Component, Inject, OnInit } from '@angular/core';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { SnapshotVolumeDto } from '../../../shared/dto/snapshot-volume.dto';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-snapshot-volume-list',
  templateUrl: './snapshotvl-list.component.html',
  styleUrls: ['./snapshotvl-list.component.less'],
})
export class SnapshotVolumeListComponent implements OnInit {
  options: NzSelectOptionInterface[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang khởi tạo', value: 'DANGKHOITAO' },
    { label: 'Dịch vụ đã xóa', value: 'HUY' },
    { label: 'Tạm ngừng', value: 'TAMNGUNG' },
    { label: 'Đang hoạt động', value: 'KHOITAO' },
  ];

  isLoading: boolean;
  listSnapshot: SnapshotVolumeDto[];
  totalSnapshot: number;

  //parameter search
  userId: number;
  projectId: number;
  regionId: number;
  size: number;
  pageSize: number = 10;
  pageNumber: number = 1;
  snapshotStatusSearch: string = '';
  nameSearch: string = '';

  constructor(
    private snapshotVlService: SnapshotVolumeService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.userId = this.tokenService.get()?.userId;
  }

  getProjectId(project: ProjectModel) {
    this.projectId = project.id;
    this.getListSnapshotVl();
  }

  getRegionId(region: RegionModel) {
    this.regionId = region.regionId;
  }

  initVolume(snapshotVl: SnapshotVolumeDto) {
    this.router.navigate(['/app-smart-cloud/volume/create'], {
      queryParams: {
        createdFromSnapshot: 'true',
        idSnapshot: snapshotVl.id,
        sizeSnapshot: snapshotVl.sizeInGB,
        typeSnapshot: snapshotVl.iops > 0 ? 'ssd' : 'hdd',
      },
    });
  }

  navigateToEdit(id: any) {
    this.router.navigate(['/app-smart-cloud/snapshotvls/detail', id], {
      queryParams: { edit: 'true' },
    });
  }

  getListSnapshotVl() {
    this.isLoading = true;
    this.listSnapshot = [];
    this.snapshotVlService
      .getSnapshotVolumes(
        this.pageSize,
        this.pageNumber,
        this.regionId,
        this.projectId,
        this.nameSearch,
        this.nameSearch,
        this.snapshotStatusSearch
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.listSnapshot = data.records;
          this.totalSnapshot = data.totalCount;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy danh sách Snapshot Volume không thành công'
          );
        },
      });
  }
  getDetailSnapshotVl(idSnapshot: number) {
    console.log(idSnapshot);
    this.router.navigate(['/app-smart-cloud/snapshotvls/detail/' + idSnapshot]);
  }

  isVisibleDelete: boolean = false;
  idDeleteSnapshot: number;
  modalDelete(id: number) {
    this.isVisibleDelete = true;
    this.idDeleteSnapshot = id;
  }
  handleOkDelete() {
    this.isVisibleDelete = false;
    this.snapshotVlService
      .deleteSnapshotVolume(this.idDeleteSnapshot)
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Xóa Snapshot Volume thành công');
          this.getListSnapshotVl();
        },
        error: (error) => {
          this.notification.error('', 'Xóa Snapshot Volume không thành công');
        },
      });
  }
  handleCancelDelete() {
    this.isVisibleDelete = false;
  }
}
