import {Component, ElementRef, ViewChild} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PermissionPolicyModel} from "../policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {ClipboardService} from "ngx-clipboard";


const listService = [
  {
    serviceId: 1,
    serviceName: "SSH KEY"
  },
  {
    serviceId: 2,
    serviceName: "Volume"
  },
  {
    serviceId: 3,
    serviceName: "IP Public"
  }
]

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
  setOfCheckedId = new Set<number>();
  optionData = 1;
  countOrderNum: number = 1;
  public optionJsonEditor: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  listOfPermissionSelectedView: string[] = [];
  listOfPermissionSelectedViewFinal: string[] = [];

  defaultService = {
    orderNum: 0,
    serviceName: null,
    isVisualTablePermiss: false,
    isVisualSelecService: true,
    isActive: false,
    serviceId: null,
    checked: false,
    indeterminate: false,
    permissions: [
      {
        id: 999,
        name: "Hàm tạo",
        description: "mô tả"
      },
      {
        id: 333,
        name: "Hàm xóa",
        description: "Xóa theo id"
      }
    ],
    selectedPermission: []
  }

  serviceArray = [
    {
      orderNum: 0,
      isInit: false,
      isVisualTablePermiss: false,
      isVisualSelecService: true,
      serviceName: null,
      isActive: false,
      serviceId: null,
      checked: false,
      indeterminate: false,
      permissions: [
        {
          id: 1,
          name: "Hàm tạo policy",
          description: "mô tả"
        },
        {
          id: 2,
          name: "Hàm xóa policy",
          description: "Xóa theo id"
        }
      ],
      selectedPermission: []
    }
  ]

  listServiceAvaiable = [
    {
      serviceId: 1,
      serviceName: "SSH KEY"
    },
    {
      serviceId: 2,
      serviceName: "Volume"
    },
    {
      serviceId: 3,
      serviceName: "IP Public"
    }
  ]

  form = new FormGroup({
    name: new FormControl('', {validators: [Validators.required, AppValidator.validPolicyName]}),
    description: new FormControl('', {validators: [AppValidator.validPolicyDescription]}),
  });

  constructor(private service: PolicyService, private router: Router, private clipboardService: ClipboardService) {
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

  selectService(newServiceId: any, serviceItem: any) {
    this.serviceArray = this.serviceArray.map(item => {
      if (item.orderNum === serviceItem.orderNum) {
        item.serviceName = this.listServiceAvaiable.find(item => item.serviceId === newServiceId).serviceName;
        item.isVisualTablePermiss = true;
        item.isVisualSelecService = true;
        return item;
      }
      return item;
    });

    this.listServiceAvaiable.splice(this.listServiceAvaiable.findIndex(item => item.serviceId === newServiceId),1);
    if (serviceItem.isInit) {
      const index = this.listService.findIndex(item => item.serviceId === serviceItem.serviceId);
      if (index > -1) {
        this.listServiceAvaiable.push(listService[index]);
      }
    } else {
      serviceItem.isInit = true;
    }
  }

  onItemChecked(serviceID: any, data: any, checked: boolean): void {
    this.updateCheckedSet(data.id, checked, data.name);
    this.serviceArray.map(item => {
      if (item.serviceId === serviceID) {
        const index = item.selectedPermission.findIndex(data => data.id === data.id);
        if (checked && index == -1) {
          item.selectedPermission.push(data);
        } else {
          item.selectedPermission.splice(index, 1);
        }
        return item;
      }
      return item;
    });
    this.refreshCheckedStatus(serviceID);
  }

  onAllChecked(serviceID: any, isAddAll: boolean): void {
    this.serviceArray = this.serviceArray.map(serviceItem => {
      if (serviceItem.serviceId === serviceID) {
        serviceItem.permissions
          .forEach(permission => this.updateCheckedSet(permission.id, isAddAll, permission.name));
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

    this.refreshCheckedStatus(serviceID);
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

  updateCheckedSet(id: number, checked: boolean, name: string): void {
    const indexString = this.listOfPermissionSelectedView.findIndex(item => item === name);
    if (checked) {
      this.setOfCheckedId.add(id);
      if (indexString == -1) {
        this.listOfPermissionSelectedView.push(name);
      }
    } else {
      this.setOfCheckedId.delete(id);
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
        this.listOfPermissionSelectedViewFinal = [...lst]
      } else {
        this.listOfPermissionSelectedViewFinal = [...this.listOfPermissionSelectedView];
      }

      if (this.listOfPermissionSelectedViewFinal.length === 0 || this.listOfPermissionSelectedViewFinal[0] === "") {
        this.isVisibleNoticeCreate = true;
        return;
      }
    } else {
      this.listOfPermissionSelectedViewFinal = [];
    }

    this.currentStep = step;
  }

  search(search: any) {

  }

  onPageSizeChange(event: any) {

  }

  onPageIndexChange(event: any) {

  }

  createPolicy() {
    this.isVisibleCreate = true;
  }

  handleCreate() {
    this.isVisibleCreate = false;
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  handleCancel() {
    this.isVisibleCreate = false;
    this.isVisibleNoticeCreate = false;
  }

  // protected readonly JSON = JSON;
  protected listService = listService;

  deleteService(serviceItem: any) {
    const index : number = this.serviceArray.findIndex(item => item.orderNum === serviceItem.orderNum);
    for (let per of this.serviceArray[index].selectedPermission) {
      const indexString = this.listOfPermissionSelectedView.findIndex(item => item === per.name);
      if (indexString !== -1) {
        this.listOfPermissionSelectedView.splice(indexString, 1);
      }
    }

    this.serviceArray.splice(index, 1);
    if (serviceItem.serviceId !== undefined && serviceItem.serviceId !== null) {
      const index = listService.findIndex(item => item.serviceId === serviceItem.serviceId);
      if (index > -1) {
        this.listServiceAvaiable.push(listService[index]);
      }
    }

  }

  copyText() {
    this.clipboardService.copyFromContent(this.editor.getText());
  }

  protected readonly JSON = JSON;
}
