import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { LoadingService } from "@delon/abc/loading";
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { AclDeleteModel } from 'src/app/core/models/acl-delete.model';
import { AclReqModel } from 'src/app/core/models/acl-req.model';
import { AclModel } from 'src/app/core/models/acl.model';
import { KafkaCredential } from 'src/app/core/models/kafka-credential.model';
import { KafkaTopic } from 'src/app/core/models/kafka-topic.model';
import { AclKafkaService } from 'src/app/services/acl-kafka.service';

@Component({
  selector: 'one-portal-acl-topic',
  templateUrl: './acl-topic.component.html',
  styleUrls: ['./acl-topic.component.css'],
})
export class AclTopicComponent implements OnInit {
  listAclTopic: AclModel[];
  @Input() listOfPrincipals: KafkaCredential[];
  @Input() serviceOrderCode: string;
  listOfTopic: KafkaTopic[];

  listOfPermissionGroup = [
    {
      key: 'consumer',
      value: 'Consumer'
    },
    {
      key: 'producer',
      value: 'Producer'
    },
    {
      key: 'all',
      value: 'Consumer & Producer'
    }
  ];

  listOfPermission = ['DENY', 'ALLOW'];

  idListForm = 0;
  idCreateForm = 1;
  idUpdateForm = 2;
  showForm: number = this.idListForm;

  topicExtract = "Exact";
  topicPrefixed = "Prefixed";
  tabTopicValue: string = this.topicExtract;


  aclTopicForm: FormGroup;
  isEdit = false;
  defaultHost = '0.0.0.0';
  isLoadingTopic = false;
  searchText = '';

  total = 1;
  pageSize = 10;
  pageIndex = 1;
  maxSize = 9999;

  resourceTypeTopic = 'topic';
  aclRequest: AclReqModel = new AclReqModel();
  isVisibleDelete = false;
  currentAclTopic: AclDeleteModel;

  constructor(
    private fb: NonNullableFormBuilder,
    private aclKafkaService: AclKafkaService,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {

  }

  ngOnInit() {
    this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeTopic);
    this.getListTopic();
    this.initForm();
  }

  initForm() {
    this.aclTopicForm = this.fb.group({
      principal: [null, [Validators.required]],
      topic: [null, [Validators.required]],
      topicPrefixed: [null],
      permissionGroup: [null, [Validators.required]],
      permission: [null, [Validators.required]],
      host: [this.defaultHost, [Validators.required]]
    });
  }

  getListTopic() {
    this.aclKafkaService.getListTopic(this.pageIndex, this.maxSize, "", this.serviceOrderCode)
      .subscribe((r) => {
        if (r && r.code == 200) {
          this.listOfTopic = camelizeKeys(r.data.results) as KafkaTopic[];
        }
      });
  }

  getListAcl(page: number, limit: number, keySearch: string, serviceOrderCode: string, resourceType: string) {
    this.aclKafkaService.getListAcl(page, limit, keySearch.trim(), serviceOrderCode, resourceType)
      .subscribe(
        (res) => {
          if (res && res.code == 200) {
            this.total = res.data.totals
            this.listAclTopic = camelizeKeys(res.data.results) as AclModel[];
          }
        }
      );
  }

  changePage(event: number) {
    this.pageIndex = event;
    this.getListAcl(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode, this.resourceTypeTopic);
  }

  changeSize(event: number) {
    this.pageSize = event;
    this.getListAcl(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode, this.resourceTypeTopic);
  }

  onSearch() {
    this.getListAcl(this.pageIndex, this.pageSize, this.searchText, this.serviceOrderCode, this.resourceTypeTopic);
  }

  createForm() {
    this.initForm();
    this.isEdit = false;
    // this.aclTopicForm.reset();
    for (const key in this.aclTopicForm.controls) {
      this.aclTopicForm.controls[key].markAsPristine();
      this.aclTopicForm.controls[key].updateValueAndValidity();
    }
    this.showForm = this.idCreateForm;
    this.tabTopicValue = this.topicExtract;
    this.aclTopicForm.get('topicPrefixed').enable({ onlySelf: true });
  }

