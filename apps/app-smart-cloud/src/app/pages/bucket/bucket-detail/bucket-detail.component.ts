import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { addDays, differenceInCalendarDays, setHours } from 'date-fns';
import * as JSZip from 'jszip';
import mime from 'mime';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzUploadFile } from 'ng-zorro-antd/upload/interface';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, debounceTime, finalize, map } from 'rxjs/operators';
import { BaseService } from 'src/app/shared/services/base.service';
import { ObjectObjectStorageModel } from '../../../shared/models/object-storage.model';
import { BucketService } from '../../../shared/services/bucket.service';
import { ObjectObjectStorageService } from '../../../shared/services/object-object-storage.service';
import { TimeCommon } from 'src/app/shared/utils/common';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { LoadingService } from '@delon/abc/loading';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { FOLDER_NAME_REGEX } from 'src/app/shared/constants/constants';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-bucket-detail',
  templateUrl: './bucket-detail.component.html',
  styleUrls: ['./bucket-detail.component.less'],
})
export class BucketDetailComponent extends BaseService implements OnInit {
  listOfData: ObjectObjectStorageModel[];
  region = JSON.parse(localStorage.getItem('regionId'));
  listOfDataVersioning: ObjectObjectStorageModel[];
  dataAction: ObjectObjectStorageModel;
  listOfFolder: any = [];
  listOfFolderCopy: any = [];
  currentKey = '';
  date: Date = new Date();
  orderMetadata = 0;
  defaultMetadata = { metaKey: '', metaValue: '' };
  listOfMetadata: any = [];
  bucket: any;
  size = 5;
  pageSizeFixed = 5
  index: number = 1;
  total: number = 0;
  loading = false;
  loadingVersion = false;
  orderNum = 1;
  isVisibleFilter = false;
  isVisibleCreateFolder = false;
  isVisibleUploadFile = false;
  isVisibleAddFilte = true;
  emptyFileUpload = true;
  isVisibleCopy = false;
  isVisibleShare = false;
  isVisiblePermission = false;
  isVisibleDetail = false;
  isVisibleDelete = false;
  isVisibleVersioning = false;
  isVisibleDeleteVersion = false;
  isVisibleRestoreVersion = false;
  isLoadingCopy = false;
  isUpload = false;
  folderChange: string;
  modalStyle = {
    padding: '20px',
    'border-radius': '10px',
    width: '80%',
  };
  uploadFailed: boolean = false;

  lstFileUpdate: NzUploadFile[] = [];
  isLoadingDeleteObjects: boolean = false;
  searchDelay = new Subject<boolean>();

