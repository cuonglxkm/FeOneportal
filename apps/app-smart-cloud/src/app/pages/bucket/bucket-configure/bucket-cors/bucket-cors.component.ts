import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { id } from 'date-fns/locale';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  BucketCors,
  BucketCorsCreate,
} from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';

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
  @Input() bucketName: string;
  inputSearch: string = '';
  listBucketCors: BucketCors[] = [];
  listHeaderName: HeaderName[] = [];
  loading: boolean = true;
  domain: string;
  get: boolean = false;
  post: boolean = false;
  put: boolean = false;
  delete: boolean = false;
  head: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchBucketCors();
  }
  searchBucketCors() {
    this.loading = true;
    this.bucketService
      .getListBucketCORS(this.bucketName)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listBucketCors = data;
        },
        error: (e) => {
          this.listBucketCors = [];
          this.notification.error(
            e.statusText,
            'Lấy danh sách Bucket CORS không thành công'
          );
        },
      });
  }

  resetData() {
    this.domain = '';
    this.get = false;
    this.post = false;
    this.put = false;
    this.delete = false;
    this.head = false;
    this.listHeaderName = [];
  }

  isVisibleCreate = false;
  bucketCorsCreate: BucketCorsCreate = new BucketCorsCreate();
  modalCreate() {
    this.resetData();
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.bucketCorsCreate.allowedOrigins = [this.domain];
    this.bucketCorsCreate.bucketName = this.bucketName;
    if (this.get == true) {
      this.bucketCorsCreate.allowedMethods.push('get');
    }
    if (this.post == true) {
      this.bucketCorsCreate.allowedMethods.push('post');
    }
    if (this.put == true) {
      this.bucketCorsCreate.allowedMethods.push('put');
    }
    if (this.delete == true) {
      this.bucketCorsCreate.allowedMethods.push('delete');
    }
    if (this.head == true) {
      this.bucketCorsCreate.allowedMethods.push('head');
    }
    this.listHeaderName.forEach((element) => {
      this.bucketCorsCreate.allowedHeaders.push(element.name);
    });

    this.bucketService.createBucketCORS(this.bucketCorsCreate).subscribe({
      next: (data) => {
        this.searchBucketCors();
        this.notification.success('', 'Tạo mới Bucket CORS thành công');
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Tạo mới Bucket CORS không thành công'
        );
      },
    });
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
  bucketCorsDelete: BucketCorsCreate = new BucketCorsCreate();
  modalDelete(data: any) {
    this.isVisibleDelete = true;
    this.bucketCorsDelete = data;
    console.log('cors delete', this.bucketCorsDelete);
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;

    this.bucketService.deleteBucketCORS(this.bucketCorsDelete).subscribe({
      next: (data) => {
        this.notification.success('', 'Xóa Bucket CORS thành công');
        this.searchBucketCors();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Xóa Bucket CORS không thành công'
        );
      },
    });
  }

  isVisibleUpdate = false;
  bucketCorsUpdate: BucketCorsCreate = new BucketCorsCreate();
  modalUpdate(data: any) {
    this.resetData();
    this.isVisibleUpdate = true;
    this.bucketCorsUpdate = data;
    this.domain = this.bucketCorsUpdate.allowedOrigins[0];
    let idHeader = 0;
    this.bucketCorsUpdate.allowedHeaders.forEach((e) => {
      let headerName = new HeaderName();
      headerName.id = idHeader++;
      headerName.name = e;
      this.listHeaderName.push(headerName);
    });
    this.bucketCorsUpdate.allowedMethods.forEach((e) => {
      if (e.toUpperCase() == 'GET') {
        this.get = true;
      }
      if (e.toUpperCase() == 'POST') {
        this.post = true;
      }
      if (e.toUpperCase() == 'PUT') {
        this.put = true;
      }
      if (e.toUpperCase() == 'DELETE') {
        this.delete = true;
      }
      if (e.toUpperCase() == 'HEAD') {
        this.head = true;
      }
    });
  }

  handleCancelUpdate() {
    this.isVisibleUpdate = false;
  }

  handleOkUpdate() {
    this.isVisibleUpdate = false;
    this.bucketCorsUpdate.allowedOrigins = [this.domain];
    this.bucketCorsUpdate.bucketName = this.bucketName;
    this.bucketCorsUpdate.allowedMethods = [];
    this.bucketCorsUpdate.allowedHeaders = [];
    if (this.get == true) {
      this.bucketCorsUpdate.allowedMethods.push('GET');
    }
    if (this.post == true) {
      this.bucketCorsUpdate.allowedMethods.push('POST');
    }
    if (this.put == true) {
      this.bucketCorsUpdate.allowedMethods.push('PUT');
    }
    if (this.delete == true) {
      this.bucketCorsUpdate.allowedMethods.push('DELETE');
    }
    if (this.head == true) {
      this.bucketCorsUpdate.allowedMethods.push('HEAD');
    }
    this.listHeaderName.forEach((element) => {
      this.bucketCorsUpdate.allowedHeaders.push(element.name);
    });

    this.bucketService.updateBucketCORS(this.bucketCorsUpdate).subscribe({
      next: (data) => {
        this.searchBucketCors();
        this.notification.success('', 'Cập nhật Bucket CORS thành công');
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Cập nhật Bucket CORS không thành công'
        );
      },
    });
  }
}
