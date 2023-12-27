import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PermissionPolicyModel} from "../policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {ClipboardService} from "ngx-clipboard";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {finalize} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import qrcodegen from "ng-zorro-antd/qr-code/qrcodegen";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-policy-create',
  templateUrl: './policy-create.component.html',
  styleUrls: ['./policy-create.component.less'],
})
export class PolicyCreateComponent {
  currentStep = 0;
  regionId: number;
  projectId: number;
  isVisual: boolean = true;
  isVisibleCreate: boolean = false;
  isVisibleNoticeCreate: boolean = false;
  listPermission: readonly PermissionPolicyModel[] = [];
  setOfCheckedId = new Set<string>();
  optionData = 1;
  countOrderNum: number = 1;
  listService: string[] = [];
  searchKey: any;
  listServiceAvaiable : string[] = [];
  public optionJsonEditor: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  listOfPermissionSelectedView: string[] = [];
  listOfPermissionSelectedViewStep2: string[] = [];
  listOfPermissionSelectedViewFilter: string[] = [];
  listOfPermissionSelectedViewFinal: string[] = [];
  total: number = 3;
  index: number = 1;
  size: number = 10;

  defaultService = {
    orderNum: 0,
    serviceName: null,
    isVisualTablePermiss: false,
    loading: false,
    isVisualSelecService: true,
    isActive: false,
    serviceId: null,
    checked: false,
    indeterminate: false,
    permissions: [

    ],
    selectedPermission: []
  }

  serviceArray = [];


  form = new FormGroup({
    name: new FormControl('', {validators: [Validators.required, AppValidator.validPolicyName]}),
    description: new FormControl('', {validators: [AppValidator.validPolicyDescription]}),
  });

  constructor(private service: PolicyService, private router: Router,
              private clipboardService: ClipboardService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = "code";
  }

  visualOption(option: any) {
    this.optionData = option;
    if (option == 1) {
      this.isVisual = true;
    } else {
      this.isVisual = false;
    }
  }

