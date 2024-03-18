import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { BucketService } from 'src/app/shared/services/bucket.service';

class Tag {
  id: number = 0;
  key: string = '';
  value: string = '';
}

@Component({
  selector: 'one-portal-lifecycle-config',
  templateUrl: './lifecycle-config.component.html',
  styleUrls: ['./lifecycle-config.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleConfigComponent implements OnInit {
  @Input() bucketName: string;
  inputSearch: string = '';
  listLifecycle: any[] = [];
  loading: boolean = true;

  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchLifeCycle();
  }

  searchLifeCycle() {
    this.loading = true;
    this.bucketService
      .getListBucketLifecycle(this.bucketName)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listLifecycle = data;
        },
        error: (e) => {
          this.listLifecycle = [];
          this.notification.error(
            e.statusText,
            'Lấy danh sách Bucket Lifecycle không thành công'
          );
        },
      });
  }
  createLifeCycle() {}

  isVisibleCreate = false;
  modalCreate() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.notification.success('', 'Tạo mới Bucket Lifecycle thành công');
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

  idTag: number = 0;
  listTag: Tag[] = [];
  addTag() {
    let tag = new Tag();
    tag.id = this.idTag++;
    this.listTag.push(tag);
  }

  delelteTag(id: number) {
    this.listTag = this.listTag.filter((item) => item.id != id);
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
    this.notification.success('', 'Xóa Lifecycle thành công');

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
}
