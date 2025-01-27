import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, finalize, Subject } from 'rxjs';
import {
  BucketPolicy,
  bucketPolicyDetail,
} from 'src/app/shared/models/bucket.model';
import { SubUser } from 'src/app/shared/models/sub-user.model';
import { BucketService } from 'src/app/shared/services/bucket.service';
import { TimeCommon } from 'src/app/shared/utils/common';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-bucket-policy',
  templateUrl: './bucket-policy.component.html',
  styleUrls: ['./bucket-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketPolicyComponent implements OnInit {
  @Input() bucketName: string;
  @Input() isCreateBucketPolicyPermission: boolean;
  value: string = '';
  listBucketPolicy: BucketPolicy[] = [];
  pageSize: number = 10;
  pageNumber: number = 1;
  total: number;
  loading: boolean = true;
  isLoadingCreate: boolean = false;
  isLoadingUpdate: boolean = false;
  isLoadingDelete: boolean = false;
  listPermission = [{ name: 'Allow' }, { name: 'Deny' }];
  isCreatePermission: boolean = false
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;
  searchDelay = new Subject<boolean>();
  region = JSON.parse(localStorage.getItem('regionId'));
  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private policyService: PolicyService
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.searchBucketPolicy();
    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.searchBucketPolicy();
      });
  }

  form: FormGroup<{
    emailUser: FormControl<string>;
    permission: FormControl<string>;
    listActionPermission: FormControl<string[]>;
  }> = this.fb.group({
    emailUser: ['', Validators.required],
    permission: ['', Validators.required],
    listActionPermission: [[] as string[], Validators.required],
  });

  searchBucketPolicy() {
    this.loading = true;
    this.bucketService
      .getListBucketPolicy(
        this.bucketName,
        this.pageNumber,
        this.pageSize,
        this.value.trim(),
        this.region
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listBucketPolicy = data.records;
          this.total = data.totalCount;
        },
        error: (e) => { 
          if (e.status == 403) {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.non.permission', { serviceName: 'Danh sách Bucket Policy' })
            );
          }
          this.listBucketPolicy = [];
        },
      });
  }

  search(search: string) {
    this.value = search.trim();
    this.searchBucketPolicy();
  }

  listSubuser: SubUser[] = [];
  loadingSubuser: boolean = true;
  getListSubuser() {
    this.loadingSubuser = true;
    this.bucketService
      .getListSubuser(9999, 0, this.region)
      .pipe(
        finalize(() => {
          this.loadingSubuser = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listSubuser = data.records;
        },
        error: (e) => {
          this.listSubuser = [];
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.get.subuser.fail')
          );
        },
      });
  }

  isVisibleCreate = false;
  permission: string;
  isUserOther: boolean = false;
  listActionPermission: string[] = [];
  setActionPermission: Set<string> = new Set<string>();
  listActionPermissionCustom: string[] = [];
  modalCreate() {
    this.permission = this.listPermission[0].name;
    this.isVisibleCreate = true;
    this.form.get('emailUser')?.setValidators([Validators.required]);
    this.setActionPermission.clear();
    this.getListSubuser();
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
    this.isUserOther = false;
    this.listActionPermission = [];
  }

  changeUser() {
    this.form.controls.emailUser.reset();
    if (this.isUserOther) {
      this.form
        .get('emailUser')
        ?.setValidators([Validators.required, AppValidator.validEmail]);
      if (this.isVisibleUpdate) {
        if (this.bucketPolicyUpdate.typeUser == 'SubUser') {
          this.form.controls.emailUser.reset();
        } else {
          this.form.controls.emailUser.setValue(
            this.bucketPolicyUpdate.subuser
          );
        }
      }
    } else {
      this.form.get('emailUser')?.setValidators([Validators.required]);
      if (this.isVisibleUpdate) {
        if (this.bucketPolicyUpdate.typeUser == 'SubUser') {
          this.form.controls.emailUser.setValue(
            this.bucketPolicyUpdate.subuser
          );
        } else {
          this.form.controls.emailUser.reset();
        }
      }
    }

    // Update the value and validity of the form control
    this.form.get('emailUser')?.updateValueAndValidity();
  }

  handleOkCreate() {
    this.isLoadingCreate = true;

    this.listActionPermission.forEach((e) => {
      if (e == 'selectAll') {
        this.setActionPermission.add('CreateBucket');
        this.setActionPermission.add('DeleteBucketPolicy');
        this.setActionPermission.add('DeleteBucket');
        this.setActionPermission.add('DeleteBucketWebsite');
        this.setActionPermission.add('GetBucketAcl');
        this.setActionPermission.add('GetBucketCORS');
        this.setActionPermission.add('GetBucketLocation');
        this.setActionPermission.add('GetBucketLogging');
        this.setActionPermission.add('GetBucketNotification');
        this.setActionPermission.add('GetBucketPolicy');
        this.setActionPermission.add('GetBucketRequestPayment');
        this.setActionPermission.add('GetBucketTagging');
        this.setActionPermission.add('GetBucketVersioning');
        this.setActionPermission.add('ListAllMyBuckets');
        this.setActionPermission.add('ListBucketMultiPartUploads');
        this.setActionPermission.add('ListBucket');
        this.setActionPermission.add('ListBucketVersions');
        this.setActionPermission.add('PutBucketAcl');
        this.setActionPermission.add('PutBucketCORS');
        this.setActionPermission.add('PutBucketLogging');
        this.setActionPermission.add('PutBucketNotification');
        this.setActionPermission.add('PutBucketPolicy');
        this.setActionPermission.add('PutBucketRequestPayment');
        this.setActionPermission.add('PutBucketTagging');
        this.setActionPermission.add('PutBucketVersioning');
        this.setActionPermission.add('PutBucketWebsite');
        this.setActionPermission.add('DeleteObject');
        this.setActionPermission.add('DeleteObjectVersion');
        this.setActionPermission.add('GetObjectAcl');
        this.setActionPermission.add('GetObject');
        this.setActionPermission.add('GetObjectTorrent');
        this.setActionPermission.add('GetObjectVersionAcl');
        this.setActionPermission.add('GetObjectVersion');
        this.setActionPermission.add('GetObjectVersionTorrent');
        this.setActionPermission.add('PutObjectAcl');
        this.setActionPermission.add('PutObject');
        this.setActionPermission.add('PutObjectVersionAcl');
        this.setActionPermission.add('RestoreObject');
        this.setActionPermission.add('GetLifecycleConfiguration');
        this.setActionPermission.add('GetReplicationConfiguration');
        this.setActionPermission.add('PutAccelerateConfiguration');
        this.setActionPermission.add('PutLifecycleConfiguration');
        this.setActionPermission.add('PutReplicationConfiguration');
        this.setActionPermission.add('DeleteReplicationConfiguration');
        this.setActionPermission.add('GetAccelerateConfiguration');
        this.setActionPermission.add('AbortMultipartUpload');
        this.setActionPermission.add('ListMultipartUploadParts');
        return;
      } else if (e == 'CreateBucketCombo') {
        this.setActionPermission.add('CreateBucket');
        this.setActionPermission.add('DeleteBucket');
      } else if (e == 'readDownloadFile') {
        this.setActionPermission.add('GetObject');
        this.setActionPermission.add('ListBucket');
      } else if (e == 'uploadFile') {
        this.setActionPermission.add('PutObjectAcl');
        this.setActionPermission.add('PutObject');
        this.setActionPermission.add('PutObjectVersionAcl');
      } else if (e == 'cofigBucket') {
        this.setActionPermission.add('CreateBucket');
        this.setActionPermission.add('DeleteBucketPolicy');
        this.setActionPermission.add('DeleteBucket');
        this.setActionPermission.add('DeleteBucketWebsite');
        this.setActionPermission.add('GetBucketAcl');
        this.setActionPermission.add('GetBucketCORS');
        this.setActionPermission.add('GetBucketLocation');
        this.setActionPermission.add('GetBucketLogging');
        this.setActionPermission.add('GetBucketNotification');
        this.setActionPermission.add('GetBucketPolicy');
        this.setActionPermission.add('GetBucketRequestPayment');
        this.setActionPermission.add('GetBucketTagging');
        this.setActionPermission.add('GetBucketVersioning');
        this.setActionPermission.add('ListAllMyBuckets');
        this.setActionPermission.add('ListBucketMultiPartUploads');
        this.setActionPermission.add('ListBucket');
        this.setActionPermission.add('ListBucketVersions');
        this.setActionPermission.add('PutBucketAcl');
        this.setActionPermission.add('PutBucketCORS');
        this.setActionPermission.add('PutBucketLogging');
        this.setActionPermission.add('PutBucketNotification');
        this.setActionPermission.add('PutBucketPolicy');
        this.setActionPermission.add('PutBucketRequestPayment');
        this.setActionPermission.add('PutBucketTagging');
        this.setActionPermission.add('PutBucketVersioning');
        this.setActionPermission.add('PutBucketWebsite');
      } else {
        this.setActionPermission.add(e);
      }
    });

    console.log(this.setActionPermission);

    this.bucketService
      .createBucketPolicy(
        this.bucketName,
        this.permission,
        this.form.controls.emailUser.value,
        this.isUserOther,
        Array.from(this.setActionPermission),
        this.region
      )
      .pipe(
        finalize(() => {
          this.isLoadingCreate = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.create.bucket.policy.success')
          );
          this.isVisibleCreate = false;
          this.isUserOther = false;
          this.permission = '';
          this.form.controls.emailUser.reset();
          this.listActionPermission = [];
          this.searchBucketPolicy();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.create.bucket.policy.fail')
          );
          this.isVisibleCreate = false;
        },
      });
  }

  isVisibleUpdate = false;
  bucketPolicyUpdate: bucketPolicyDetail = new bucketPolicyDetail();
  modalUpdate(sid: string) {
    this.isVisibleUpdate = true;
    this.setActionPermission.clear();
    this.getListSubuser();
    this.bucketService
      .getBucketPolicyDetail(sid, this.bucketName, this.region)
      .subscribe({
        next: (data) => {
          console.log(data);

          this.bucketPolicyUpdate = data;
          const typeUser = data.typeUser === 'SubUser' ? false : true;
          this.isUserOther = typeUser;
          this.form.controls.emailUser.setValue(
            this.bucketPolicyUpdate.subuser
          );
          this.form.controls.permission.setValue(data.permission);
          const actions = data.actions.map((item) => item.split(':')[1]);
          this.form.controls.listActionPermission.setValue(actions);
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.detail.bucket.policy.fail')
          );
        },
      });
  }

  handleCancelUpdate() {
    this.isVisibleUpdate = false;
  }

  handleOkUpdate() {
    this.isLoadingUpdate = true;
    this.form.controls.listActionPermission.value.forEach((e) => {
      if (e == 'selectAll') {
        this.setActionPermission.add('CreateBucket');
        this.setActionPermission.add('DeleteBucketPolicy');
        this.setActionPermission.add('DeleteBucket');
        this.setActionPermission.add('DeleteBucketWebsite');
        this.setActionPermission.add('GetBucketAcl');
        this.setActionPermission.add('GetBucketCORS');
        this.setActionPermission.add('GetBucketLocation');
        this.setActionPermission.add('GetBucketLogging');
        this.setActionPermission.add('GetBucketNotification');
        this.setActionPermission.add('GetBucketPolicy');
        this.setActionPermission.add('GetBucketRequestPayment');
        this.setActionPermission.add('GetBucketTagging');
        this.setActionPermission.add('GetBucketVersioning');
        this.setActionPermission.add('ListAllMyBuckets');
        this.setActionPermission.add('ListBucketMultiPartUploads');
        this.setActionPermission.add('ListBucket');
        this.setActionPermission.add('ListBucketVersions');
        this.setActionPermission.add('PutBucketAcl');
        this.setActionPermission.add('PutBucketCORS');
        this.setActionPermission.add('PutBucketLogging');
        this.setActionPermission.add('PutBucketNotification');
        this.setActionPermission.add('PutBucketPolicy');
        this.setActionPermission.add('PutBucketRequestPayment');
        this.setActionPermission.add('PutBucketTagging');
        this.setActionPermission.add('PutBucketVersioning');
        this.setActionPermission.add('PutBucketWebsite');
        this.setActionPermission.add('DeleteObject');
        this.setActionPermission.add('DeleteObjectVersion');
        this.setActionPermission.add('GetObjectAcl');
        this.setActionPermission.add('GetObject');
        this.setActionPermission.add('GetObjectTorrent');
        this.setActionPermission.add('GetObjectVersionAcl');
        this.setActionPermission.add('GetObjectVersion');
        this.setActionPermission.add('GetObjectVersionTorrent');
        this.setActionPermission.add('PutObjectAcl');
        this.setActionPermission.add('PutObject');
        this.setActionPermission.add('PutObjectVersionAcl');
        this.setActionPermission.add('RestoreObject');
        this.setActionPermission.add('GetLifecycleConfiguration');
        this.setActionPermission.add('GetReplicationConfiguration');
        this.setActionPermission.add('PutAccelerateConfiguration');
        this.setActionPermission.add('PutLifecycleConfiguration');
        this.setActionPermission.add('PutReplicationConfiguration');
        this.setActionPermission.add('DeleteReplicationConfiguration');
        this.setActionPermission.add('GetAccelerateConfiguration');
        this.setActionPermission.add('AbortMultipartUpload');
        this.setActionPermission.add('ListMultipartUploadParts');
        return;
      } else if (e == 'CreateBucketCombo') {
        this.setActionPermission.add('CreateBucket');
        this.setActionPermission.add('DeleteBucket');
      } else if (e == 'readDownloadFile') {
        this.setActionPermission.add('GetObject');
        this.setActionPermission.add('ListBucket');
      } else if (e == 'uploadFile') {
        this.setActionPermission.add('PutObjectAcl');
        this.setActionPermission.add('PutObject');
        this.setActionPermission.add('PutObjectVersionAcl');
      } else if (e == 'cofigBucket') {
        this.setActionPermission.add('CreateBucket');
        this.setActionPermission.add('DeleteBucketPolicy');
        this.setActionPermission.add('DeleteBucket');
        this.setActionPermission.add('DeleteBucketWebsite');
        this.setActionPermission.add('GetBucketAcl');
        this.setActionPermission.add('GetBucketCORS');
        this.setActionPermission.add('GetBucketLocation');
        this.setActionPermission.add('GetBucketLogging');
        this.setActionPermission.add('GetBucketNotification');
        this.setActionPermission.add('GetBucketPolicy');
        this.setActionPermission.add('GetBucketRequestPayment');
        this.setActionPermission.add('GetBucketTagging');
        this.setActionPermission.add('GetBucketVersioning');
        this.setActionPermission.add('ListAllMyBuckets');
        this.setActionPermission.add('ListBucketMultiPartUploads');
        this.setActionPermission.add('ListBucket');
        this.setActionPermission.add('ListBucketVersions');
        this.setActionPermission.add('PutBucketAcl');
        this.setActionPermission.add('PutBucketCORS');
        this.setActionPermission.add('PutBucketLogging');
        this.setActionPermission.add('PutBucketNotification');
        this.setActionPermission.add('PutBucketPolicy');
        this.setActionPermission.add('PutBucketRequestPayment');
        this.setActionPermission.add('PutBucketTagging');
        this.setActionPermission.add('PutBucketVersioning');
        this.setActionPermission.add('PutBucketWebsite');
      } else {
        this.setActionPermission.add(e);
      }
    });
    this.bucketService
      .updateBucketPolicy(
        this.bucketName,
        this.bucketPolicyUpdate.sid,
        this.form.controls.permission.value,
        this.form.controls.emailUser.value,
        this.isUserOther,
        Array.from(this.setActionPermission),
        this.region
      )
      .pipe(
        finalize(() => {
          this.isLoadingUpdate = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.update.bucket.policy.success')
          );
          this.isVisibleUpdate = false;
          this.searchBucketPolicy();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.update.bucket.policy.fail')
          );
          this.isVisibleUpdate = false;
        },
      });
  }

  isVisibleDelete: boolean = false;
  bucketPolicyId: string;
  modalDelete(sid: string) {
    this.isVisibleDelete = true;
    this.bucketPolicyId = sid;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isLoadingDelete = true;
    this.bucketService
      .deleteBucketPolicy(this.bucketName, this.bucketPolicyId, this.region)
      .subscribe({
        next: (data) => {
          console.log(data);
          if (data == 'Thao tác thành công') {
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.delete.bucket.policy.success')
            );
            this.isVisibleDelete = false;
            this.isLoadingDelete = false;
            this.searchBucketPolicy();
          } else {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.delete.bucket.policy.fail')
            );
            this.isVisibleDelete = false;
            this.isLoadingDelete = false;
          }
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.delete.bucket.policy.fail')
          );
          this.isVisibleDelete = false;
          this.isLoadingDelete = false;
        },
      });
  }

  isVisibleJson: boolean = false;
  jsonItemDataBucketPolicy: string;
  jsonTotalDataBucketPolicy: string;
  bucketPolicyDetail: bucketPolicyDetail = new bucketPolicyDetail();
  modalJson(sid: string) {
    this.isVisibleJson = true;
    this.bucketService
      .getBucketPolicyJson(sid, this.bucketName, this.region)
      .subscribe({
        next: (data) => {
          this.jsonItemDataBucketPolicy = JSON.stringify(data.JsonItem, null, 2);
          this.jsonTotalDataBucketPolicy = JSON.stringify(data.JsonTotal, null, 2);
        },
        error: (e) => {
        },
      });
  }
  handleClose() {
    this.isVisibleJson = false;
  }
}
