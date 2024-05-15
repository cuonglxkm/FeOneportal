import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  BucketPolicy,
  bucketPolicyDetail,
} from 'src/app/shared/models/bucket.model';
import { SubUser } from 'src/app/shared/models/sub-user.model';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-bucket-policy',
  templateUrl: './bucket-policy.component.html',
  styleUrls: ['./bucket-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketPolicyComponent implements OnInit {
  @Input() bucketName: string;
  searchValue: string = '';
  listBucketPolicy: BucketPolicy[] = [];
  pageSize: number = 10;
  pageNumber: number = 1;
  total: number;
  loading: boolean = true;
  listPermission = [{ name: 'Allow' }, { name: 'Deny' }];
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;

  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private fb: NonNullableFormBuilder
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    this.searchBucketPolicy();
  }

  formEdit: FormGroup<{
    isUserOther: FormControl<string>
    emailUser: FormControl<string>
    permission: FormControl<string>
    listActionPermission: FormControl<string>
  }> = this.fb.group({
    isUserOther: ['',Validators.required],
    emailUser: ['',Validators.required],
    permission: ['',Validators.required],
    listActionPermission: ['',Validators.required],
  });

  searchBucketPolicy() {
    this.loading = true;
    this.bucketService
      .getListBucketPolicy(
        this.bucketName,
        this.pageNumber,
        this.pageSize,
        this.searchValue
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
          console.log(this.listBucketPolicy);
          
          this.total = data.totalCount;
        },
        error: (e) => {
          this.listBucketPolicy = [];
          this.notification.error(
            e.statusText,
            'Lấy danh sách Bucket Policy không thành công'
          );
        },
      });
  }

  listSubuser: SubUser[] = [];
  loadingSubuser: boolean = true;
  getListSubuser() {
    this.loadingSubuser = true;
    this.bucketService
      .getListSubuser(9999, 0)
      .pipe(finalize(() => (this.loadingSubuser = false)))
      .subscribe({
        next: (data) => {
          this.listSubuser = data.records;
        },
        error: (e) => {
          this.listSubuser = [];
          this.notification.error(
            e.statusText,
            'Lấy danh sách Subuser không thành công'
          );
        },
      });
  }

  isVisibleCreate = false;
  permission: string;
  emailUser: string;
  isUserOther: boolean = true;
  listActionPermission: string[] = [];
  setActionPermission: Set<string> = new Set<string>();
  listActionPermissionCustom: string[] = [];
  modalCreate() {
    this.isVisibleCreate = true;
    this.setActionPermission.clear();
    this.getListSubuser();
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
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
        this.emailUser,
        this.isUserOther,
        Array.from(this.setActionPermission)
      )
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Tạo mới Bucket Policy thành công');
          this.searchBucketPolicy();
        },
        error: (e) => {
          this.notification.error('', 'Tạo mới Bucket Policy không thành công');
        },
      });
  }

  isVisibleUpdate = false;
  bucketPolicyUpdate: bucketPolicyDetail = new bucketPolicyDetail();
  modalUpdate(sid: string) {
    this.isVisibleUpdate = true;
    this.getListSubuser();
    this.setActionPermission.clear();
    this.bucketService.getBucketPolicyDetail(sid, this.bucketName).subscribe({
      next: (data) => {
        console.log(data);
        
        this.bucketPolicyUpdate = data;

        this.formEdit.controls.emailUser.setValue(data.subuser);
        this.formEdit.controls.permission.setValue(data.permission);
        const actions = data.actions.map(item => item.split(':')[1])
        this.formEdit.controls.listActionPermission.setValue(actions);
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Lấy chi tiết Bucket Policy không thành công'
        );
      },
    });
  }

  handleCancelUpdate() {
    this.isVisibleUpdate = false;
  }

  handleOkUpdate() {
    this.isVisibleUpdate = false;
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
    this.bucketService
      .updateBucketPolicy(
        this.bucketName,
        this.bucketPolicyUpdate.sid,
        this.bucketPolicyUpdate.permission,
        this.bucketPolicyUpdate.subuser,
        this.isUserOther,
        Array.from(this.setActionPermission)
      )
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Chỉnh sửa Bucket Policy thành công');
          this.searchBucketPolicy();
        },
        error: (e) => {
          this.notification.error(
            '',
            'Chỉnh sửa Bucket Policy không thành công'
          );
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
    this.bucketService
      .deleteBucketPolicy(this.bucketName, this.bucketPolicyId)
      .subscribe({
        next: (data) => {
          console.log(data);
          if (data == 'Thao tác thành công') {
            this.notification.success('', 'Xóa Bucket Policy thành công');
            this.isVisibleDelete = false;
            this.searchBucketPolicy();
          } else {
            this.notification.error('', 'Xóa Bucket Policy không thành công');
          }
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Xóa Bucket Policy không thành công');
        },
      });
  }

  isVisibleJson: boolean = false;
  bucketPolicyDetail: bucketPolicyDetail = new bucketPolicyDetail();
  modalJson(sid: string) {
    this.isVisibleJson = true;
    this.bucketService.getBucketPolicyDetail(sid, this.bucketName).subscribe({
      next: (data) => {
        this.bucketPolicyDetail = data;
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Lấy Bucket Policy JSON không thành công'
        );
      },
    });
  }
  handleClose() {
    this.isVisibleJson = false;
  }
}
