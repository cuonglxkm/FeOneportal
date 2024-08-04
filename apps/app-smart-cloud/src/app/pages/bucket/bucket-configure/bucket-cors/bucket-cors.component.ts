import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, finalize, Subject } from 'rxjs';
import {
  BucketCors,
  BucketCorsCreate,
} from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';
import { TimeCommon } from 'src/app/shared/utils/common';

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
  value: string = '';
  region = JSON.parse(localStorage.getItem('regionId'));
  listBucketCors: BucketCors[] = [];
  listHeaderName: HeaderName[] = [];
  pageSize: number = 10;
  pageNumber: number = 1;
  total: number;
  loading: boolean = true;
  domain: string;
  get: boolean = false;
  post: boolean = false;
  put: boolean = false;
  delete: boolean = false;
  head: boolean = false;
  isLoadingCreate: boolean = false;
  isLoadingUpdate: boolean = false;
  isLoadingDelete: boolean = false;
  searchDelay = new Subject<boolean>();
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder
  ) {}

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  preventWhitespace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.searchBucketCors();
    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.searchBucketCors();
      });
  }

  form = new FormGroup({
    domain: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-)){1,253}$/)],
    }),
  });

  searchBucketCors() {
    this.loading = true;
    this.bucketService
      .getListPagingBucketCORS(
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
          this.listBucketCors = data.records;
          this.total = data.totalCount;
        },
        error: (e) => {
          this.listBucketCors = [];
        },
      });
  }

  search(search: string) {
    this.value = search.trim();
    this.searchBucketCors();
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
    this.form.reset();
    this.listHeaderName = [];
    this.bucketCorsCreate.maxAgeSeconds = 3600;
  }

  handleOkCreate() {
    if (this.bucketCorsCreate.maxAgeSeconds?.toString.length == 0) {
      this.bucketCorsCreate.maxAgeSeconds = null;
    }
    this.isLoadingCreate = true;
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

    this.bucketService
      .createBucketCORS(this.bucketCorsCreate, this.region)
      .pipe(
        finalize(() => {
          this.isLoadingCreate = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.isVisibleCreate = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.create.bucket.cors.success')
          );
          this.form.reset();
          this.searchBucketCors();
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.cors.fail')
          );
          this.cdr.detectChanges();
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
    this.isLoadingDelete = true;
    this.bucketService
      .deleteBucketCORS(this.bucketCorsDelete, this.region)
      .subscribe({
        next: (data) => {
          this.isLoadingDelete = false;
          this.isVisibleDelete = false;
          this.searchBucketCors();
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.delete.bucket.cors.success')
          );
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.isLoadingDelete = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.cors.fail')
          );
          this.cdr.detectChanges();
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
    this.isLoadingUpdate = true;
    if (this.bucketCorsUpdate.maxAgeSeconds?.toString.length == 0) {
      this.bucketCorsUpdate.maxAgeSeconds = null;
    }
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

    this.bucketService
      .updateBucketCORS(this.bucketCorsUpdate, this.region)
      .pipe(
        finalize(() => {
          this.isLoadingUpdate = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.isVisibleUpdate = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.update.bucket.cors.success')
          );
          this.searchBucketCors();
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.cors.fail')
          );
          this.cdr.detectChanges();
        },
      });
  }
}
