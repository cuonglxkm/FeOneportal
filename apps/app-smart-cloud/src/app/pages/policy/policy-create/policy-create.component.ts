import {Component} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PermissionPolicyModel} from "../policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";


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
  // selectedService: any = false;
  isVisual: boolean = true;
  isVisibleCreate: boolean = false;
  titleCreate: any = 'Chọn dịch vụ';
  listPermission: readonly PermissionPolicyModel[] = [];
  setOfCheckedId = new Set<number>();
  public optionJsonEditor: JsonEditorOptions;
  listOfPermissionSelected: any[] = [];

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

  countOrderNum: number = 1;

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

  constructor(private service: PolicyService, private router: Router) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = "text";
  }

  visualOption(option: any) {
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
    this.titleCreate = newServiceId;
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
    this.updateCheckedSet(data.id, checked);
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
          .forEach(permission => this.updateCheckedSet(permission.id, isAddAll));
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

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  setStep(step: any) {
    if (step == 1) {
      for (const itemService of this.serviceArray) {
        for (let per of itemService.selectedPermission) {
          this.listOfPermissionSelected.push(per);
        }
      }
    } else {
      this.listOfPermissionSelected = [];
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
  }

  // protected readonly JSON = JSON;
  protected listService = listService;

  deleteService(serviceItem: any) {
    const index = this.serviceArray.findIndex(item => item.orderNum === serviceItem.orderNum);
    this.serviceArray.splice(index, 1);

    if (serviceItem.serviceId !== undefined && serviceItem.serviceId !== null) {
      const index = listService.findIndex(item => item.serviceId === serviceItem.serviceId);
      if (index > -1) {
        this.listServiceAvaiable.push(listService[index]);
      }
    }
  }

  protected readonly JSON = JSON;
}
