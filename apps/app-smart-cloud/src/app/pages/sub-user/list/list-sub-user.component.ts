import { ChangeDetectorRef, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { SubUserService } from '../../../shared/services/sub-user.service';
import { SubUser, SubUserKeys } from '../../../shared/models/sub-user.model';
import {
  BaseResponse,
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { ClipboardService } from 'ngx-clipboard';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { LoadingService } from '@delon/abc/loading';
import { debounceTime, finalize, Subject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { TimeCommon } from 'src/app/shared/utils/common';

@Component({
  selector: 'one-portal-list-sub-user',
  templateUrl: './list-sub-user.component.html',
  styleUrls: ['./list-sub-user.component.less'],
})
export class ListSubUserComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string = '';

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<SubUser[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  listSubuser: any
  url = window.location.pathname;
  isExpand: number | null = null;

  searchDelay = new Subject<boolean>();
  constructor(
    private router: Router,
    private subUserService: SubUserService,
    private objectSevice: ObjectStorageService,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private clipboardService: ClipboardService,
    private renderer: Renderer2,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
    this.rowCount = this.response?.records.reduce(
      (count, data) => count + data.keys.length,
      0
    );
  }

  ngOnInit() {
    if (!this.url.includes('advance')) {
      if(Number(localStorage.getItem('regionId')) === 7) {
        this.region = 5
      }else{
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = 7;
    }
    this.hasObjectStorage();
    this.renderer.listen('document', 'click', this.handleCloseExpand.bind(this));
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {     
      this.getListSubUsers(false);
    });
  }

  hasOS: boolean = undefined;
  hasObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getUserInfo(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if (data) {
            this.hasOS = true;
            this.getListSubUsers(false);
          } else {
            this.hasOS = false;
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.getObject.fail')
          );
        },
      });
  }

  onInputChange(value) {
    this.value = value;
    this.getListSubUsers(false);
  }

  rowCount: number = 0;

  // Hàm tính số hàng
  calculateRowCount() {}

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.getListSubUsers(true);
  }

  onPageSizeChange(value) {
    this.pageSize = value;

    this.getListSubUsers(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;

    this.getListSubUsers(false);
  }

  navigateToCreateSubUser() {
    this.router.navigate(['/app-smart-cloud/object-storage/sub-user/create']);
  }

  getListSubUsers(isBegin) {
    this.isLoading = true;
    this.subUserService
      .getListSubUser(this.value.trim(), this.pageSize, this.pageIndex, this.region)
      .subscribe(
        (data) => {
          this.response = data;
          this.isLoading = false;

          const transformedData = data.records.map(record => {  
            const [firstKey, ...remainingKeys] = record.keys;
            return {
              ...record,
              ...firstKey,  
              keys: remainingKeys  
            };
          });
        
          this.listSubuser = transformedData
          

          if (isBegin) {
            this.isCheckBegin =
              this.response.records.length < 1 || this.response.records === null
                ? true
                : false;
          }
        },
        (error) => {
          this.isLoading = false;
          this.response = null;
        }
      );
  }

  handleOkEdit() {
    this.getListSubUsers(false);
  }

  handleOkDelete() {
    this.getListSubUsers(false);
  }

  copyText(data) {
    this.clipboardService.copyFromContent(data);
  }

  handleExpandAccessKey(index: number, event: MouseEvent){ 
    event.stopPropagation();
    this.isExpand = this.isExpand === index ? null : index;
  }

  handleCloseExpand(event: MouseEvent){
    this.isExpand = null;
  }

  search(search: string) {  
    this.value = search.trim();
    this.getListSubUsers(false);
  }

  ngOnDestroy() {
    this.renderer.listen('document', 'click', this.handleCloseExpand.bind(this));
  }
}
