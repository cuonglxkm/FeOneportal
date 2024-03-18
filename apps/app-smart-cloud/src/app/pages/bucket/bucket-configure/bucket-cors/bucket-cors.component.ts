import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
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
  allowedMethods: Map<string, boolean> = new Map<string, boolean>();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchBucketCors();
    this.allowedMethods.set('get', false);
    this.allowedMethods.set('post', false);
    this.allowedMethods.set('put', false);
    this.allowedMethods.set('delete', false);
    this.allowedMethods.set('head', false);
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

  isVisibleCreate = false;
  bucketCorsCreate: BucketCorsCreate = new BucketCorsCreate();
  modalCreate() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.bucketCorsCreate.bucketName = this.bucketName;
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
    this.bucketCorsCreate = data;
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
}
