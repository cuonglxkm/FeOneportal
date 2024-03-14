import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-bucket-policy',
  templateUrl: './bucket-policy.component.html',
  styleUrls: ['./bucket-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketPolicyComponent implements OnInit {
  inputSearch: string = '';
  listBucketPolicy: any[] = [];
  loading: boolean = false;
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;

  constructor(
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  searchBucketPolicy() {}

  isVisibleCreate = false;
  modalCreate() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.notification.success('', 'Tạo mới Bucket Policy thành công');
    // this.routerInterfaceCreate.regionId = this.regionId;
    // this.routerInterfaceCreate.routerId = this.routerId;
    // this.service.createRouterInterface(this.routerInterfaceCreate).subscribe({
    //   next: (data) => {
    //
    //   },
    //   error: (e) => {
    //     this.notification.error(
    //       '',
    //       'Tạo mới Router Interface không thành công'
    //     );
    //   },
    // });
  }

  isVisibleUpdate = false;
  modalUpdate(id: any) {
    this.isVisibleCreate = true;
  }

  handleCancelUpdate() {
    this.isVisibleUpdate = false;
  }

  handleOkUpdate() {
    this.isVisibleUpdate = false;
    this.notification.success('', 'Chỉnh sửa Bucket Policy thành công');
    // this.routerInterfaceCreate.regionId = this.regionId;
    // this.routerInterfaceCreate.routerId = this.routerId;
    // this.service.createRouterInterface(this.routerInterfaceCreate).subscribe({
    //   next: (data) => {
    //
    //   },
    //   error: (e) => {
    //     this.notification.error(
    //       '',
    //       'Tạo mới Router Interface không thành công'
    //     );
    //   },
    // });
  }

  subuser: boolean = true;
  userVnpt: boolean = false;
  initSubuser(): void {
    this.subuser = true;
    this.userVnpt = false;
  }
  initUserVnpt(): void {
    this.subuser = false;
    this.userVnpt = true;
  }

  isVisibleDelete: boolean = false;
  modalDelete(id: any) {
    this.isVisibleDelete = true;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.notification.success('', 'Xóa Router thành công');

    // this.dataService
    //   .deleteRouter(this.cloudId, this.region, this.projectId)
    //   .subscribe({
    //     next: (data) => {
    //       console.log(data);
    //       this.notification.success('', 'Xóa Router thành công');
    //       this.reloadTable();
    //     },
    //     error: (error) => {
    //       console.log(error.error);
    //       this.notification.error('', 'Xóa Router không thành công');
    //     },
    //   });
  }

  isVisibleJson: boolean = false;
  bucketPolicy: any;
  modalJson(item: any) {
    this.isVisibleJson = true;
    this.bucketPolicy = item;
  }
  handleClose() {
    this.isVisibleJson = false;
  }
}
