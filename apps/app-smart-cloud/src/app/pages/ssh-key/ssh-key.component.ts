import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {SshKeyService} from 'src/app/pages/ssh-key/ssh-key.service';
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {SshKey} from './dto/ssh-key';
import {ModalHelper} from '@delon/theme';
import { NzModalService} from 'ng-zorro-antd/modal';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppValidator} from "../../../../../../libs/common-utils/src";
import {RegionModel} from "../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {ProjectModel} from "../../shared/models/project.model";

interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}


@Component({
  selector: 'one-portal-ssh-key',
  templateUrl: './ssh-key.component.html',
  styleUrls: ['./ssh-key.component.less'],
})
export class SshKeyComponent implements OnInit{
  listOfData: SshKey[] = [];
  checkEmpty: SshKey[] = [];
  isBegin: Boolean = false;
  data: SshKey;
  size = 10;
  index: number = 0;
  total: number = 0;
  baseResponse: BaseResponse<SshKey[]>;
  checked = false;
  loading = false;
  indeterminate = false;
  isVisible = false;
  isVisibleCreate = false;
  isVisibleDetail = false;
  searchKey:string = "";
  customIcon: SafeResourceUrl;
  regionId: number;
  projectId: number;
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '1000px',
  };

  constructor(private sshKeyService: SshKeyService, private mh: ModalHelper, private modal: NzModalService,
  @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private sanitizer: DomSanitizer) {
    this.customIcon = this.sanitizer.bypassSecurityTrustResourceUrl('./assets/begin-ssh.png');
  }

  onPageSizeChange(event: any) {
    this.size = event
    this.getSshKeys();
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getSshKeys();
  }

  ngOnInit() {
    this.getSshKeys();
    this.form.get('keypair_name_2').disable();
    this.form.get('public_key').disable();
  }

  getSshKeys(): void {
     this.sshKeyService.getSshKeys(this.tokenService.get()?.userId, this.projectId, this.regionId, this.index, this.size, this.searchKey)
      .subscribe(response => {
        this.listOfData = response.records,
          this.total = response.totalCount,
          this.index = response.currentPage
      });

    this.sshKeyService.getSshKeys(this.tokenService.get()?.userId, this.projectId, this.regionId, 0, 1, "")
      .subscribe(resonse => {
        this.checkEmpty = resonse.records
        if (this.checkEmpty == undefined || this.checkEmpty == null || this.checkEmpty.length < 1) {
          this.isBegin = true;
        } else {
          this.isBegin = false;
        }
      })
  }

  //SEARCH
  search(search: string) {
    this.searchKey = search;
    this.getSshKeys();
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
    this.isVisible = true;
  }

  handleOk(number: any): void {
    // call api
    this.sshKeyService.deleteSshKey(this.data.id).subscribe(()=> {this.getSshKeys();});
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked')
    this.isVisible = false;
    this.isVisibleCreate = false;
    this.isVisibleDetail = false;
  }

  indexTab: number = 0;

  handleCreate(): void {
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

    this.sshKeyService.createSshKey(ax).subscribe(()=> {this.getSshKeys();});
    // call api
    this.isVisibleCreate = false;
  }

  onTabchange(event: any) {
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
    this.regionId = region.regionId;
    this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.getSshKeys();
  }
}