  addService() {
    let addedService = JSON.parse(JSON.stringify(this.defaultService));
    addedService.orderNum = this.countOrderNum++;
    this.serviceArray.push(addedService)
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  ngOnInit() {
    this.service.getListServices(this.tokenService.get()?.token).subscribe(
      (data) => {
        this.listService = [... data];
        this.listServiceAvaiable = data;
      }
    );
  }
  selectService(newServiceId: any, serviceItem: any) {
    serviceItem.loading = true;
    this.serviceArray = this.serviceArray.map(item => {
      if (item.orderNum === serviceItem.orderNum) {
        item.serviceName = this.listServiceAvaiable.find(item => item === newServiceId);
        item.isVisualTablePermiss = true;
        item.isVisualSelecService = true;
        return item;
      }
      return item;
    });

    this.listServiceAvaiable.splice(this.listServiceAvaiable.findIndex(item => item === newServiceId),1);
    if (serviceItem.isInit) {
      const index = this.listService.findIndex(item => item === serviceItem.serviceId);
      if (index > -1) {
        this.listServiceAvaiable.push(this.listService[index]);
      }
    } else {
      serviceItem.isInit = true;
    }

    this.service.getAllPermissions(serviceItem.serviceName, this.tokenService.get()?.token)
      .pipe(finalize(() => {serviceItem.loading = false;}))
      .subscribe(
      (data) => {
        serviceItem.permissions = data;
      }
    );
  }

  onItemChecked(serviceName: any, data: any, checked: boolean): void {
    this.updateCheckedSet(checked, data.name);
    this.serviceArray.map(item => {
      if (item.serviceName === serviceName) {
        const index = item.selectedPermission.findIndex(data => data.name === data.name);
        if (checked && index === -1) {
          item.selectedPermission.push(data);
        } else {
          if (index !== -1) {
            item.selectedPermission.splice(index, 1);
          }
        }
        return item;
      }
      return item;
    });
    this.refreshCheckedStatus(serviceName);
  }

  onAllChecked(serviceName: any, isAddAll: boolean): void {
    this.serviceArray = this.serviceArray.map(serviceItem => {
      if (serviceItem.serviceName === serviceName) {
        serviceItem.permissions
          .forEach(permission => this.updateCheckedSet(isAddAll, permission.name));
        if (isAddAll) {
          // serviceItem.selectedPermission = Object.assign({}, serviceItem.permissions);
          serviceItem.selectedPermission = [...serviceItem.permissions];
        } else {
          serviceItem.selectedPermission = [];
        }
        return serviceItem;
      }
      return serviceItem;
    });

    this.refreshCheckedStatus(serviceName);
  }

  refreshCheckedStatus(serviceId: any): void {
    for (let item of this.serviceArray) {
      if (serviceId == item.serviceId) {
        item.checked = item.permissions.every(item => this.setOfCheckedId.has(item.id));
        item.indeterminate = item.permissions.some(item => this.setOfCheckedId.has(item.id)) && !item.checked;
        break;
      }
    }
  }

  updateCheckedSet(checked: boolean, name: string): void {
    const indexString = this.listOfPermissionSelectedView.findIndex(item => item === name);
    if (checked) {
      this.setOfCheckedId.add(name);
      if (indexString == -1) {
        this.listOfPermissionSelectedView.push(name);
      }
    } else {
      this.setOfCheckedId.delete(name);
      if (indexString !== -1) {
        this.listOfPermissionSelectedView.splice(indexString, 1);
      }
    }
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  setStep(step: any) {
    if (step === 1) {
      if (this.optionData !== 1) {
        const processedStr = this.editor.getText().slice(1, -1);
        const lst = processedStr.split(',').map((item) => item.trim().slice(1, -1));
        this.listOfPermissionSelectedViewStep2 = [...lst]
      } else {
        this.listOfPermissionSelectedViewStep2 = [...this.listOfPermissionSelectedView];
      }

      if (this.listOfPermissionSelectedViewStep2.length === 0 || this.listOfPermissionSelectedViewStep2[0] === "") {
        this.isVisibleNoticeCreate = true;
        return;
      }
      this.listOfPermissionSelectedViewFilter = [...this.listOfPermissionSelectedViewStep2];
      this.loadData(false);
    } else {
      this.listOfPermissionSelectedViewStep2 = [];
      this.index = 1;
      this.size = 10;
      this.searchKey = "";
    }

    this.currentStep = step;
  }

  search(search: any, isloadData: boolean) {
    if (search === undefined || search === null || search === null) {
      this.listOfPermissionSelectedViewFilter = [...this.listOfPermissionSelectedViewStep2];
    } else {
        this.listOfPermissionSelectedViewFilter = [];
      for(let item of this.listOfPermissionSelectedViewStep2) {
        if (item.includes(search)) this.listOfPermissionSelectedViewFilter.push(item);
      }
    }

    this.searchKey = search;
    if (isloadData) {
      this.loadData(false);
    }
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.loadData(true);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.loadData(true);
  }

  loadData(isSearch: boolean){
    this.listOfPermissionSelectedViewFinal = [];
    if (isSearch) {
      this.search(this.searchKey, false);
    }

    let begin = this.size * (this.index - 1);
    let end = begin + this.size;
    for (let i = 0; i < this.listOfPermissionSelectedViewFilter.length; i++) {
      if (i >= begin && i < end) {
        this.listOfPermissionSelectedViewFinal.push(this.listOfPermissionSelectedViewFilter[i]);
      }
    }

    console.log(this.listOfPermissionSelectedViewFinal);
  }

  createPolicy() {
    this.isVisibleCreate = true;
  }

  handleCreate() {
    this.isVisibleCreate = false;
    const request = {
      name: this.form.controls['name'].value,
      description: this.form.controls['description'].value,
      action: this.listOfPermissionSelectedViewStep2,
      resource : "*",
      effect: "allow",
    }
    this.service.createPolicy(request)
      .subscribe({
        next: post => {
          this.notification.success('Thành công', 'Tạo mới thành công policy')
          this.router.navigate(['/app-smart-cloud/policy']);
        },
        error: e => {
          this.notification.error('Thất bại', 'Tạo mới thất bại policy')
        },
      });
    this.isVisibleCreate = false;
  }

  handleCancel() {
    this.isVisibleCreate = false;
    this.isVisibleNoticeCreate = false;
  }

  deleteService(serviceItem: any) {
    const index : number = this.serviceArray.findIndex(item => item.orderNum === serviceItem.orderNum);
    for (let per of this.serviceArray[index].selectedPermission) {
      const indexString = this.listOfPermissionSelectedView.findIndex(item => item === per.name);
      if (indexString !== -1) {
        this.listOfPermissionSelectedView.splice(indexString, 1);
      }
    }

    this.serviceArray.splice(index, 1);
    if (serviceItem.serviceName !== undefined && serviceItem.serviceName !== null) {
      const index = this.listService.findIndex(item => item === serviceItem.serviceName);
      if (index > -1) {
        this.listServiceAvaiable.push(this.listService[index]);
      }
    }

  }

  copyText() {
    this.clipboardService.copyFromContent(this.editor.getText());
  }

  protected readonly JSON = JSON;

}