  setOfCheckedId = new Set<string>();
  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)],
    }),
  });
  radioValue: any = 'public-read';
  radioValue1: any = 'Private';
  checked = false;
  indeterminate = false;
  countObjectSelected = 0;
  nameFolder = '';
  value = '';
  pageSize: number;
  pageIndex: number;
  treeFolder = [];
  linkShare = '';
  today = new Date();
  timeDefaultValue = setHours(new Date(), 0);
  dateShare = new Date();
  nextDay: Date = this.getNextDay();
  versionId: string;
  private: any;
  percent = 0;
  keyName: string;
  isLoadingGetLink: boolean = false;
  isVisibleDeleteObject: boolean = false;
  usage: string;
  activePrivate = true;
  filterQuery: string = '';
  listFile = [];
  hostNameUrl = window.location.origin;

  isLoadingCreateFolder: boolean = false;
  isLoadingAuthorize: boolean = false;
  isLoadingDeleteObject: boolean = false;
  isLoadingDeleteVersion: boolean = false;
  isLoadingRestoreVersion: boolean = false;
  isClickCopy: boolean = false;

  countSuccessUpload: number = 0;
  constructor(
    private service: ObjectObjectStorageService,
    private objectSevice: ObjectStorageService,
    private bucketservice: BucketService,
    private activatedRoute: ActivatedRoute,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
    private clipboard: Clipboard,
    private modalService: NzModalService,
    private fb: NonNullableFormBuilder,
    private loadingSrv: LoadingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    super(tokenService);
  }

  formCreateFolder: FormGroup<{
    folderName: FormControl<string>;
  }> = this.fb.group({
    folderName: [
      '',
      [Validators.required, Validators.pattern(FOLDER_NAME_REGEX)],
    ],
  });

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.nextDay) < 0;
  };

  // Disable previous times only for the current day
  disabledDateTime: DisabledTimeFn = () => {
    const selectedDate = this.nextDay;
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds();

    if (differenceInCalendarDays(selectedDate, currentDate) === 0) {
      return {
        nzDisabledHours: () => this.range(0, currentHour),
        nzDisabledMinutes: () =>
          selectedDate.getHours() === currentHour
            ? this.range(0, currentMinute)
            : [],
        nzDisabledSeconds: () =>
          selectedDate.getHours() === currentHour &&
          selectedDate.getMinutes() === currentMinute
            ? this.range(0, currentSecond)
            : [],
      };
    } else {
      // If selected date is not today, no time restrictions
      return {
        nzDisabledHours: () => [],
        nzDisabledMinutes: () => [],
        nzDisabledSeconds: () => [],
      };
    }
  };

  search(search: string) {
    this.value = search.trim();
    this.loadData();
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.getUsageOfBucket();
    this.loadBucket();
    this.loadData();
    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.loadData();
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.checked = false;
    this.setOfCheckedId.clear();
    this.countObjectSelected = 0;
    this.loadData();
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.checked = false;
    this.setOfCheckedId.clear();
    this.countObjectSelected = 0;
    this.loadData();
  }

  openFilter() {
    this.isVisibleFilter = true;
  }

  handleCancel() {
    this.isVisibleFilter = false;
    this.isVisibleCopy = false;
    this.isVisibleDetail = false;
    this.isVisibleDelete = false;
    this.isVisibleVersioning = false;
    this.isClickCopy = false;
    this.listOfFolderCopy = [];
  }

  handleCancelShareFile() {
    this.isVisibleShare = false;
    this.dateShare = new Date();
    this.linkShare = '';
  }

  getUsageOfBucket() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.objectSevice
      .getUsageOfBucket(
        this.activatedRoute.snapshot.paramMap.get('name'),
        this.region
      )
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          console.log(data);

          this.usage = data;
        },
        error: (e) => {
          // this.notification.error(
          //   this.i18n.fanyi('app.status.fail'),
          //   this.i18n.fanyi('app.bucket.getObject.fail')
          // );
        },
      });
  }

  getNextDay(): Date {
    let nextDay = new Date(this.dateShare);
    nextDay.setDate(this.dateShare.getDate() + 1);
    return nextDay;
  }

  toFolder1(item: any, isBucket) {
    if (isBucket) {
      this.listOfFolder = [];
      this.currentKey = '';
      this.loadData();
    } else {
      let index = this.listOfFolder.findIndex(
        (folder) => folder.key == item.key
      );
      if (index >= 0) {
        this.currentKey = item.key;
        this.loadData();
        this.listOfFolder.splice(index + 1);
      }
    }
  }

  handleCancelCreateFolder() {
    this.isVisibleCreateFolder = false;
    this.formCreateFolder.reset();
  }

  createFolder() {
    this.isLoadingCreateFolder = true;
    let data = {
      bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
      folderName: this.currentKey + this.nameFolder,
      regionId: this.region,
    };
    this.service
      .createFolder(data)
      .pipe(
        finalize(() => {
          this.isLoadingCreateFolder = false;
        })
      )
      .subscribe(
        () => {
          this.isVisibleCreateFolder = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.detail.createFolder.name.success')
          );
          this.formCreateFolder.reset()
          this.loadData();
        },
        (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.detail.createFolder.name.fail')
          );
        }
      );
  }

  handleChange({ file, fileList }: NzUploadChangeParam) {
    let newFiles = fileList.filter(
      (item) =>
        !this.lstFileUpdate.some(
          (existingItem) => existingItem.name === item.name
        )
    );

    if (newFiles.length === 0) {
      return;
    }

    // Add new files to lstFileUpdate
    this.lstFileUpdate = [...this.lstFileUpdate, ...newFiles];

    this.emptyFileUpload = false;
  }

  removeFile(item: NzUploadFile) {
    if (item.isUpload && item.isUpload === true && item.uploadId) {
      let dataError = {
        bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
        key: this.currentKey + item.name,
        uploadId: item.uploadId,
        regionId: this.region,
      };
      const modal: NzModalRef = this.modalService.create({
        nzTitle: this.i18n.fanyi('app.bucket.detail.deleteFile'),
        nzContent: this.i18n.fanyi('app.bucket.detail.deleteFile.alert'),
        nzFooter: [
          {
            label: this.i18n.fanyi('app.button.cancel'),
            type: 'default',
            onClick: () => modal.destroy(),
          },
          {
            label: this.i18n.fanyi('app.button.confirm'),
            type: 'primary',
            onClick: () => {
              this.service.abortmultipart(dataError).subscribe(
                (data) => {
                  let index = this.lstFileUpdate.findIndex(
                    (file) => file.uid === item.uid
                  );
                  if (index >= 0) {
                    this.lstFileUpdate.splice(index, 1);
                    this.countSuccessUpload -= 1;
                  }
                  this.notification.success(
                    this.i18n.fanyi('app.status.success'),
                    this.i18n.fanyi('app.bucket.detail.deleteFile.success')
                  );
                },
                (error) => {
                  console.log(error);
                }
              );
              modal.destroy();
            },
          },
        ],
      });
    } else {
      let index = this.lstFileUpdate.findIndex((file) => file.uid === item.uid);
      if (index >= 0) {
        this.lstFileUpdate.splice(index, 1);
        this.countSuccessUpload -= 1;
      }
      this.notification.success(
        this.i18n.fanyi('app.status.success'),
        this.i18n.fanyi('app.bucket.detail.deleteFile.success')
      );
    }
  }

  updateCheckedSet(checked: boolean, key: any): void {
    if (checked) {
      this.setOfCheckedId.add(key);
    } else {
      this.setOfCheckedId.delete(key);
    }
  }

  refreshCheckedStatus(): void {
    for (let item of this.listOfData) {
      item.checked = this.setOfCheckedId.has(item.key);
      item.indeterminate = this.setOfCheckedId.has(item.key) && !item.checked;
    }

    this.countObjectSelected = this.setOfCheckedId.size;
  }

  onItemChecked(key: any, checked: boolean) {
    this.updateCheckedSet(checked, key);
    this.refreshCheckedStatus();
  }

  onAllChecked(isAddAll: boolean): void {
    this.listOfData.forEach((item) => this.updateCheckedSet(isAddAll, item));
    this.refreshCheckedStatus();
  }

  loadData() {
    this.loading = true;
    this.service
      .getData(
        this.activatedRoute.snapshot.paramMap.get('name'),
        this.currentKey + this.value.trim(),
        this.filterQuery,
        this.tokenService.get()?.userId,
        this.region,
        this.size,
        this.index
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadFolder(this.currentKey);
        })
      )
      .subscribe((data) => {
        this.pageSize = data.paginationObjectList.pageSize;
        this.pageIndex = data.paginationObjectList.draw;
        this.listOfData = data.paginationObjectList.items;
        this.listOfData.map((item) => {
          item.keyName = item.key.split('/').pop();
          if (item.objectType == 'object') {
            item.objectType = mime.getType(item.keyName) || 'object';
          }
        });
        this.total = data.paginationObjectList.totalItems;
      });
  }

  private loadBucket() {
    this.bucketservice
      .getBucketDetail(
        this.activatedRoute.snapshot.paramMap.get('name'),
        this.region
      )
      .subscribe((data) => {
        this.bucket = data;
        this.cdr.detectChanges()
        if (data == undefined || data == null) {
          this.notification.error(this.i18n.fanyi("app.status.fail"),this.i18n.fanyi("app.record.not.found"))
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
        }
      },
        error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"),error.error.message)
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
        });
  }

  addMoreMetadata() {
    let defaultValue = { ...this.defaultMetadata };
    this.listOfMetadata.push(defaultValue);
  }

  handleChange2({ file, fileList }: NzUploadChangeParam) {
    this.lstFileUpdate.push(file);
  }

  removeMetadata(key: any) {
    const index = this.listOfMetadata.findIndex((item) => item.metaKey == key);
    if (index >= 0) {
      this.listOfMetadata.splice(index, 1);
    }
  }

  deleteFolder() {
    this.isLoadingDeleteObject = true;
    let data = {
      bucketName: this.dataAction.bucketName,
      selectedItems: [this.dataAction],
      regionId: this.region,
    };
    this.service
      .deleteObject(data)
      .pipe(
        finalize(() => {
          this.isLoadingDeleteObject = false;
        })
      )
      .subscribe(
        () => {
          this.isVisibleDelete = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.detail.deleteObject.success')
          );

          if (this.listOfData.length >= 1 && this.index > 1) {
            this.index = this.index - 1;
          }
          this.loadData();
        },
        (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.detail.deleteObject.fail')
          );
        }
      );
  }

  doAction(action: any, item: ObjectObjectStorageModel) {
    this.dataAction = item;

    if (action == 1) {
      this.isVisiblePermission = true;
      if (item.isPublic) {
        this.activePrivate = false;
        this.radioValue1 = 'Public';
      } else {
        this.activePrivate = true;
        this.radioValue1 = 'Private';
      }
    } else if (action == 2) {
      this.isVisibleCopy = true;
      this.loadTreeFolder();
    } else if (action == 3) {
      //download
      this.downloadFile('');
    } else if (action == 4) {
      this.isVisibleDetail = true;
    } else if (action == 5) {
      this.isVisibleDelete = true;
    } else if (action == 6) {
      this.isVisibleShare = true;
      this.getLinkShare(this.nextDay);
    } else if (action == 7) {
      this.isVisibleVersioning = true;
      this.loadDataVersion();
    }
  }

  doActionVersion(action: any, item: ObjectObjectStorageModel) {
    this.versionId = item.versionId;
    if (action == 1) {
      this.downloadFile(item.versionId);
    } else if (action == 2) {
      this.isVisibleRestoreVersion = true;
    } else if (action == 3) {
      this.isVisibleDeleteVersion = true;
    }
  }

  activeRow: any;

  // Helper method to find parent bucket of a given folder
  findParentBucket(folderKey: string): any {
    for (let bucket of this.treeFolder) {
      if (
        bucket.bucketTreeData.some(
          (folder: any) => folder.folderKey === folderKey
        )
      ) {
        return bucket;
      }
    }
    return null;
  }

  // Updated method to handle folder clicks and find the parent bucket
  toFolder(event: any, parent: any) {
    this.isClickCopy = true;
    this.activeRow = event;

    if (parent) {
      this.listOfFolderCopy = [
        { name: parent.bucketName, key: parent.bucketName },
        { name: event.folderName, key: event.folderKey },
      ];
    } else {
      // Find the parent bucket of the clicked folder
      const parentBucket = this.findParentBucket(event.folderKey);
      if (parentBucket) {
        this.listOfFolderCopy = [
          { name: parentBucket.bucketName, key: parentBucket.bucketName },
          { name: event.folderName, key: event.folderKey },
        ];
      } else {
        this.listOfFolderCopy = [
          { name: event.bucketName, key: event.bucketName },
        ];
      }
    }

    this.folderChange = event.folderKey || event.bucketName;
  }

  isActive(item: any): boolean {
    return this.activeRow === item;
  }

  downloadFile(versionId: any) {
    this.service
      .downloadFile(
        this.dataAction.bucketName,
        this.dataAction.key,
        versionId,
        this.region
      )
      .subscribe(
        (data) => {
          console.log(data);

          let anchor = document.createElement('a');
          let objectUrl = window.URL.createObjectURL(data['body']);

          anchor.href = objectUrl;
          anchor.download = this.dataAction.key;
          anchor.click();
          window.URL.revokeObjectURL(objectUrl);
          // this.triggerDownload(data);
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  private loadTreeFolder() {
    const data = {
      customerId: 0,
      regionId: this.region,
      bucketName: '',
      isAllBucket: true,
    };
    this.service.GetBucketTreeData(data).subscribe((data) => {
      this.treeFolder = data;
      console.log(this.treeFolder);
    });
  }

  copyFolder() {
    this.isLoadingCopy = true;

    let destinationKey = '';
    let destinationBucket = '';

    if (this.folderChange.includes('/')) {
      const separatorIndex = this.folderChange.indexOf('/');
      destinationBucket = this.folderChange.substring(0, separatorIndex);
      if (destinationBucket === this.dataAction.bucketName) {
        console.log(this.dataAction.key);
        if (this.dataAction.key.includes('/')) {
          let keyPath = this.dataAction.key.split('/')[1];
          destinationKey =
            this.folderChange.substring(separatorIndex + 1) + keyPath;
        } else {
          destinationKey =
            this.folderChange.substring(separatorIndex + 1) +
            this.dataAction.key;
        }
      } else {
        console.log(this.dataAction.key);
        if (this.dataAction.key.includes('/')) {
          let keyPath = this.dataAction.key.split('/')[1];
          destinationKey =
            this.folderChange.substring(separatorIndex + 1) + keyPath;
        } else {
          destinationKey =
            this.folderChange.substring(separatorIndex + 1) +
            this.dataAction.key;
        }
      }
    } else {
      destinationBucket = this.folderChange;
      if (destinationBucket === this.dataAction.bucketName) {
        destinationKey = '';
      } else {
        destinationKey = this.dataAction.key;
      }
    }

    const sourcePath = `${this.dataAction.bucketName}/${this.dataAction.key}`;
    const destinationPath = `${destinationBucket}/${destinationKey}`;

    if (sourcePath === destinationPath) {
      this.isLoadingCopy = false;
      this.notification.error(
        this.i18n.fanyi('app.status.fail'),
        'Không thể copy object đến chính thư mục của nó'
      );
      return;
    }

    const data = {
      sourceKey: this.dataAction.key,
      sourceBucket: this.dataAction.bucketName,
      destinationKey: destinationKey,
      destinationBucket: destinationBucket,
      regionId: this.region,
    };

    this.service
      .copyProject(data)
      .pipe(
        finalize(() => {
          this.isLoadingCopy = false;
          this.isClickCopy = false;
          this.listOfFolderCopy = [];
          this.loadData();
        })
      )
      .subscribe(
        () => {
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.detail.copy.success')
          );
          this.isVisibleCopy = false;
        },
        (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.detail.copy.fail')
          );
        }
      );
  }

  copyUrl() {
    this.clipboard.copy(this.dataAction.url);
  }

  editPermission() {
    this.isLoadingAuthorize = true;
    if (
      (this.dataAction.isPublic == true && this.activePrivate == true) ||
      (this.dataAction.isPublic == false && this.activePrivate == false)
    ) {
      this.service
        .editPermission(
          this.dataAction.bucketName,
          this.dataAction.key,
          this.activePrivate == true ? 'private' : 'public',
          this.region
        )
        .pipe(
          finalize(() => {
            this.isLoadingAuthorize = false;
          })
        )
        .subscribe(
          () => {
            this.isVisiblePermission = false;
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.bucket.detail.authorize.success')
            );
            this.loadData();
          },
          (error) => {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.detail.authorize.fail')
            );
          }
        );
    }
  }

  handleShare() {
    this.clipboard.copy(this.linkShare);
    this.notification.success(
      this.i18n.fanyi('app.status.success'),
      this.i18n.fanyi('app.bucket.detail.sharelink.success')
    );
    this.isVisibleShare = false;
    this.linkShare = '';
  }

  getLinkShare(event) {
    this.isLoadingGetLink = true;
    let data = {
      bucketName: this.dataAction.bucketName,
      key: this.dataAction.key,
      validTo: event,
      isDownload: true,
      regionId: this.region,
    };
    this.service.getLinkShare(data).subscribe((data) => {
      this.isLoadingGetLink = false;
      this.linkShare = data.publicURL;
    });
  }

  private loadDataVersion() {
    this.loadingVersion = true;
    let data = {
      bucketName: this.dataAction.bucketName,
      key: this.dataAction.key,
      regionId: this.region,
    };
    this.service
      .loadDataVersion(data)
      .pipe(
        finalize(() => {
          this.loadingVersion = false;
        })
      )
      .subscribe((data) => {
        this.listOfDataVersioning = data;
      });
  }

  deleteFolderVersion() {
    this.isLoadingDeleteVersion = true;
    let data = {
      bucketName: this.dataAction.bucketName,
      objectType: this.dataAction.objectType,
      key: this.dataAction.key,
      versionId: this.versionId,
      deleteAllVersions: false,
      regionId: this.region,
    };
    this.service
      .deleteObjectSimple(data)
      .pipe(
        finalize(() => {
          this.isVisibleDeleteVersion = false;
          this.isLoadingDeleteVersion = false;
        })
      )
      .subscribe(
        () => {
          this.isVisibleDeleteVersion = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.detail.deleteVerision.success')
          );
          this.loadDataVersion();
          this.loadData();
        },
        (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.detail.deleteVerision.fail')
          );
        }
      );
  }

  restoreObjectVersion() {
    this.isLoadingRestoreVersion = true;
    let data = {
      bucketName: this.dataAction.bucketName,
      key: this.dataAction.key,
      versionId: this.versionId,
      regionId: this.region,
    };
    this.service
      .restoreObject(data)
      .pipe(
        finalize(() => {
          this.isLoadingRestoreVersion = false;
        })
      )
      .subscribe(
        () => {
          this.isVisibleRestoreVersion = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.bucket.detail.restoreVerision.success')
          );
          this.loadDataVersion();
          this.loadData();
        },
        (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.bucket.detail.restoreVerision.fail')
          );
        }
      );
  }

  selectPermisstion(number: number) {
    this.activePrivate = number == 1 ? true : false;
  }

  private loadFolder(data: any) {
    if (data != '') {
      let folder = {
        key: data,
        name: data,
      };

      let lstFolderName = data.split('/');
      if (lstFolderName.length > 1) {
        folder.name = lstFolderName[lstFolderName.length - 2];
      }

      let index = this.listOfFolder.findIndex((folder) => folder.key == data);
      if (index == -1) {
        this.listOfFolder.push(folder);
        this.currentKey = folder.key;
      }
    }
  }

  toFolder2(s: string) {
    this.currentKey = s;

    this.loadData();
  }

  uploadAllFile() {
    const filesToUpload = this.lstFileUpdate.filter((item) => !item.isUpload);

    console.log(filesToUpload);

    if (filesToUpload.length == 0) {
      this.notification.warning(
        this.i18n.fanyi('app.status.warning'),
        this.i18n.fanyi('app.bucket.detail.uploadFile.warning')
      );
    } else {
      const uploadNextFile = (index) => {
        if (index < filesToUpload.length) {
          const item = filesToUpload[index];
          item.percent = 0;
          this.uploadSingleFile(item).then(() => {
            uploadNextFile(index + 1);
          });
        }
      };

      uploadNextFile(0);
    }
  }

  uploadSingleFile(item) {
    if (item.isUpload) {
      this.notification.warning(
        this.i18n.fanyi('app.status.warning'),
        this.i18n.fanyi('app.bucket.detail.uploadFile.warning1')
      );
      return Promise.resolve();
    }
    var chunkCounter = 0;
    const chunkSize = 10000000; // 10MB
    let startTime;
    if (item.size > 10000000) {
      return new Promise<void>((resolve, reject) => {
        item.isUpload = true;
        let start;

        var uploadPartsArray = [];

        let orderData = [];
        let upload_id;
        start = 0;
        chunkCounter = 0;
        var chunkEnd = start + chunkSize;
        var numberofChunks = Math.ceil(item.size / chunkSize);
        var params = {
          bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
          key: this.currentKey + item.name,
          metadata: this.listOfMetadata,
          acl: this.radioValue,
          regionId: this.region,
        };

        this.service.createMultiPartUpload(params).subscribe(
          (data) => {
            upload_id = data.data;
            item.uploadId = data.data;
            createChunk(start);
          },
          (error) => {
            console.log(error);
          }
        );

        const createChunk = (start) => {
          chunkCounter++;
          chunkEnd = Math.min(start + chunkSize, item.size);

          const blob = item.originFileObj.slice(start, chunkEnd);
          //created the chunk, now upload iit

          uploadChunk(blob, start, chunkCounter);
        };

        const completemultipart = () => {
          let data = {
            bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
            key: this.currentKey + item.name,
            uploadId: upload_id,
            partETags: uploadPartsArray,
            modal: uploadPartsArray,
            regionId: this.region,
          };

          const xhr = new XMLHttpRequest();
          xhr.open(
            'POST',
            this.baseUrl +
              this.ENDPOINT.provisions +
              '/object-storage/CompleteMultipartUpload',
            true
          );
          xhr.setRequestHeader(
            'Authorization',
            'Bearer ' + this.tokenService.get()?.token
          );
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.upload.onprogress = (event) => {
            var totalPercentComplete = Math.round(
              (chunkCounter / numberofChunks) * 100
            );
            console.log(totalPercentComplete);

            if (event.lengthComputable) {
              item.percentage = Math.round(
                (event.loaded / event.total) * totalPercentComplete
              );
            }
          };
          xhr.onload = () => {
            if (xhr.status === 200) {
              this.notification.success(
                this.i18n.fanyi('app.status.success'),
                this.i18n.fanyi('app.bucket.detail.uploadFile.success')
              );
              this.countSuccessUpload += 1;
              this.loadData();
              resolve();
            } else {
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                this.i18n.fanyi('app.bucket.detail.uploadFile.fail')
              );
              reject();
            }
          };

          xhr.onerror = () => {
            item.uploaded = false;
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.detail.uploadFile.fail')
            );
            reject();
          };

          xhr.send(JSON.stringify(data));
        };

        const uploadChunk = (blob, start, index) => {
          let data = {
            bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
            key: this.currentKey + item.name,
            partNumber: index.toString(),
            uploadId: upload_id,
            expiryTime: addDays(new Date(), 1),
            urlOrigin: this.hostNameUrl,
            regionId: this.region,
          };

          this.service.getSignedUrl(data).subscribe(
            (responseData) => {
              const presignedUrl = responseData.url;
              orderData.push({
                presignedUrl: presignedUrl,
                index: index,
              });
              const xhr = new XMLHttpRequest();
              xhr.open('PUT', presignedUrl, true);
              xhr.upload.onprogress = (event) => {
                var totalPercentComplete = Math.round(
                  ((chunkCounter - 1) / numberofChunks) * 100
                );

                if (event.lengthComputable) {
                  item.percentage = Math.round(totalPercentComplete);
                }
              };
              xhr.onload = () => {
                uploadPartsArray.push({
                  PartNumber: index,
                  ETag: xhr
                    .getResponseHeader('ETag')
                    .replace(/[|&;$%@@"<>()+,]/g, ''),
                });

                //next chunk starts at + chunkSize from start
                start += chunkSize;

                //if start is smaller than file size - we have more to still upload
                if (start < item.size) {
                  //create the new chunk
                  createChunk(start);
                } else {
                  completemultipart();
                }
              };
              xhr.onerror = () => {
                this.notification.error(
                  this.i18n.fanyi('app.status.fail'),
                  this.i18n.fanyi('app.bucket.detail.uploadFile.fail')
                );
                this.uploadFailed = true;
                item.percentage = 100;
                let dataError = {
                  bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
                  key: this.currentKey + item.name,
                  uploadId: upload_id,
                };
                this.service.abortmultipart(dataError).subscribe(
                  (data) => {
                    console.log(data);
                  },
                  (error) => {
                    console.log(error);
                  }
                );
                reject();
              };
              xhr.send(blob);
            },
            (error) => {
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                this.i18n.fanyi('app.bucket.detail.uploadFile.fail')
              );
            }
          );
        };
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        item.isUpload = true;
        console.log(item);

        let data = {
          bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
          key: this.currentKey + item.name,
          expiryTime: addDays(this.date, 1),
          urlOrigin: this.hostNameUrl,
          regionId: this.region,
          ACL: this.radioValue,
        };
        this.service.getSignedUrl(data).subscribe(
          (responseData) => {
            const presignedUrl = responseData.url;
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignedUrl, true);
            xhr.setRequestHeader('x-amz-acl', this.radioValue);
            startTime = new Date();
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const currentTime = new Date();
                const timeDiff =
                  (currentTime.getTime() - startTime.getTime()) / 1000; // Time in seconds
                const speed = event.loaded / timeDiff / 1024;
                item.percentage = Math.round(
                  (event.loaded / event.total) * 100
                );
                item.speed = speed.toFixed(2); // Display speed
                console.log(`Upload speed: ${speed.toFixed(2)} KB/s`);
              }
            };
            xhr.onload = () => {
              item.isUpload = true;
              this.notification.success(
                this.i18n.fanyi('app.status.success'),
                this.i18n.fanyi('app.bucket.detail.uploadFile.success')
              );
              this.loadData();
              this.countSuccessUpload += 1;
              resolve();
            };
            xhr.onerror = () => {
              item.isUpload = false;
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                this.i18n.fanyi('app.bucket.detail.uploadFile.fail')
              );
              reject();
            };
            xhr.send(item.originFileObj);
          },
          (error) => {
            item.isUpload = false;
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.bucket.detail.uploadFile.fail')
            );
            reject();
          }
        );
      });
    }
  }

  handleCancelUploadFile() {
    this.lstFileUpdate = [];
    this.listOfMetadata = [];
    this.countSuccessUpload = 0;
    this.radioValue = 'public-read';
    this.isVisibleUploadFile = false;
    this.emptyFileUpload = true;
  }

  downloadZipFile() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    let date = mm + '_' + dd + '_' + yyyy;

    let zipFile = new JSZip();
    let downloadObservables = [];

    this.setOfCheckedId.forEach((item: any) => {
      if (item.objectType === 'folder') {
        return;
      } else {
        downloadObservables.push(
          this.service
            .downloadFile(this.bucket.bucketName, item.key, '', this.region)
            .pipe(
              map((fileData: any) => {
                const fileName = item.key;
                const fileContent = fileData.body;

                console.log(fileData.body);

                if (fileData.body !== undefined) {
                  zipFile.file(fileName, fileContent);
                }
              }),
              catchError((error) => {
                console.error(`Error downloading file: ${error}`);
                return of(null);
              })
            )
        );
      }
    });

    forkJoin(downloadObservables).subscribe(() => {
      zipFile.generateAsync({ type: 'blob' }).then((content) => {
        if (content.size > 104857600) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.alert.bucket.oversize')
          );
        } else {
          let anchor = document.createElement('a');
          let objectUrl = window.URL.createObjectURL(content);

          anchor.href = objectUrl;
          anchor.download = `${this.bucket.bucketName}_${date}`;
          anchor.click();
          window.URL.revokeObjectURL(objectUrl);
        }
      });
    });
  }

  showModalDeleteObject() {
    this.isVisibleDeleteObject = true;
  }

  handleCancelDeleteObject() {
    this.isVisibleDeleteObject = false;
  }

  handledeleteObjects() {
    this.isLoadingDeleteObjects = true;
    let data = {
      bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
      customerId: this.tokenService.get()?.userId,
      regionId: 0,
      selectedItems: [...this.setOfCheckedId],
    };

    this.service.deleteObject(data).subscribe(
      (data) => {
        this.isVisibleDeleteObject = false;
        this.isLoadingDeleteObjects = false;
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          this.i18n.fanyi('app.bucket.detail.deleteObject.success')
        );
        this.checked = false;
        this.setOfCheckedId.clear();
        this.countObjectSelected = 0;
        if (this.listOfData.length >= 1 && this.index > 1) {
          this.index = this.index - 1;
        }
        this.loadData();
      },
      (error) => {
        this.isLoadingDeleteObjects = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.bucket.detail.deleteObject.fail')
        );
      }
    );
  }

  navigateToBucketList() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }
}
