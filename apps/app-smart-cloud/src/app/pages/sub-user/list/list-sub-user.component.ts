import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubUserService } from '../../../shared/services/sub-user.service';
import { SubUser, SubUserKeys } from '../../../shared/models/sub-user.model';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { ClipboardService } from 'ngx-clipboard';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { LoadingService } from '@delon/abc/loading';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-list-sub-user',
  templateUrl: './list-sub-user.component.html',
  styleUrls: ['./list-sub-user.component.less'],
})
export class ListSubUserComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  pageSize: number = 10
  pageIndex: number = 1

  response: BaseResponse<SubUser[]>

  isLoading: boolean = false

  isCheckBegin: boolean = false

  constructor(private router: Router,
              private subUserService: SubUserService,
              private objectSevice: ObjectStorageService,
              private cdr: ChangeDetectorRef,
              private loadingSrv: LoadingService,
              private notification: NzNotificationService,
              private clipboardService: ClipboardService) {
    this.rowCount = this.response?.records.reduce((count, data) => count + data.keys.length, 0);
  }

  hasOS: boolean = undefined;
  hasObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getUserInfo()
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data) {
            this.hasOS = true;
          } else {
            this.hasOS = false;
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy Object Strorage không thành công'
          );
        },
      });
  }

  onInputChange(value) {
    this.value = value
    this.getListSubUsers(false)
  }

  rowCount: number = 0;

  // Hàm tính số hàng
  calculateRowCount() {

  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.getListSubUsers(true)
  }


  onPageSizeChange(value) {
    this.pageSize = value

    this.getListSubUsers(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value

    this.getListSubUsers(false)
  }

  navigateToCreateSubUser() {
    this.router.navigate(['/app-smart-cloud/object-storage/sub-user/create'])
  }

  getListSubUsers(isBegin) {
    this.isLoading = true
    this.subUserService.getListSubUser(this.value, this.pageSize, this.pageIndex).subscribe(data => {
      this.response = data
      this.isLoading = false

      if (isBegin) {
        this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    }, error => {
      this.isLoading = false
      this.response = null
    })
  }

  handleOkEdit() {
    this.getListSubUsers(false)
  }

  handleOkDelete() {
    this.getListSubUsers(false)
  }

  copyText(data) {
    this.clipboardService.copyFromContent(data);
  }
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.hasObjectStorage();
  }
}
