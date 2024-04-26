import { Clipboard } from '@angular/cdk/clipboard';
import {
  HttpClient
} from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { addDays, differenceInCalendarDays, setHours } from 'date-fns';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzUploadFile } from 'ng-zorro-antd/upload/interface';
import { finalize } from 'rxjs/operators';
import { ObjectObjectStorageModel } from '../../../shared/models/object-storage.model';
import { BucketService } from '../../../shared/services/bucket.service';
import { ObjectObjectStorageService } from '../../../shared/services/object-object-storage.service';

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
  defaultMetadata = { metaKey: '', metaValue: '' };
  listOfMetadata: any = [];
  bucket: any;
  size = 5;
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
  uploadFailed: boolean = false

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
  radioValue: any = 'public-read';
  radioValue1: any = 'Private';
  checked = false;
  indeterminate = false;
  countObjectSelected = 0;
  nameFolder = '';
  folderNameLike = '';
  pageSize: number;
  pageIndex: number;
  treeFolder = [];
  linkShare = '';
  today = new Date();
  timeDefaultValue = setHours(new Date(), 0);
  dateShare: any;
  versionId: string;
  private: any;
  percent = 0;
  keyName: string;
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
    private http: HttpClient,
    private https: _HttpClient
  ) {}

  ngOnInit(): void {
    this.loadBucket();
    this.loadData();
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.loadData();
  }

  onPageIndexChange(event: any) {
    this.index = event;
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
        console.log(data);
        this.pageSize = data.paginationObjectList.pageSize;
        this.pageIndex = data.paginationObjectList.draw;
        this.listOfData = data.paginationObjectList.items;
        this.listOfData.map((item) => {
          item.keyName = item.key.split('/').pop();
        });
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
    this.listOfMetadata.push(defaultValue);
  }

  handleChange2({ file, fileList }: NzUploadChangeParam) {
    this.lstFileUpdate.push(file);
  }

  removeMetadata(key: any) {
    const index = this.listOfMetadata.findIndex((item) => item.key == key);
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

  uploadAllFile() {
    const filesToUpload = this.lstFileUpdate.filter((item) => !item.uploaded);

    const uploadNextFile = (index) => {
      if (index < filesToUpload.length) {
        const item = filesToUpload[index];
        item.percent = 0;
        this.uploadSingleFile(item).then(() => {
          item.uploaded = true;
          uploadNextFile(index + 1);
        });
      }
    };

    uploadNextFile(0);
  }

  uploadSingleFile(item) {
    if (item.uploaded) {
      return Promise.resolve();
    }
    var chunkCounter = 0;
    const chunkSize = 10000000; // 10MB
    console.log(item);

    if (item.size > 10000000) {
      return new Promise<void>((resolve, reject) => {
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
        };

        console.log(params);


        this.service.createMultiPartUpload(params).subscribe(
          (data) => {
            console.log(data);
            upload_id = data.data;
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
          };

          const xhr = new XMLHttpRequest();
          xhr.open(
            'POST',
            'https://api.onsmartcloud.com/provisions/object-storage/CompleteMultipartUpload',
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
              this.notification.success('Thành công', 'Upload thành công');
              this.loadData();
              resolve();
            } else {
              this.notification.error('Thất bại', 'Upload thất bại');
              reject();
            }
          };

          xhr.onerror = () => {
            this.notification.error('Thất bại', 'Upload thất bại');
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
            urlOrigin: 'https://oneportal.onsmartcloud.com',
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
                console.log(start);

                //if start is smaller than file size - we have more to still upload
                if (start < item.size) {
                  //create the new chunk
                  createChunk(start);
                } else {
                  completemultipart();
                }
              };
              xhr.onerror = () => {
                this.notification.error('Thất bại', 'Upload thất bại');
                this.uploadFailed = true
                item.percentage = 100
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
                reject()
              };
              xhr.send(blob);
            },
            (error) => {
              this.notification.error('Thất bại', 'Upload thất bại');
            }
          );
        };
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        let data = {
          bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
          key: this.currentKey + item.name,
          expiryTime: addDays(this.date, 1),
          urlOrigin: 'https://oneportal.onsmartcloud.com',
        };
        this.service.getSignedUrl(data).subscribe(
          (responseData) => {
            const presignedUrl = responseData.url;
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignedUrl, true);
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                item.percentage = Math.round(
                  (event.loaded / event.total) * 100
                );
              }
            };
            xhr.onload = () => {
              this.notification.success('Thành công', 'Upload thành công');
              this.loadData();
              resolve();
            };
            xhr.onerror = () => {
              this.notification.error('Thất bại', 'Upload thất bại');
              reject();
            };
            xhr.send(item.originFileObj);
          },
          (error) => {
            this.notification.error('Thất bại', 'Upload thất bại');
            reject();
          }
        );
      });
    }
  }

  handleCancelUploadFile() {
    this.lstFileUpdate = [];
    this.isVisibleUploadFile = false;
    this.emptyFileUpload = true;
  }

  uploadFile() {}
}
