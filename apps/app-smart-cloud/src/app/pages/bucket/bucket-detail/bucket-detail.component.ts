import {Component, Inject, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NzUploadChangeParam} from "ng-zorro-antd/upload";
import {ObjectObjectStorageService} from "../../../shared/services/object-object-storage.service";
import {ObjectObjectStorageModel} from "../../../shared/models/object-storage.model";
import {ActivatedRoute} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BucketService} from "../../../shared/services/bucket.service";
import {NzUploadFile} from "ng-zorro-antd/upload/interface";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'one-portal-bucket-detail',
  templateUrl: './bucket-detail.component.html',
  styleUrls: ['./bucket-detail.component.less'],
})
export class BucketDetailComponent implements OnInit {

  listOfData: ObjectObjectStorageModel[];
  dataAction: ObjectObjectStorageModel;
  listOfFolder: any = [
    {name: "folder1", id: "1"},
    {name: "folder2", id: "2"},
    {name: "folder3", id: "3"},
    {name: "folder4", id: "4"},
    {name: "folder5", id: "5"},
  ];

  orderMetadata = 0;
  defaultMetadata = {order:1,key: "", value: ""};
  listOfMetadata: any = []
  bucket: any;
  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
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

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '80%',
  };

  lstFileUpdate : NzUploadFile[];

  listOfFilter: any;
  colReal = ['Tên', 'Thời gian chỉnh sửa', 'Dung lượng',]
  conditionNameReal = ['Bằng', 'Bao gồm', 'Bắt đầu', 'Kêt thức',]
  conditionTimeReal = ['Lớn hơn', 'Nhỏ hơn',]
  conditionCapacityReal = ['Lớn hơn', 'Nhỏ hơn',]
  capMoreTypeReal = ['Bytes', 'KB', 'MB', 'GB']
  capLessTypeReal = ['Bytes', 'KB', 'MB', 'GB']
  defaultDataFilter = {orderNum: 1, name: '', condition: '', value: '', type: '',};
  dataFilter = [{orderNum: 0, name: '', condition: '', value: '', type: '',}]
  dataFilterLog = [{orderNum: 0, name: '', condition: '', value: '', type: '',}];

  setOfCheckedId = new Set<string>();
  form = new FormGroup({
    name: new FormControl('', {validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/),]}),
  });

  version = 1;
  radioValue: any = 'Public';
  checked = false;
  indeterminate = false;
  countObjectSelected = 0;
  nameFolder = '';

  treeFolder = [
    {
      name: "bucket1",
      child: [
        {
          name: "folder2",
          child: [
            {
              name: "folder4",
              child: []
            },
            {
              name: "folder5",
              child: []
            },
          ]
        },
        {
          name: "folder3",
          child: []
        }
      ]
    },
    {
      name: "bucketSon",
      child: [
        {
          name: "folderSon",
          child: []
        }
      ]
    }
  ]

  constructor(
    private service: ObjectObjectStorageService,
    private bucketservice: BucketService,
    private activatedRoute: ActivatedRoute,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
  ) {
  }

  ngOnInit(): void {
    this.loadBucket();
    this.loadData('');
  }

  uploadFile() {

  }

  onPageSizeChange(event: any) {
    this.size = event
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
  }

  selectCol(item: any, event: any) {
    const filteredItems = this.dataFilter.filter(item => item.name == event);
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
    let indexLog = this.dataFilterLog.findIndex(itemModel => itemModel.orderNum === item.orderNum);
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
      const filteredItems = this.dataFilter.filter(item => item.condition == event && item.name == 'Dung lượng');
      if (filteredItems.length >= 4) {
        this.removeFromListString(this.conditionCapacityReal, event);
      }
    }

    let indexLog = this.dataFilterLog.findIndex(item => item.orderNum === orderNum);
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
    const index: number = listData.findIndex(item => item == string);
    if (index != -1) {
      listData.splice(index, 1);
    }
  }

  addtoListString(listData: any, string: any) {
    if (string != '') {
      const index: number = listData.findIndex(item => item == string);
      if (index == -1) {
        listData.push(string);
      }
    }
  }

  deleteFilter(string: any) {
    const index: number = this.dataFilter.findIndex(item => item.orderNum == string);
    if (index != -1) {
      let data = Object.assign({}, this.dataFilter[index]);
      this.addToReality(data)
      this.dataFilter.splice(index, 1);
      if (this.dataFilter.length < 14) {
        this.isVisibleAddFilte = true;
      }
    }
  }

  addOldFilterToReality() {

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
    return new Promise(resolve => setTimeout(resolve, number));
  }

  toFolder(item: any) {
    let index = this.listOfFolder.findIndex(folder => folder.name == item.name);
    if (index > 0) {
      this.listOfFolder.splice(index + 1);
    }
  }

  createFolder() {
    this.isVisibleCreateFolder = false;
    let data = {
      bucketName: this.activatedRoute.snapshot.paramMap.get('name'),
      folderName: this.nameFolder
    }
    this.service.createFolder(data)
      .pipe(finalize(() => {
        this.loadData('');
      }))
      .subscribe(
        () =>{
          this.notification.success('Thành công', '`Thêm folder thành công')
        },
        error => {
          this.notification.error('Thất bại', 'Thêm folder thất bại')
        }
      );
  }

  handleChange({file, fileList}: NzUploadChangeParam) {
    this.lstFileUpdate = [...fileList];
    this.emptyFileUpload = false;
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
    } else if (status === 'error') {
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

  private loadData(folderName : any) {
    this.service.getData(this.activatedRoute.snapshot.paramMap.get('name'), folderName, '', this.tokenService.get()?.userId, '', this.size, this.index)
      .subscribe(data => {
        this.listOfData = data.paginationObjectList.items;
        this.total = data.paginationObjectList.totalItems;
      })
  }

  private loadBucket() {
    this.bucketservice.getBucketDetail(this.activatedRoute.snapshot.paramMap.get('name'))
      .subscribe(
        data => {
          this.bucket = data;
        }
      )
  }

  search(searck : any) {

  }

  removeFile(item: NzUploadFile) {
    let index = this.lstFileUpdate.findIndex(file => file.name == item.name && file.size == item.size);
    if (index >= 0) {
      this.lstFileUpdate.splice(index, 1);
    }
  }

  addMoreMetadata() {
    let defaultValue = {...this.defaultMetadata};
    defaultValue.order = this.orderMetadata++;
    this.listOfMetadata.push(defaultValue);
  }

  handleChange2({file, fileList}: NzUploadChangeParam) {
    this.lstFileUpdate.push(file);
  }

  removeMetadata(order: any) {
    const index = this.listOfMetadata.findIndex(item => item.order == order);
    if (index >= 0) {
      this.listOfMetadata.splice(index, 1);
    }
  }

  deleteFolder() {

  }

  doAction(action: any, item: ObjectObjectStorageModel) {
    this.dataAction = item;
    if (action == 1) {

    } else if (action == 2) {
      this.isVisibleCopy = true;
    } else if (action == 3) {

    } else if (action == 4) {

    } else if (action == 5) {

    } else if (action == 6) {

    }
  }
}
