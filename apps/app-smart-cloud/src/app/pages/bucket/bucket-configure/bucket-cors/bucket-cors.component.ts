import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

class HeaderName {
  id: number = 0;
  name: string = '';
}

@Component({
  selector: 'one-portal-bucket-cors',
  templateUrl: './bucket-cors.component.html',
  styleUrls: ['./bucket-cors.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketCorsComponent implements OnInit {
  inputSearch: string = '';
  listBucketCors: any[] = [];
  listHeaderName: HeaderName[] = [];
  loading: boolean = false;

  constructor(
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  searchBucketCors() {}
  createBucketCors() {}

  isVisibleCreate = false;
  modalCreate() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.notification.success('', 'Tạo mới Bucket CORS thành công');
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

  idHeaderName: number = 0;
  addHeaderName() {
    let item: HeaderName = new HeaderName();
    item.id = this.idHeaderName++;
    this.listHeaderName.push(item);
  }

  delelteHeaderName(id: number) {
    this.listHeaderName = this.listHeaderName.filter((item) => item.id != id);
    console.log('list name', this.listHeaderName);
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
    this.notification.success('', 'Xóa Cors thành công');

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
