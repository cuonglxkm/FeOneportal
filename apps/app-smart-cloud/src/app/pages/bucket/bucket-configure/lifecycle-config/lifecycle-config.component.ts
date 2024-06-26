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
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, finalize, Subject } from 'rxjs';
import {
  BucketLifecycle,
  BucketLifecycleCreate,
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
  loading: boolean = true;
  pageSize: number = 10;
  pageNumber: number = 1;
  total: number;
  isLoadingCreate: boolean = false;
  isLoadingUpdate: boolean = false;
  isLoadingDelete: boolean = false;
  searchDelay = new Subject<boolean>();
  region = JSON.parse(localStorage.getItem('regionId'));
  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.searchLifeCycle();
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {     
      this.searchLifeCycle();
    });
  }


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
          this.listLifecycle = data.records;
          console.log(this.listLifecycle);

          this.total = data.totalCount;
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

  search(search: string) {  
    this.value = search.trim();
    this.searchLifeCycle();
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
    this.isLoadingCreate = true
    this.lifecycleCreate.bucketName = this.bucketName;
    this.listTag.forEach((e) => {
      let lifecycleTagPredicate: LifecycleTagPredicate =
        new LifecycleTagPredicate();
      lifecycleTagPredicate.metaKey = e.key;
      lifecycleTagPredicate.metaValue = e.value;
      this.lifecycleCreate.lifecycleTagPredicate.push(lifecycleTagPredicate);
    });
    this.bucketService.createBucketLifecycle(this.lifecycleCreate, this.region).subscribe({
      next: (data) => {
        this.isVisibleCreate = false;
        this.isLoadingCreate = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.lifeCycle.create.success'));
        this.searchLifeCycle();
        this.cdr.detectChanges()
      },
      error: (e) => {
        this.isLoadingCreate = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.lifeCycle.create.fail')
        );
        this.cdr.detectChanges()
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
    this.isLoadingDelete = true
    this.bucketService.deleteBucketLifecycle(this.lifecycleDelete, this.region).subscribe({
      next: (data) => {
        this.isVisibleDelete = false;
        this.isLoadingDelete = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.lifeCycle.delete.success'));
        this.searchLifeCycle();
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.isLoadingDelete = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.lifeCycle.delete.fail')
        );
        this.cdr.detectChanges()
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
    this.isLoadingUpdate = true
    this.lifecycleUpdate.bucketName = this.bucketName;
    this.lifecycleUpdate.lifecycleTagPredicate = [];
    this.listTag.forEach((e) => {
      let lifecycleTagPredicate: LifecycleTagPredicate =
        new LifecycleTagPredicate();
      lifecycleTagPredicate.metaKey = e.key;
      lifecycleTagPredicate.metaValue = e.value;
      this.lifecycleUpdate.lifecycleTagPredicate.push(lifecycleTagPredicate);
    });
    this.bucketService.updateBucketLifecycle(this.lifecycleUpdate, this.region).subscribe({
      next: (data) => {
        this.isVisibleUpdate = false;
        this.isLoadingUpdate = false;
        this.searchLifeCycle();
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.lifeCycle.edit.success'));
        this.cdr.detectChanges()
      },
      error: (e) => {
        this.isLoadingUpdate = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.lifeCycle.edit.fail')
        );
        this.cdr.detectChanges()
      },
    });
  }
}
