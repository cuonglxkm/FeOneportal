import { Component, Inject, OnInit } from '@angular/core';
import { SshKeyService } from 'src/app/pages/ssh-key/ssh-key.service';
import { AppValidator, BaseResponse, RegionModel } from '../../../../../../libs/common-utils/src';
import { SshKey } from './dto/ssh-key';
import { ALAIN_I18N_TOKEN, ModalHelper } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { I18NService } from '@core';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from '../../shared/utils/common';

@Component({
  selector: 'one-portal-ssh-key',
  templateUrl: './ssh-key.component.html',
  styleUrls: ['./ssh-key.component.less']
})
export class SshKeyComponent implements OnInit {
  //input
  searchKey: string = '';
  regionId: any;
  size = 10;
  index: any = 1;
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
  searchDelay = new Subject<boolean>();

  //resource
  loading = false;
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '1000px'
  };

  constructor(private sshKeyService: SshKeyService, private mh: ModalHelper, private modal: NzModalService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private notification: NzNotificationService) {
  }

  onPageSizeChange(event: any) {
    this.size = event;
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
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.loadSshKeys(true);
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.loadSshKeys(false);
    });
  }

  loadSshKeys(isCheckBegin: boolean): void {
    this.loading = true;
    this.sshKeyService.getSshKeys(this.tokenService.get()?.userId, '', this.regionId, this.index, this.size, this.searchKey)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        response => {
          this.listOfData = (this.checkNullObject(response) ? [] : response.records);
          this.total = (this.checkNullObject(response) ? 0 : response.totalCount);
          if (isCheckBegin) {
            this.isBegin = this.checkNullObject(this.listOfData) || this.listOfData.length < 1 ? true : false;
            this.refreshParams();
          }
        },
        error => {
          this.listOfData = [];
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('keypair.notification.load.list.fail'));
        });

  }

  //SEARCH
  search(search: string) {
    this.searchKey = search;
    this.loadSshKeys(false);
  }

  nameDelete = '';

  //DELETE
  deleteKey(key: SshKey) {
    this.data = key;
    this.nameDelete = key.name;
    console.log('delete' + key);
    this.showModal();
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
    this.index = 1;
    this.loading = true;
    // call api
    this.sshKeyService.deleteSshKey(this.data.id)
      .pipe(finalize(() => {
        this.loading = false;
        this.handleCancel(null);
      }))
      .subscribe(
        data=> {
        this.loadSshKeys(true);
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('keypair.remove.success'));
      },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('keypair.remove.fail'));
        });
    this.isVisibleDelete = false;
  }

  handleCancel(form: any): void {
    this.isVisibleDelete = false;
    this.isVisibleCreate = false;
    this.isVisibleDetail = false;
    form?.resetForm();
    this.nameDeleteInput = '';
    this.onTabchange(0, form);
  }

  indexTab: number = 0;

  handleCreate(form: any): void {
    this.index = 1;
    this.loading = true;
    let namePrivate: string;
    let publickey: string = '';

    if (this.indexTab === 0) {
      namePrivate = this.form.controls['keypair_name_1'].value;
    } else {
      namePrivate = this.form.controls['keypair_name_2'].value;
      publickey = this.form.controls['public_key'].value;
    }

    const ax = {
      name: namePrivate,
      vpcId: 0,
      customerId: this.tokenService.get()?.userId,
      regionId: this.regionId,
      publicKey: publickey
    };

    this.sshKeyService.createSshKey(ax)
      .pipe(finalize(() => {
        this.loading = false;
        this.handleCancel(form);
      }))
      .subscribe({
        next: post => {
          this.loadSshKeys(true);
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('keypair.create.success'));
        },
        error: e => {
          if (e && e.error && e.error.detail && e.error.detail === `Key pair '${namePrivate}' already exists.`) {
            this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('keypair.create.fail.duplicatename', {namePrivate : namePrivate}));
          } else if (e && e.error && e.error.detail && e.error.detail === `Keypair data is invalid: failed to generate fingerprint`) {
            this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('keypair.create.fail.form'));
          } else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('keypair.create.fail'));
          }
        }
      });
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

    form?.resetForm();
  }

  form = new FormGroup({
    keypair_name_1: new FormControl('', { validators: [Validators.required, AppValidator.validKeypairName] }),
    keypair_name_2: new FormControl('', { validators: [Validators.required, AppValidator.validKeypairName] }),
    public_key: new FormControl('', { validators: [Validators.required] })
  });
  nameDeleteInput = '';

  submitForm(): void {
    console.log('submitForm');
  }

  onRegionChange(region: RegionModel) {
    this.regionId = this.checkNullObject(region) ? '' : region.regionId;
    this.loadSshKeys(true);
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
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
    this.index = 1;
  }

  fontSize = 16;

  enterCreate(form: any) {
    if (this.indexTab === 0 && this.form.controls['keypair_name_1'].value != '' && !this.form.invalid) {
      this.handleCreate(form);
    } else if (this.indexTab === 1 && this.form.controls['keypair_name_2'].value != '' && this.form.controls['public_key'].value != '' && !this.form.invalid) {
      this.handleCreate(form);
    }
  }

  enterDelete(id: any) {
    if (this.nameDeleteInput == this.nameDelete) {
      this.handleDelete(id);
    }
  }
}
