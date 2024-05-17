import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { formDeleteS3Key, s3KeyCreate, s3KeyGenerate } from 'src/app/shared/models/s3key.model';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { ObjectObjectStorageService } from '../../../shared/services/object-object-storage.service';
import { SubUserService } from '../../../shared/services/sub-user.service';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-s3-key',
  templateUrl: './s3-key.component.html',
  styleUrls: ['./s3-key.component.less'],
})
export class S3KeyComponent implements OnInit {
  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
  listOfS3Key: any;
  isVisibleDelete = false;
  isVisibleReCreate = false;
  key: any;
  isVisibleCreate = false;
  userCreate: s3KeyCreate = new s3KeyCreate();
  response: BaseResponse<any>
  loadingDropdown: any;
  disableDropdown: any;
  listUser: any;
  isLoadingCreateS3key: boolean = false;
  isLoadingReCreateS3key: boolean = false;
  isLoadingDelete: boolean = false;
  formGenerateS3Key: s3KeyGenerate = new s3KeyGenerate();
  formDeleteS3Key: formDeleteS3Key = new formDeleteS3Key();
  searchBox: string = ''
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: ObjectObjectStorageService,
    private objectSevice: ObjectStorageService,
    private cdr: ChangeDetectorRef,
    private clipboard: Clipboard,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private subUserService: SubUserService
  ) {}

  ngOnInit(): void {
    this.hasObjectStorage();
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
            this.getData();
          } else {
            this.hasOS = false;
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.error.detail,
            this.i18n.fanyi('app.notification.object.storage.fail')
          );
        },
      });
  }

  search() {
    this.getData()
  }

  createS3Key() {
    this.isVisibleCreate = true;
    this.loadingDropdown = true;
    this.disableDropdown = true;
    this.subUserService
      .getListSubUser(null, 99999, 1)
      .pipe(
        finalize(() => {
          this.loadingDropdown = false;
          this.disableDropdown = false;
        })
      )
      .subscribe((data) => {
        this.listUser = [{ id: '', subUserId: 'owner' }, ...data.records];
      });
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.getData();
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getData();
  }

  getData() {
    this.service.getDataS3Key(this.key, this.size, this.index).subscribe((data) => {
      this.total = data.totalCount;
      this.response = data
      this.listOfS3Key = data.records;
    });
  }

  copyText(secretKey: any) {
    this.clipboard.copy(secretKey);
  }

  deleteSecretKey() {
    this.isLoadingDelete = true
   this.formDeleteS3Key = {
      access_key: this.key,
      customerId: this.tokenService.get().userId,
      actorEmail: ''
    };
    this.service
      .deleteS3key(this.formDeleteS3Key)
      .pipe(
        finalize(() => {
          this.getData();
        })
      )
      .subscribe({
        next: (post) => {
          this.isLoadingDelete = false
          this.isVisibleDelete = false
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.delete.s3.key.success'));
          this.getData()
        },
        error: (e) => {
          this.isLoadingDelete = false
          this.isVisibleDelete = false
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.delete.s3.key.fail'));
        },
      });
    this.getData();
    this.isVisibleDelete = false;
  }

  openModelDelete(key: any) {
    this.isVisibleDelete = true;
    this.key = key;
  }

  createSecretKey() {
    this.isLoadingCreateS3key = true;
    let subuser =
      this.userCreate.subUserId === 'owner' ? '' : this.userCreate.subUserId;
    if (subuser === undefined) {
      this.isLoadingCreateS3key = false;
      this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('app.notification.enter.user.subUser'));
    } else {
      this.service.createS3Key(subuser).subscribe({
        next: (data) => {
          this.isLoadingCreateS3key = false;
          this.isVisibleCreate = false;
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.create.s3.key.success'));
          this.userCreate.subUserId = '';
          this.getData();
        },
        error: (error) => {
          this.isLoadingCreateS3key = false;
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.create.s3.key.fail'));
        },
      });
    }
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  openModelRecreate(item) {
    this.isVisibleReCreate = true;
    this.formGenerateS3Key.subuser = item.subUser === null ? '' : item.subUser
    this.formGenerateS3Key.access_key = item.accessKey
  }

  handleCancelReCreate() {
    this.isVisibleReCreate = false;
  }

  generateS3Key() {
    this.isLoadingReCreateS3key = true;
    console.log(this.formGenerateS3Key);
    
    this.service.generateS3Key(this.formGenerateS3Key).subscribe({
      next: (data) => {
        this.isLoadingReCreateS3key = false;
        this.isVisibleReCreate = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.regenerate.secretKey.success'));
        this.getData();
      },
      error: (error) => {
        this.isLoadingReCreateS3key = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.regenerate.secretKey.fail'));
      },
    });
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }
}
