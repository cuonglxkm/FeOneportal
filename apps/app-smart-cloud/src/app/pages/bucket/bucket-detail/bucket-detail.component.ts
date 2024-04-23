import { Component, Inject, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { ObjectObjectStorageService } from '../../../shared/services/object-object-storage.service';
import { ObjectObjectStorageModel } from '../../../shared/models/object-storage.model';
import { ActivatedRoute } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BucketService } from '../../../shared/services/bucket.service';
import { NzUploadFile } from 'ng-zorro-antd/upload/interface';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { addDays, differenceInCalendarDays, setHours } from 'date-fns';
import { DisabledTimeFn, DisabledTimePartial } from 'ng-zorro-antd/date-picker';
import {
  HttpClient,
  HttpRequest,
  HttpHeaders,
  HttpResponse,
  HttpEventType,
} from '@angular/common/http';

@Component({
  selector: 'one-portal-bucket-detail',
  templateUrl: './bucket-detail.component.html',
  styleUrls: ['./bucket-detail.component.less'],
})
export class BucketDetailComponent implements OnInit {
  listOfData: ObjectObjectStorageModel[];
  listOfDataVersioning: ObjectObjectStorageModel[];
  dataAction: ObjectObjectStorageModel;
  listOfFolder: any = [];
  currentKey = '';
  date: Date = new Date();
  orderMetadata = 0;
  defaultMetadata = { order: 1, key: '', value: '' };
  listOfMetadata: any = [];
  bucket: any;
  size = 10;
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
  folderChange: string;
  modalStyle = {
    padding: '20px',
    'border-radius': '10px',
    width: '80%',
  };

  lstFileUpdate: NzUploadFile[] = [];

  listOfFilter: any;
  colReal = ['Tên', 'Thời gian chỉnh sửa', 'Dung lượng'];
  conditionNameReal = ['Bằng', 'Bao gồm', 'Bắt đầu', 'Kêt thức'];
  conditionTimeReal = ['Lớn hơn', 'Nhỏ hơn'];
  conditionCapacityReal = ['Lớn hơn', 'Nhỏ hơn'];
  capMoreTypeReal = ['Bytes', 'KB', 'MB', 'GB'];
  capLessTypeReal = ['Bytes', 'KB', 'MB', 'GB'];
  defaultDataFilter = {
    orderNum: 1,
    name: '',
    condition: '',
    value: '',
    type: '',
  };
  dataFilter = [{ orderNum: 0, name: '', condition: '', value: '', type: '' }];
  dataFilterLog = [
    { orderNum: 0, name: '', condition: '', value: '', type: '' },
  ];

