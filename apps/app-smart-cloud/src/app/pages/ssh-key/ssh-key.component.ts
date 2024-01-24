import {Component, Inject, OnInit} from '@angular/core';
import {SshKeyService} from 'src/app/pages/ssh-key/ssh-key.service';
import {AppValidator, BaseResponse} from "../../../../../../libs/common-utils/src";
import {SshKey} from './dto/ssh-key';
import {ModalHelper} from '@delon/theme';
import {NzModalService} from 'ng-zorro-antd/modal';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RegionModel} from "../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ProjectModel} from "../../shared/models/project.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {finalize} from "rxjs/operators";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-ssh-key',
  templateUrl: './ssh-key.component.html',
  styleUrls: ['./ssh-key.component.less'],
})
export class SshKeyComponent implements OnInit {
  //input
  searchKey: string = "";
  regionId: any;
  projectId: any;
  size = 10;
  index: any = 0;
  total: any = 0;

  //output
  baseResponse: BaseResponse<SshKey[]>;
  listOfData: SshKey[] = [];
  checkEmpty: SshKey[] = [];
  data: SshKey;

  //flag
  isBegin: Boolean = false;
  checked = false;
  isVisibleDelete = false;
  isVisibleCreate = false;
  isVisibleDetail = false;

  //resource
  loading = false;
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '1000px',
  };

  constructor(private sshKeyService: SshKeyService, private mh: ModalHelper, private modal: NzModalService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private notification: NzNotificationService) {
  }

  onPageSizeChange(event: any) {
    this.size = event
    this.loadSshKeys(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.loadSshKeys(false);
  }

  ngOnInit() {
    // this.loadSshKeys();
    this.form.get('keypair_name_2').disable();
    this.form.get('public_key').disable();
  }

  loadSshKeys(isCheckBegin: boolean): void {
    this.loading = true;
    this.sshKeyService.getSshKeys(this.tokenService.get()?.userId, this.projectId, this.regionId, this.index, this.size, this.searchKey)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
        this.listOfData = (this.checkNullObject(response) ? [] : response.records);
          this.total = (this.checkNullObject(response) ? 0 : response.totalCount);
          this.index = (this.checkNullObject(response) ? 0 : response.currentPage);
          if (isCheckBegin) {
            this.isBegin = this.checkNullObject(this.listOfData) || this.listOfData.length < 1 ? true : false;
            this.refreshParams();
          }
      });

  }

  //SEARCH
  search(search: string) {
    this.searchKey = search;
    this.loadSshKeys(false);
  }

  //DELETE
  deleteKey(key: SshKey) {
    this.data = key;
    console.log("delete" + key)
    this.showModal()
  }

  //CREATE
  createKey() {
    this.isVisibleCreate = true;
  }

  //DETAIL
  detailKey(data: SshKey) {
    this.isVisibleDetail = true;
    this.data = data;
  }

  // show modal
  showModal(): void {
    this.isVisibleDelete = true;
  }

  handleDelete(number: any): void {
    this.loading = true;
    // call api
    this.sshKeyService.deleteSshKey(this.data.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => {
      this.loadSshKeys(true);
      this.notification.success('Thành công', 'Xóa thành công keypair')
    });
    this.isVisibleDelete = false;
  }

  handleCancel(form: any): void {
    console.log('Button cancel clicked')
    this.isVisibleDelete = false;
    this.isVisibleCreate = false;
    this.isVisibleDetail = false;
    form.resetForm();
  }

  indexTab: number = 0;

  handleCreate(form: any): void {
    this.loading = true;
    let namePrivate: string;
    let publickey: string = "";

    if (this.indexTab === 0) {
      namePrivate = this.form.controls['keypair_name_1'].value;
    } else {
      namePrivate = this.form.controls['keypair_name_2'].value;
      publickey = this.form.controls['public_key'].value;
    }

    const ax = {
      name: namePrivate,
      vpcId: this.projectId,
      customerId: this.tokenService.get()?.userId,
      regionId: this.regionId,
      publicKey: publickey,
    }

    this.sshKeyService.createSshKey(ax)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
      next: post => {
        this.loadSshKeys(true);
        this.notification.success('Thành công', 'Tạo mới thành công keypair')
      },
      error: e => {
        this.loadSshKeys(true);
        this.notification.error('Thất bại', 'Tạo mới thất bại keypair')
      },
    });
    this.isVisibleCreate = false;
    form.resetForm();
  }

  onTabchange(event: any, form: any) {
    this.indexTab = event;
    if (this.indexTab === 0) {
      this.form.get('keypair_name_1').enable();
      this.form.get('keypair_name_2').disable();
      this.form.get('public_key').disable();
    } else {
      this.form.get('keypair_name_1').disable();
      this.form.get('keypair_name_2').enable();
      this.form.get('public_key').enable();
    }

    form.resetForm();
  }

  form = new FormGroup({
    keypair_name_1: new FormControl('', {validators: [Validators.required, AppValidator.validKeypairName]}),
    keypair_name_2: new FormControl('', {validators: [Validators.required, AppValidator.validKeypairName]}),
    public_key: new FormControl('', {validators: [Validators.required]}),
  });

  submitForm(): void {
    console.log("submitForm")
  }

  onRegionChange(region: RegionModel) {
    this.regionId = this.checkNullObject(region) ? "" : region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId =  this.checkNullObject(project) ? "" : project.id;
    this.loadSshKeys(true);
  }

  checkNullObject(object: any): Boolean {
    if (object == null || object == undefined) {
      return true;
    }

    return false;
  }

  refreshParams() {
    this.searchKey = '';
    this.size = 10;
    this.index = 0;
  }
}
