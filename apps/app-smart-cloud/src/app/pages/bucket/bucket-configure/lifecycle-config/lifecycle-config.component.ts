import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, finalize, Subject } from 'rxjs';
import {
  BucketLifecycle,
  BucketLifecycleCreate,
  BucketLifecycleUpdate,
  LifecycleTagPredicate,
} from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';
import { TimeCommon } from 'src/app/shared/utils/common';

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
  value: string = '';
  listLifecycle: BucketLifecycle[] = [];
  listAllLC: BucketLifecycle[] = [];
  loading: boolean = true;
  pageSize: number = 10;
  pageNumber: number = 1;
  total: number;
  isLoadingCreate: boolean = false;
  isLoadingUpdate: boolean = false;
  isLoadingDelete: boolean = false;
  searchDelay = new Subject<boolean>();
  region = JSON.parse(localStorage.getItem('regionId'));
  idTag: number = 0;
  listTag: Tag[] = [];
  duplicateLC: boolean = false;

  constructor(
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

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.searchLifeCycle();
    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.searchLifeCycle();
      });

    this.formCreate.valueChanges.subscribe((currentValue) => {
      // if (currentValue.isSetExpiration_Day == false && currentValue.isSetAbortIncompleteMultipartUpload_Day == false && currentValue.isSetNoncurrentVersionExpiration_Day == false) {
      //   return;
      // }
      this.validateDuplicateLC(
        currentValue.prefix,
        currentValue.isSetExpiration_Day,
        currentValue.isSetAbortIncompleteMultipartUpload_Day,
        currentValue.isSetNoncurrentVersionExpiration_Day
      );
    });
  }

  formUpdate: FormGroup<{
    prefix: FormControl<string>;
    isSetExpiration_Day: FormControl<boolean>;
    isSetAbortIncompleteMultipartUpload_Day: FormControl<boolean>;
    isSetNoncurrentVersionExpiration_Day: FormControl<boolean>;
  }> = this.fb.group({
    prefix: [''],
    isSetExpiration_Day: [false],
    isSetAbortIncompleteMultipartUpload_Day: [false],
    isSetNoncurrentVersionExpiration_Day: [false],
  });

  formCreate: FormGroup<{
    prefix: FormControl<string>;
    isSetExpiration_Day: FormControl<boolean>;
    isSetAbortIncompleteMultipartUpload_Day: FormControl<boolean>;
    isSetNoncurrentVersionExpiration_Day: FormControl<boolean>;
  }> = this.fb.group({
    prefix: [''],
    isSetExpiration_Day: [false],
    isSetAbortIncompleteMultipartUpload_Day: [false],
    isSetNoncurrentVersionExpiration_Day: [false],
  });

  searchLifeCycle() {
    this.loading = true;
    this.bucketService
      .getListBucketLifecycle(
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
          this.listLifecycle = data.pagingListBucketLifeCycle.records;
          this.listAllLC = data.listBucketLifeCycle;
          console.log(this.listLifecycle);

          this.total = data.pagingListBucketLifeCycle.totalCount;
        },
        error: (e) => {
          this.listLifecycle = [];
        },
      });
  }

  search(search: string) {
    this.value = search.trim();
    this.searchLifeCycle();
  }

  isVisibleCreate = false;
  lifecycleCreate: BucketLifecycleCreate = new BucketLifecycleCreate();
  modalCreate() {
    this.isVisibleCreate = true;
    this.listKeyError = [];
  }

  validateDuplicateLC(
    prefix,
    isSetExpirationDay,
    isSetAbortIncompleteMultipartUploadDay,
    isSetNoncurrentVersionExpirationDay
  ) {
    this.duplicateLC = false;
    prefix = !prefix ? null : prefix;
    var tags: LifecycleTagPredicate[] = [];
    this.listTag.forEach((e) => {
      let lifecycleTagPredicate: LifecycleTagPredicate =
        new LifecycleTagPredicate();
      if (e.key != '' || e.value != '') {
        lifecycleTagPredicate.metaKey = e.key.trim();
        lifecycleTagPredicate.metaValue = e.value.trim();
        tags.push(lifecycleTagPredicate);
      }
    });

    if (
      this.listAllLC.some((e) => {
        return (
          e.prefix == prefix &&
          JSON.stringify(e.lifecycleTagPredicate) === JSON.stringify(tags) &&
          e.isSetExpiration_Day == isSetExpirationDay &&
          e.isSetAbortIncompleteMultipartUpload_Day ==
            isSetAbortIncompleteMultipartUploadDay &&
          e.isSetNoncurrentVersionExpiration_Day ==
            isSetNoncurrentVersionExpirationDay
        );
      })
    ) {
      this.duplicateLC = true;
    }
  }

  resetForm() {
    this.formCreate.reset();
    this.lifecycleCreate.lifecycleRuleExpiration_Day = 1;
    this.lifecycleCreate.lifecycleRuleNoncurrentVersionExpiration_Day = 1;
    this.lifecycleCreate.lifecycleRuleAbortIncompleteMultipartUpload_Day = 1;
    this.lifecycleCreate.enabled = false;
    this.lifecycleCreate.isSetExpiration_Day = false;
    this.lifecycleCreate.isSetNoncurrentVersionExpiration_Day = false;
    this.lifecycleCreate.isSetAbortIncompleteMultipartUpload_Day = false;
    this.lifecycleCreate.lifecycleTagPredicate = [];
    this.listTag = [];
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
    this.resetForm();
  }

  listKeyError: boolean[] = [];
  handleOkCreate() {
    let hasKeyNull = this.checkTags(this.listTag);
    this.listKeyError = [];
    if (hasKeyNull) {
      this.listTag.forEach((e) => {
        if (e.key.trim() == '') {
          this.listKeyError.push(true);
        } else {
          this.listKeyError.push(false);
        }
      });
    } else {
      this.isLoadingCreate = true;
      this.lifecycleCreate.bucketName = this.bucketName;
      this.lifecycleCreate.prefix = this.lifecycleCreate.prefix?.trim();
      if (this.lifecycleCreate.prefix == '') {
        this.lifecycleCreate.prefix == null;
      }
      this.listTag.forEach((e) => {
        let lifecycleTagPredicate: LifecycleTagPredicate =
          new LifecycleTagPredicate();
        if (e.key != '') {
          lifecycleTagPredicate.metaKey = e.key.trim();
        }
        lifecycleTagPredicate.metaValue = e.value.trim();
        this.lifecycleCreate.lifecycleTagPredicate.push(lifecycleTagPredicate);
      });

      this.bucketService
        .createBucketLifecycle(this.lifecycleCreate, this.region)
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
              this.i18n.fanyi('app.lifeCycle.create.success')
            );
            this.resetForm();
            this.searchLifeCycle();
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.lifeCycle.create.fail')
            );
            this.cdr.detectChanges();
          },
        });
    }
  }

  onChangeKey(index: number) {
    this.listKeyError[index] = false;
    this.checkTags(this.listTag);
  }

  onChangeValue() {
    this.checkTags(this.listTag);
  }

  addTag() {
    let tag = new Tag();
    tag.id = this.idTag++;
    this.listTag.push(tag);
    this.lifecycleUpdate.isSetAbortIncompleteMultipartUpload_Day = false;
    this.formCreate.controls.isSetAbortIncompleteMultipartUpload_Day.setValue(
      false
    );
    this.formUpdate.controls.isSetAbortIncompleteMultipartUpload_Day.setValue(
      false
    );
  }

  checkTags(tags: Tag[]): boolean {
    if (this.isVisibleCreate == true) {
      this.validateDuplicateLC(
        this.formCreate.controls.prefix.value,
        this.formCreate.controls.isSetExpiration_Day.value,
        this.formCreate.controls.isSetAbortIncompleteMultipartUpload_Day.value,
        this.formCreate.controls.isSetNoncurrentVersionExpiration_Day.value
      );
    }

    for (let tag of tags) {
      if (tag.key.trim() === '') {
        return true;
      }
    }
    return false;
  }

  delelteTag(id: number, index: number) {
    this.listTag = this.listTag.filter((item) => item.id != id);
    this.listKeyError.splice(index, 1);
    this.checkTags(this.listTag);
    if (this.listTag?.length != 0) {
      this.lifecycleUpdate.isSetAbortIncompleteMultipartUpload_Day = false;
    }
  }

  isVisibleDelete: boolean = false;
  lifecycleDelete: BucketLifecycleCreate = new BucketLifecycleCreate();
  modalDelete(data: any) {
    this.isVisibleDelete = true;
    this.lifecycleDelete = data;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isLoadingDelete = true;
    this.bucketService
      .deleteBucketLifecycle(this.lifecycleDelete, this.region)
      .pipe(
        finalize(() => {
          this.isLoadingDelete = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.isVisibleDelete = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.lifeCycle.delete.success')
          );
          this.searchLifeCycle();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.lifeCycle.delete.fail')
          );
          this.cdr.detectChanges();
        },
      });
  }

  isVisibleUpdate = false;
  lifecycleUpdate: BucketLifecycleUpdate = new BucketLifecycleUpdate();
  modalUpdate(data: BucketLifecycle) {
    this.isVisibleUpdate = true;
    this.listKeyError = [];
    this.listTag = [];
    this.lifecycleUpdate.bucketName = data.bucketName;
    this.lifecycleUpdate.enabled = data.enabled;
    this.lifecycleUpdate.id = data.id;
    this.lifecycleUpdate.isSetAbortIncompleteMultipartUpload_Day =
      data.isSetAbortIncompleteMultipartUpload_Day;
    this.lifecycleUpdate.isSetExpiration_Day = data.isSetExpiration_Day;
    this.lifecycleUpdate.isSetNoncurrentVersionExpiration_Day =
      data.isSetNoncurrentVersionExpiration_Day;
    this.lifecycleUpdate.lifecycleRuleAbortIncompleteMultipartUpload_Day =
      data.lifecycleRuleAbortIncompleteMultipartUpload_Day;
    this.lifecycleUpdate.lifecycleRuleExpiration_Day =
      data.lifecycleRuleExpiration_Day;
    this.lifecycleUpdate.lifecycleRuleNoncurrentVersionExpiration_Day =
      data.lifecycleRuleNoncurrentVersionExpiration_Day;
    this.lifecycleUpdate.lifecycleTagPredicate = data.lifecycleTagPredicate;
    this.lifecycleUpdate.prefix = data.prefix;
    this.formUpdate.controls.isSetExpiration_Day.setValue(
      this.lifecycleUpdate.isSetExpiration_Day
    );
    this.formUpdate.controls.isSetAbortIncompleteMultipartUpload_Day.setValue(
      this.lifecycleUpdate.isSetAbortIncompleteMultipartUpload_Day
    );
    this.formUpdate.controls.isSetNoncurrentVersionExpiration_Day.setValue(
      this.lifecycleUpdate.isSetNoncurrentVersionExpiration_Day
    );
    let idTag = 0;
    this.lifecycleUpdate.lifecycleTagPredicate.forEach((e) => {
      let newtag: Tag = new Tag();
      newtag.id = idTag++;
      newtag.key = e.metaKey;
      newtag.value = e.metaValue;
      this.listTag.push(newtag);
    });
  }

  handleCancelUpdate() {
    this.isVisibleUpdate = false;
    this.listTag = [];
  }

  handleOkUpdate() {
    let hasKeyNull = this.checkTags(this.listTag);
    this.listKeyError = [];
    if (hasKeyNull) {
      this.listTag.forEach((e) => {
        if (e.key.trim() == '') {
          this.listKeyError.push(true);
        } else {
          this.listKeyError.push(false);
        }
      });
    } else {
      this.isLoadingUpdate = true;
      this.lifecycleUpdate.prefix = this.lifecycleUpdate.prefix?.trim();
      this.lifecycleUpdate.lifecycleTagPredicate = [];
      this.listTag.forEach((e) => {
        let lifecycleTagPredicate: LifecycleTagPredicate =
          new LifecycleTagPredicate();
        if (e.key != '') {
          lifecycleTagPredicate.metaKey = e.key.trim();
        }
        lifecycleTagPredicate.metaValue = e.value.trim();
        this.lifecycleUpdate.lifecycleTagPredicate.push(lifecycleTagPredicate);
      });
      this.bucketService
        .updateBucketLifecycle(this.lifecycleUpdate, this.region)
        .pipe(
          finalize(() => {
            this.isLoadingUpdate = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (data) => {
            this.isVisibleUpdate = false;
            this.searchLifeCycle();
            this.listTag = [];
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.lifeCycle.edit.success')
            );
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.lifeCycle.edit.fail')
            );
            this.cdr.detectChanges();
          },
        });
    }
  }

  changeIsSetExpiration_Day() {
    if (
      this.lifecycleUpdate.isSetExpiration_Day &&
      this.lifecycleUpdate.lifecycleRuleExpiration_Day == 0
    ) {
      this.lifecycleUpdate.lifecycleRuleExpiration_Day = 1;
      this.cdr.detectChanges();
    }
  }

  changeSetNoncurrentVersionExpiration_Day() {
    if (
      this.lifecycleUpdate.isSetNoncurrentVersionExpiration_Day &&
      this.lifecycleUpdate.lifecycleRuleNoncurrentVersionExpiration_Day == 0
    ) {
      this.lifecycleUpdate.lifecycleRuleNoncurrentVersionExpiration_Day = 1;
      this.cdr.detectChanges();
    }
  }

  changeSetAbortIncompleteMultipartUpload_Day() {
    if (
      this.lifecycleUpdate.isSetAbortIncompleteMultipartUpload_Day &&
      this.lifecycleUpdate.lifecycleRuleAbortIncompleteMultipartUpload_Day == 0
    ) {
      this.lifecycleUpdate.lifecycleRuleAbortIncompleteMultipartUpload_Day = 1;
      this.cdr.detectChanges();
    }
  }
}
