import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { BucketPolicy, bucketPolicyDetail } from 'src/app/shared/models/bucket.model';
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
    private activatedRoute: ActivatedRoute
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    this.searchBucketPolicy();
  }

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
  modalCreate() {
    this.isVisibleCreate = true;
    this.getListSubuser();
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.notification.success('', 'Tạo mới Bucket Policy thành công');
    this.bucketService
      .createBucketPolicy(
        this.bucketName,
        this.permission,
        this.emailUser,
        this.isUserOther,
        this.listActionPermission
      )
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Tạo mới Bucket Policy thành công');
          this.searchBucketPolicy();
        },
        error: (e) => {
          this.notification.error(
            '',
            'Tạo mới Router Interface không thành công'
          );
        },
      });
  }

  isVisibleUpdate = false;
  bucketPolicyUpdate: bucketPolicyDetail = new bucketPolicyDetail();
  modalUpdate(sid: string) {
    this.isVisibleCreate = true;
    this.bucketService.getBucketPolicyDetail(sid, this.bucketName).subscribe({
      next: (data) => {
        this.bucketPolicyUpdate = data;
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
    this.bucketService
      .updateBucketPolicy(
        this.bucketName,
        this.bucketPolicyUpdate.sid,
        this.bucketPolicyUpdate.permission,
        this.bucketPolicyUpdate.subuser,
        this.isUserOther,
        this.bucketPolicyUpdate.actions
      )
      .subscribe({
        next: (data) => {
          this.notification.success('', 'Chỉnh sửa Bucket Policy thành công');
          this.searchBucketPolicy();
        },
        error: (e) => {
          this.notification.error(
            '',
            'Tạo mới Router Interface không thành công'
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
    this.isVisibleDelete = false;
    this.bucketService
      .deleteBucketPolicy(this.bucketName, this.bucketPolicyId)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.notification.success('', 'Xóa Bucket Policy thành công');
          this.searchBucketPolicy();
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