  setOfCheckedId = new Set<string>();
  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)],
    }),
  });
  radioValue: any = 'Public';
  radioValue1: any = 'Private';
  checked = false;
  indeterminate = false;
  countObjectSelected = 0;
  nameFolder = '';
  folderNameLike = '';

  treeFolder = [];
  linkShare = '';
  today = new Date();
  timeDefaultValue = setHours(new Date(), 0);
  dateShare: any;
  versionId: string;
  private: any;

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate = (current: Date): boolean =>
    differenceInCalendarDays(current, this.today) > 0;
  disabledDateTime: DisabledTimeFn = () => ({
    nzDisabledHours: () => this.range(0, 24).splice(4, 20),
    nzDisabledMinutes: () => this.range(30, 60),
    nzDisabledSeconds: () => [55, 56],
  });
  activePrivate = true;

  constructor(
    private service: ObjectObjectStorageService,
    private bucketservice: BucketService,
    private activatedRoute: ActivatedRoute,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private clipboard: Clipboard,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadBucket();
    this.loadData();
  }

  onPageSizeChange(event: any) {
    this.size = event;
    // this.getData(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    // this.getData(false);
  }

  openFilter() {
    this.isVisibleFilter = true;
  }

  handleCancel() {
    this.isVisibleFilter = false;
    this.isVisibleCopy = false;
    this.isVisibleDetail = false;
    this.isVisibleDelete = false;
    this.isVisibleShare = false;
    this.isVisibleVersioning = false;
  }

  selectCol(item: any, event: any) {
    const filteredItems = this.dataFilter.filter((item) => item.name == event);
    if (event == 'Tên') {
      if (filteredItems.length >= 4) {
        this.removeFromListString(this.colReal, event);
      }
    } else if (event == 'Thời gian chỉnh sửa') {
      if (filteredItems.length >= 2) {
        this.removeFromListString(this.colReal, event);
      }
    } else if (event == 'Dung lượng') {
      if (filteredItems.length >= 8) {
        this.removeFromListString(this.colReal, event);
      }
    }
    this.clearData(item);
    let indexLog = this.dataFilterLog.findIndex(
      (itemModel) => itemModel.orderNum === item.orderNum
    );
    if (indexLog != -1) {
      const dataLog = this.dataFilterLog[indexLog];
      if (dataLog.name != '' && dataLog.name != event) {
        this.addToReality(dataLog);
      }
    }

    this.dataFilterLog = JSON.parse(JSON.stringify(this.dataFilter));
  }

  selectCondition(orderNum: any, index: number, event: any) {
    if (index == 1) {
      this.removeFromListString(this.conditionNameReal, event);
      if (this.conditionNameReal.length == 0) {
        this.removeFromListString(this.colReal, 'Tên');
      }
    } else if (index == 2) {
      this.removeFromListString(this.conditionTimeReal, event);
      if (this.conditionTimeReal.length == 0) {
        this.removeFromListString(this.colReal, 'Thời gian chỉnh sửa');
      }
    } else if (index == 3) {
      const filteredItems = this.dataFilter.filter(
        (item) => item.condition == event && item.name == 'Dung lượng'
      );
      if (filteredItems.length >= 4) {
        this.removeFromListString(this.conditionCapacityReal, event);
      }
    }

    let indexLog = this.dataFilterLog.findIndex(
      (item) => item.orderNum === orderNum
    );
    const dataLog = this.dataFilterLog[indexLog];
    if (dataLog.condition != '' && dataLog.condition != event) {
      this.addToReality(dataLog);
    }

    Promise.resolve().then(() => {
      this.dataFilterLog = JSON.parse(JSON.stringify(this.dataFilter));
    });
  }

  selectType(condition: string, event: any) {
    if (condition == 'Lớn hơn') {
      this.removeFromListString(this.capMoreTypeReal, event);
    } else if (condition == 'Nhỏ hơn') {
      this.removeFromListString(this.capLessTypeReal, event);
    }
  }

  removeFromListString(listData: any, string: any) {
    const index: number = listData.findIndex((item) => item == string);
    if (index != -1) {
      listData.splice(index, 1);
    }
  }

  addtoListString(listData: any, string: any) {
    if (string != '') {
      const index: number = listData.findIndex((item) => item == string);
      if (index == -1) {
        listData.push(string);
      }
    }
  }

  deleteFilter(string: any) {
    const index: number = this.dataFilter.findIndex(
      (item) => item.orderNum == string
    );
    if (index != -1) {
      let data = Object.assign({}, this.dataFilter[index]);
      this.addToReality(data);
      this.dataFilter.splice(index, 1);
      if (this.dataFilter.length < 14) {
        this.isVisibleAddFilte = true;
      }
    }
  }

  addToReality(data: any) {
    this.addtoListString(this.colReal, data.name);
    if (data.name == 'Tên') {
      this.addtoListString(this.conditionNameReal, data.condition);
    } else if (data.name == 'Thời gian chỉnh sửa') {
      this.addtoListString(this.conditionTimeReal, data.condition);
    } else if (data.name == 'Dung lượng') {
      this.addtoListString(this.conditionCapacityReal, data.condition);
      if (data.type != '' && data.condition == 'Lớn hơn') {
        this.addtoListString(this.capMoreTypeReal, data.type);
      } else if (data.type != '' && data.condition == 'Nhỏ hơn') {
        this.addtoListString(this.capLessTypeReal, data.type);
      }
    }
  }

  addFilter() {
    let filter = Object.assign({}, this.defaultDataFilter);
    filter.orderNum = this.orderNum++;
    this.dataFilter.push(filter);
    if (this.dataFilter.length >= 14) {
      this.isVisibleAddFilte = false;
    }
  }

  private clearData(item: any) {
    item.condition = '';
    item.value = '';
    item.type = '';
  }

  private async delay(number: number) {
    return new Promise((resolve) => setTimeout(resolve, number));
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

  createFolder() {
    this.isVisibleCreateFolder = false;
    let data = {
      bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
      folderName: this.currentKey + this.nameFolder,
    };
    this.service
      .createFolder(data)
      .pipe(
        finalize(() => {
          this.loadData();
        })
      )
      .subscribe(
        () => {
          this.notification.success('Thành công', '`Thêm folder thành công');
        },
        (error) => {
          this.notification.error('Thất bại', 'Thêm folder thất bại');
        }
      );
  }

  handleChange({ file, fileList }: NzUploadChangeParam) {
    this.lstFileUpdate = [
      ...this.lstFileUpdate,
      ...fileList.filter(
        (item) =>
          !this.lstFileUpdate.find(
            (existingItem) => existingItem.uid === item.uid
          )
      ),
    ];

    this.emptyFileUpload = false;
  }

  removeFile(item: NzUploadFile) {
    let index = this.lstFileUpdate.findIndex((file) => file.uid === item.uid);
    if (index >= 0) {
      this.lstFileUpdate.splice(index, 1);
    }
  }

  updateCheckedSet(checked: boolean, key: string): void {
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
    for (let item of this.listOfData) {
      this.updateCheckedSet(isAddAll, item.key);
    }
    this.refreshCheckedStatus();
  }

  loadData() {
    this.loading = true;
    this.service
      .getData(
        this.activatedRoute.snapshot.paramMap.get('name'),
        this.currentKey + this.folderNameLike,
        '',
        this.tokenService.get()?.userId,
        '',
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
        this.listOfData = data.paginationObjectList.items;
        this.total = data.paginationObjectList.totalItems;
      });
  }

  private loadBucket() {
    this.bucketservice
      .getBucketDetail(this.activatedRoute.snapshot.paramMap.get('name'))
      .subscribe((data) => {
        this.bucket = data;
      });
  }

  addMoreMetadata() {
    let defaultValue = { ...this.defaultMetadata };
    defaultValue.order = this.orderMetadata++;
    this.listOfMetadata.push(defaultValue);
  }

  handleChange2({ file, fileList }: NzUploadChangeParam) {
    this.lstFileUpdate.push(file);
  }

  removeMetadata(order: any) {
    const index = this.listOfMetadata.findIndex((item) => item.order == order);
    if (index >= 0) {
      this.listOfMetadata.splice(index, 1);
    }
  }

  deleteFolder() {
    this.isVisibleDelete = false;
    let data = {
      bucketName: this.dataAction.bucketName,
      selectedItems: [this.dataAction],
    };
    this.service
      .deleteObject(data)
      .pipe(
        finalize(() => {
          this.loadData();
        })
      )
      .subscribe(
        () => {
          this.notification.success('Thành công', '`Xóa thành công');
        },
        (error) => {
          this.notification.error('Thất bại', 'Xóa thất bại');
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

  toFolder(event: any) {
    if (event.folderKey != undefined) {
      this.folderChange = event.folderKey;
    } else {
      this.folderChange = event.bucketName;
    }
  }

  downloadFile(versionId: any) {
    this.service
      .downloadFile(this.dataAction.bucketName, this.dataAction.key, versionId)
      .subscribe(
        (data) => {
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
      regionId: 0,
      bucketName: '',
      isAllBucket: true,
    };
    this.service.GetBucketTreeData(data).subscribe((data) => {
      this.treeFolder = data;
    });
  }

  copyFolder() {
    this.isVisibleCopy = false;
    let destinationKey = '';
    let destinationBucket = '';
    if (this.folderChange.includes('/')) {
      const separatorIndex = this.folderChange.indexOf('/');
      destinationBucket = this.folderChange.substring(0, separatorIndex);
      destinationKey = this.folderChange.substring(separatorIndex + 1);
    } else {
      destinationBucket = this.folderChange;
    }
    const data = {
      sourceKey: this.dataAction.key,
      sourceBucket: this.dataAction.bucketName,
      destinationKey: destinationKey,
      destinationBucket: destinationBucket,
    };

    this.service
      .copyProject(data)
      .pipe(
        finalize(() => {
          this.loadData();
        })
      )
      .subscribe(
        () => {
          this.notification.success('Thành công', '`Sao chép thành công');
        },
        (error) => {
          this.notification.error('Thất bại', 'Sao chép thất bại');
        }
      );
  }

  copyUrl() {
    this.clipboard.copy(this.dataAction.url);
  }

  editPermission() {
    this.isVisiblePermission = false;
    if (
      (this.dataAction.isPublic == true && this.activePrivate == true) ||
      (this.dataAction.isPublic == false && this.activePrivate == false)
    ) {
      this.service
        .editPermission(
          this.dataAction.bucketName,
          this.dataAction.key,
          this.activePrivate == true ? 'private' : 'public'
        )
        .pipe(
          finalize(() => {
            this.loadData();
          })
        )
        .subscribe(
          () => {
            this.notification.success('Thành công', 'Phân quyền thành công');
          },
          (error) => {
            this.notification.error('Thất bại', 'Phân quyền thất bại');
          }
        );
    }
  }

  handleShare() {
    this.clipboard.copy(this.linkShare);
  }

  getLinkShare() {
    let data = {
      bucketName: this.dataAction.bucketName,
      key: this.dataAction.key,
      validTo: this.dateShare,
      isDownload: true,
    };
    this.service.getLinkShare(data).subscribe((data) => {
      this.linkShare = data.publicURL;
    });
  }

  private loadDataVersion() {
    this.loadingVersion = true;
    let data = {
      bucketName: this.dataAction.bucketName,
      key: this.dataAction.key,
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
    this.isVisibleDeleteVersion = false;
    let data = {
      bucketName: this.dataAction.bucketName,
      objectType: this.dataAction.objectType,
      key: this.dataAction.key,
      versionId: this.versionId,
      deleteAllVersions: false,
    };
    this.service
      .deleteObjectSimple(data)
      .pipe(
        finalize(() => {
          this.loadDataVersion();
          this.loadData();
        })
      )
      .subscribe(
        () => {
          this.notification.success('Thành công', '`Xóa phiên bản thành công');
        },
        (error) => {
          this.notification.error('Thất bại', 'Xóa phiên bản thất bại');
        }
      );
  }

  restoreObjectVersion() {
    this.isVisibleRestoreVersion = false;
    let data = {
      bucketName: this.dataAction.bucketName,
      key: this.dataAction.key,
      versionId: this.versionId,
    };
    this.service
      .restoreObject(data)
      .pipe(
        finalize(() => {
          this.loadDataVersion();
          this.loadData();
        })
      )
      .subscribe(
        () => {
          this.notification.success('Thành công', '`Khôi phục bản thành công');
        },
        (error) => {
          this.notification.error('Thất bại', 'Khôi phục phiên bản thất bại');
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

  uploadSingleFile(item) {
    let data = {
      customerId: 3,
      bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
      key: item.name,
      expiryTime: addDays(this.date, 1),
      awsAccessKey: '1ISW11XYDRQR5D81IO3F',
      awsSecretKey: 'ksFcZG7CB1PDdH5XPpsz5qCTimeXsC6OrpB7A6AA',
      urlOrigin: 'https://s3.onsmartcloud.com/',
    };
    console.log(item.originFileObj);
    this.service.getSignedUrl(data).subscribe(
      (responseData) => {
        const presignedUrl = responseData.trim();
        const req = new HttpRequest('PUT', presignedUrl, item, {
          reportProgress: true,
          responseType: 'text',
          headers: new HttpHeaders().set('Content-Type', item.type),
        });
      },
      (error) => {
        const presignedUrl = error.error.text;
        const headers = {
          'Content-Type': item.type,
        };
        this.http.put(presignedUrl, item.originFileObj, { headers })
          .subscribe(
            (response) => {
              console.log(item.name + 'video uploaded successfully');
            },
            (error) => {
              console.error('There was an error!', error);
            });
      }
    );
  }

  uploadAllFile() {
    console.log(this.lstFileUpdate);

    this.lstFileUpdate.forEach((item) => {
      this.uploadSingleFile(item);
    });
  }
  uploadFile() {}
}
