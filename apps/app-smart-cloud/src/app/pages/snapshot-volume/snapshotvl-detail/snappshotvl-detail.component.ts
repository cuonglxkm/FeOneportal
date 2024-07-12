import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { EditSnapshotVolume } from '../../../shared/models/snapshotvl.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'app-snapshot-volume-detail',
  templateUrl: './snappshotvl-detail.component.html',
  styleUrls: ['./snappshotvl-detail.component.less'],
})
export class SnappshotvlDetailComponent implements OnInit {
  headerInfo: any;

  isEdit: boolean;
  snapshotId: number;
  snapshotName: string;
  snapshotSize: number;
  snapshotDesc: string;
  snapshotVolumeName: string;
  snapshotVlCreateDate: string;
  isLoading: boolean;
  isShowWarningSnapshotVlName: boolean;
  contentWarningSnapshotVlName: string;

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.max(50),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ],
    }),
  });
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    private router: Router,
    private snapshotVlService: SnapshotVolumeService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    const idSnapshotVl = this.activatedRoute.snapshot.paramMap.get('id');
    this.snapshotId = Number.parseInt(idSnapshotVl);

    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.isEdit = queryParams['edit'];
      if (this.isEdit) {
        this.form.controls['name'].enable();
        this.headerInfo = {
          breadcrumb: 'Chỉnh sửa',
          content: 'Chỉnh sửa Snapshot Volume',
        };
        this.getSnapshotVolume(idSnapshotVl);
      } else {
        this.form.controls['name'].disable();
        this.headerInfo = {
          breadcrumb: 'Chi tiết',
          content: 'Xem chi tiết Snapshot Volume',
        };

        this.getSnapshotVolume(idSnapshotVl);
      }
    });
  }

  private getSnapshotVolume(idSnapshotVl: string) {
    this.isLoading = true;
    this.snapshotVlService.getSnapshotVolumeById(idSnapshotVl).subscribe({
      next: (data) => {
        this.snapshotName = data.name;
        this.snapshotSize = data.sizeInGB;
        this.snapshotDesc = data.description;
        this.snapshotVolumeName = data.volumeName;
        this.snapshotVlCreateDate = data.startDate;
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Lấy chi tiết Snapshot Volume không thành công'
        );
      },
    });
  }

  getProjectId(projectId: number) {
    this.backToListPage();
  }

  getRegionId(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.backToListPage();
  }

  backToListPage() {
    this.router.navigate(['/app-smart-cloud/snapshotvls']);
  }

  isVisibleUpdate: boolean = false;
  modalUpdate() {
    this.isVisibleUpdate = true;
  }
  handleOkUpdate() {
    this.isVisibleUpdate = false;
    let editRequest = new EditSnapshotVolume();
    editRequest.name = this.snapshotName;
    editRequest.id = this.snapshotId;
    editRequest.description = this.snapshotDesc;
    this.snapshotVlService.editSnapshotVolume(editRequest).subscribe({
      next: (data) => {
        this.notification.success('', 'Cập nhật Snapshot Volume thành công');
        this.backToListPage();
      },
      error: (error) => {
        this.notification.error(
          error.statusText,
          'Cập nhật Snapshot Volume không thành công'
        );
        this.backToListPage();
      },
    });
  }
  handleCancelUpdate() {
    this.isVisibleUpdate = false;
  }
}
