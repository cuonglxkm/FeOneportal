import {Component, Inject, OnInit} from '@angular/core';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ObjectObjectStorageService} from "../../../shared/services/object-object-storage.service";
import {Clipboard} from '@angular/cdk/clipboard';
import {finalize} from "rxjs/operators";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {SubUserService} from "../../../shared/services/sub-user.service";
import {isThisHour} from "date-fns";
import {pipe} from "rxjs";

@Component({
  selector: 'one-portal-s3-key',
  templateUrl: './s3-key.component.html',
  styleUrls: ['./s3-key.component.less'],
})
export class S3KeyComponent implements OnInit {

  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
  listOfS3Key: any;
  count = 1;
  isVisibleDelete = false;
  isVisibleUplicate = false;
  key: any;
  isVisibleCreate = false;
  userCreate: any;
  loadingDropdown: any;
  disableDropdown: any;
  listUser: any;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private service: ObjectObjectStorageService,
              private clipboard: Clipboard,
              private notification: NzNotificationService,
              private subUserService: SubUserService) {
  }

  ngOnInit(): void {
    this.getData('');
  }

  search(value: string) {

  }

  createS3Key() {
    this.isVisibleCreate = true;
    this.loadingDropdown = true;
    this.disableDropdown = true;
    this.subUserService.getListSubUser(99999, 1)
      .pipe(finalize(() => {
        this.loadingDropdown = false;
        this.disableDropdown = false;
      }))
      .subscribe(data => {
        this.listUser =  data.records;
      })
  }

  onPageSizeChange(event: any) {
    this.size = event
  }

  onPageIndexChange(event: any) {
    this.index = event;
  }


  private getData(key: any) {
    this.service.getDataS3Key(key, this.index, this.size)
      .subscribe(data => {
        this.total = data.totalCount;
        this.listOfS3Key = data.records;
      })
  }

  copyText(secretKey: any) {
    this.clipboard.copy(secretKey);
  }

  deleteSecretKey() {
    let data = {
      access_key: this.key,
    }
    this.service.deleteS3key(data)
      .pipe(finalize(() => {
        this.getData('');
      }))
      .subscribe(
        {
          next: post => {
            this.notification.success('Thành công', 'Xóa thành công SecretKey')
          },
          error: e => {
            this.notification.error('Thất bại', 'Xóa thất bại SecretKey')
          },
        }
      )
    this.getData('')
    this.isVisibleDelete = false;
  }

  duplicateSecretKey() {

  }

  openModelDuplicate(key: any) {

  }

  openModelDelete(key: any) {
    this.isVisibleDelete = true;
    this.key = key;
  }

  createSecretKey() {

  }

  changeUser($event: boolean) {

  }
}