  cancelCreate() {
    this.aclTopicForm.reset();
    for (const key in this.aclTopicForm.controls) {
      this.aclTopicForm.controls[key].markAsPristine();
      this.aclTopicForm.controls[key].updateValueAndValidity();
    }
    this.showForm = this.idListForm;
  }

  submitForm() {
    const hostControl = this.aclTopicForm.get('host');
    if (hostControl.value == null || hostControl.value == '') {
      hostControl.setValue(this.defaultHost);
    }
    for (const i in this.aclTopicForm.controls) {
      this.aclTopicForm.controls[i].markAsDirty();
      this.aclTopicForm.controls[i].updateValueAndValidity();
    }
    if (!this.aclTopicForm.invalid) {
      this.aclRequest.serviceOrderCode = this.serviceOrderCode;
      this.aclRequest.principal = this.aclTopicForm.controls['principal'].value;
      this.aclRequest.resourceType = this.resourceTypeTopic;
      this.aclRequest.resourceName = this.aclTopicForm.controls['topic'].value;
      this.aclRequest.resourceNamePrefixed = this.aclTopicForm.controls['topicPrefixed'].value;
      const permissionGroupCode = this.aclTopicForm.controls['permissionGroup'].value;
      this.aclRequest.permissionGroupName = this.listOfPermissionGroup.find(x => x.key == permissionGroupCode).value;
      this.aclRequest.permissionGroupCode = permissionGroupCode;
      this.aclRequest.allowDeny = this.aclTopicForm.controls['permission'].value;
      this.aclRequest.host = this.aclTopicForm.controls['host'].value;
      this.aclRequest.isEdit = this.isEdit;

      this.loadingSrv.open({ type: "spin", text: "Loading..." });
      this.aclKafkaService.createAcl(this.aclRequest)
        .pipe(
          finalize(() => this.loadingSrv.close())
        )
        .subscribe(
          (data) => {
            if (data && data.code == 200) {
              this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
              this.showForm = this.idListForm;
              this.getListAcl(1, this.pageSize, '', this.serviceOrderCode, this.resourceTypeTopic);
            } else {
              this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
            }
          }
        );
    }
  }

  onChangeRadioTopic() {
    if (this.tabTopicValue == this.topicExtract) {
      this.aclTopicForm.get('topic').setValidators(Validators.required);
      this.aclTopicForm.get('topicPrefixed').clearValidators();
    } else {
      this.aclTopicForm.get('topicPrefixed').setValidators(Validators.required);
      this.aclTopicForm.get('topic').clearValidators();
    }
    this.aclTopicForm.get('topicPrefixed').updateValueAndValidity();
    this.aclTopicForm.get('topic').updateValueAndValidity();
  }

  updateACLTopic(data: AclModel) {
    this.isEdit = true;
    this.showForm = this.idUpdateForm;
    const selectedPrincipal = [];
    selectedPrincipal.push(data.principal);
    this.aclTopicForm.get('principal').setValue(selectedPrincipal);
    if (data.patternType == this.topicExtract) {
      const selectedResource = [];
      selectedResource.push(data.resourceName);
      this.aclTopicForm.get('topic').setValue(selectedResource);
      this.tabTopicValue = this.topicExtract;
    }
    if (data.patternType == this.topicPrefixed) {
      this.aclTopicForm.get('topicPrefixed').setValue(data.resourceName);
      this.aclTopicForm.get('topicPrefixed').disable({ onlySelf: true });
      this.tabTopicValue = this.topicPrefixed;
      this.aclTopicForm.get('topic').clearValidators();
      this.aclTopicForm.get('topic').updateValueAndValidity();
    }
    this.aclTopicForm.get('permissionGroup').setValue(data.permissionGroupCode);
    this.aclTopicForm.get('permission').setValue(data.allowDeny);
    this.aclTopicForm.get('host').setValue(data.host);
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  showDeleteConfirm(data: AclDeleteModel) {
    this.isVisibleDelete = true;
    this.currentAclTopic = data;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.aclKafkaService.deleteAcl(this.currentAclTopic)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe(
        (data) => {
          if (data && data.code == 200) {
            this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
            this.showForm = this.idListForm;
            this.getListAcl(this.pageIndex, this.pageSize, '', this.serviceOrderCode, this.resourceTypeTopic);
          }
          else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
          }
        }
      );
  }
}
