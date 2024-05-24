import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  BucketLifecycle,
  BucketLifecycleCreate,
  LifecycleTagPredicate,
} from 'src/app/shared/models/bucket.model';
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
  listLifecycle: BucketLifecycle[] = [];
  loading: boolean = true;

  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
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
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.lifeCycle.get.fail')
          );
        },
      });
  }

  isVisibleCreate = false;
  lifecycleCreate: BucketLifecycleCreate = new BucketLifecycleCreate();
  modalCreate() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.lifecycleCreate.bucketName = this.bucketName;
    this.listTag.forEach((e) => {
      let lifecycleTagPredicate: LifecycleTagPredicate =
        new LifecycleTagPredicate();
      lifecycleTagPredicate.metaKey = e.key;
      lifecycleTagPredicate.metaValue = e.value;
      this.lifecycleCreate.lifecycleTagPredicate.push(lifecycleTagPredicate);
    });
    this.bucketService.createBucketLifecycle(this.lifecycleCreate).subscribe({
      next: (data) => {
        this.searchLifeCycle();
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.lifeCycle.create.success'));
      },
      error: (e) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.lifeCycle.create.fail')
        );
      },
    });
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
  lifecycleDelete: BucketLifecycleCreate = new BucketLifecycleCreate();
  modalDelete(data: any) {
    this.isVisibleDelete = true;
    this.lifecycleDelete = data;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;

    this.bucketService.deleteBucketLifecycle(this.lifecycleDelete).subscribe({
      next: (data) => {
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.lifeCycle.delete.success'));
        this.searchLifeCycle();
      },
      error: (error) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.lifeCycle.delete.fail')
        );
      },
    });
  }

  isVisibleUpdate = false;
  lifecycleUpdate: BucketLifecycleCreate = new BucketLifecycleCreate();
  modalUpdate(data: any) {
    this.isVisibleUpdate = true;
    this.listTag = [];
    this.lifecycleUpdate = data;
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
  }

  handleOkUpdate() {
    this.isVisibleUpdate = false;
    this.lifecycleUpdate.bucketName = this.bucketName;
    this.lifecycleUpdate.lifecycleTagPredicate = [];
    this.listTag.forEach((e) => {
      let lifecycleTagPredicate: LifecycleTagPredicate =
        new LifecycleTagPredicate();
      lifecycleTagPredicate.metaKey = e.key;
      lifecycleTagPredicate.metaValue = e.value;
      this.lifecycleUpdate.lifecycleTagPredicate.push(lifecycleTagPredicate);
    });
    this.bucketService.updateBucketLifecycle(this.lifecycleUpdate).subscribe({
      next: (data) => {
        this.searchLifeCycle();
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.lifeCycle.edit.success'));
      },
      error: (e) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.lifeCycle.edit.fail')
        );
      },
    });
  }
}
