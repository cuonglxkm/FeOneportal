import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {JsonEditorOptions} from "ang-jsoneditor";
import {PolicyService} from "../../../shared/services/policy.service";
import {
  PermissionDTO,
  PolicyInfo,
  ServicePermissionDetail,
  ServicePolicyDTO,
  UpdatePolicyRequest
} from "../policy.model";
import {result} from "lodash";
import {concatMap, flatMap, forkJoin, map, of} from "rxjs";

class Pannel {
  id: string;
  idService: any;
  name: string;
  listPer: any;
}

class Action {
  [key: string]: string[];
}
class ObjectData {
  service: string;
  actions: string[];
}

@Component({
  selector: 'one-portal-policy-update',
  templateUrl: './policy-update.component.html',
  styleUrls: ['./policy-update.component.less'],
})
export class PolicyUpdateComponent implements OnInit {

  public editorOptions: JsonEditorOptions;

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  policyName: string;

  isVisual: boolean = true;

  policyInfo: PolicyInfo;

  serviceArray: ServicePolicyDTO[];

  isLoadding: boolean = false;


  panels: Pannel[];

  allService: string[] = [];

  listServiceWithPer: ServicePermissionDetail[] = [];

  allPermission: any;

  descPermission: any;


  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private router: Router,
    private notification: NzNotificationService,
    private policyService: PolicyService) {

    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.mode = 'code';
  }

  visualOption(isVisual: boolean) {
    this.isVisual = isVisual;
  }

  deleteService(panel: any) {
    if (this.panels != null) {
      // @ts-ignore
      this.panels = this.panels.filter(temp => temp.id != panel.id);
    }
  }

  addService() {
    this.panels.push({
      id: this.generateRandomString(10),
      idService: null,
      name: 'Chọn dịch vụ',
      listPer: null,
    },)
  }

  generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  async ngOnInit(): Promise<void> {
    this.isLoadding = true;
    // Lấy thông tin Policy
    const url = this.activatedRoute.snapshot.url;
    this.policyName = url[url.length - 1].path;
    this.doGetPolicyInfo(this.policyName).then((result) => {
      this.policyInfo = result;
      //Lấy danh sách Service và Permission
      this.getAllServiceV2().then(result => {
        // this.allService = result;
        result.forEach(objData => {
          this.allService.push(objData.service);
        });
        this.doSetDataPermissionService(result).then(result => {
          // console.log(result);
          this.listServiceWithPer = result;
          //Lấy thông tin Permission of Policy set vào local variable
          this.listServiceWithPer.forEach(serviceLocal => {
            serviceLocal.listPermission.forEach(permissionLocal => {
              const foundItem = this.policyInfo.actions.find(perPolicy => perPolicy === permissionLocal.name);
              if (foundItem) {
                permissionLocal.isChecked = true;
              }
            })
          })
          this.isLoadding = false;
        });
      })
    }).catch((error) => {
      this.policyInfo = null;
      this.isLoadding = false;
      this.notification.error('Có lỗi xảy ra', 'Lấy thông tin Policy thất bại.');
    });


    // lấy giá trị mặc định
    this.panels = [
      {
        id: this.generateRandomString(10),
        name: null,
        idService: null,
        listPer: null,
      },
    ];

  }

  editPolicy() {

    let updateRequest = new UpdatePolicyRequest();
    let listAcction = [];
    // console.log(this.panels);
    if(this.panels.length>0){
      this.panels.forEach(panel => {
        panel.listPer.forEach(per => {
          if(per.isChecked){
            listAcction.push(per.name);
          }
        })
      })
      updateRequest.name = this.policyInfo.name;
      updateRequest.desciption = this.policyInfo.description;
      updateRequest.effect = this.policyInfo.effect;
      updateRequest.resource = this.policyInfo.resource;
      updateRequest.actions = listAcction;

      this.policyService.createPolicy(updateRequest).subscribe(data => {
        this.notification.success('Thành công ', 'Chỉnh sửa thành công');
      },error => {
        this.notification.error('Có lỗi xảy ra ', 'Chỉnh sửa thất bại');
      })
      console.log(updateRequest);
    }else{
      this.notification.warning('Cảnh báo', 'Chưa có dịch vào được chọn');
    }
  }

  async doGetAllServices(): Promise<any> {
    try {
      return await this.policyService.getListService().toPromise()
    } catch (error) {
      this.notification.error('Có lỗi xảy ra', 'Lấy danh sách dịch vụ thất bại');
    }
  }

  async doGetAllPermissionOfServices(serviceName: string): Promise<any> {
    try {
      return await this.policyService.getListPermissionOfService(serviceName).pipe(map(items => {
        items.map(item => item.isChecked = false)
        return items;
      })).toPromise();
    } catch (error) {
      this.notification.error('Có lỗi xảy ra', 'Lấy danh sách Permission của dịch vụ thất bại');
    }
  }

  private async getAllServiceV2(): Promise<ObjectData[]>{
    this.allPermission = [
      "product:Update",
      "product:Delete",
      "order:Create",
      "order:List",
      "order:Get",
      "order:CancelOrder",
      "order:GetOrderSpecificationTemplate",
      "order:GetOrderSpecificationKey",
      "ippublic:Create",
      "ippublic:List",
      "ippublic:Get",
      "ippublic:IpPublicAttach",
      "ippublic:Delete",
      "ippublic:IpPublicListSubnet",
      "backup:List",
      "backup:Get",
      "backup:Delete",
      "backup:InstanceBackupRestore",
      "backup:VolumeBackupRestore",
      "backup:ListBackupPacket",
      "backup:UpdateBackupPacket",
      "backup:DeleteBackupPacket",
      "backup:SuspendBackupPacket",
      "backup:ResumeBackupPacket",
      "cloudproject:List",
      "flavor:List",
      "flavor:Create",
      "flavor:Delete",
      "flavor:Get",
      "flavor:Update",
      "image:List",
      "image:Get",
      "image:Create",
      "image:Update",
      "image:Delete",
      "image:CreateImageType",
      "image:UpdateImageType",
      "image:GetImageType",
      "image:DeleteImageType",
      "instance:Get",
      "instance:Delete",
      "instance:Create",
      "instance:Update",
      "instance:Resize",
      "instance:InstanceAction",
      "instance:List",
      "instance:InstanceRebuild",
      "instance:InstanceRestart",
      "instance:InstanceChangePassword",
      "instance:InstanceAtionAllowAddressPair",
      "instance:InstanceListAllowAddressPair",
      "instance:InstanceSearchPort",
      "instance:InstanceGetMonitor",
      "instance:InstanceListVolume",
      "instance:InstanceUpdatePort",
      "keypair:List",
      "keypair:Get",
      "keypair:Create",
      "keypair:KeypairImport",
      "keypair:Delete",
      "securitygroup:List",
      "securitygroup:Get",
      "securitygroup:Create",
      "securitygroup:Delete",
      "securitygroup:SecurityGroupAction",
      "securitygroup:SecurityGroupRuleGet",
      "securitygroup:SecurityGroupRuleSearch",
      "securitygroup:SecurityGroupRuleCrete",
      "securitygroup:SecurityGroupRuleDelete",
      "volume:List",
      "volume:Get",
      "volume:Delete",
      "volume:Update",
      "volume:Suspend",
      "volume:Resume",
      "volume:VolumeAttach",
      "volume:VolumeDetach",
      "configuration:List",
      "configuration:Get",
      "configuration:Update",
      "configuration:Delete",
      "payment:Create",
      "payment:CheckPaymentStatus",
      "payment:Get",
      "payment:List",
      "payment:Update",
      "payment:Delete",
      "iamgroup:Get",
      "iamgroup:List",
      "iamgroup:Create",
      "iamgroup:Delete",
      "iamgroup:IamGroupDetach",
      "iampolicy:List",
      "iampolicy:Delete",
      "iampolicy:Create",
      "iampolicy:IamPolicyAttachOrDetach",
      "iampolicy:Get",
      "iamuser:Get",
      "iamuser:List",
      "iamuser:Create",
      "iamuser:Delete"
    ];

    const actions: Action = {};
    for (const actionString of this.allPermission) {
      const [service, action] = actionString.split(":");
      if (actions.hasOwnProperty(service)) {
        actions[service].push(service + ':' +action);
      } else {
        actions[service] = [service + ':' +action];
      }
    }

    const objectList: ObjectData[] = [];

    for (const service in actions) {
      if (actions.hasOwnProperty(service)) {
        const objectData: ObjectData = {
          service,
          actions: actions[service],
        };
        objectList.push(objectData);
      }
    }
    console.log(objectList);
    return objectList;
  }


  async doGetPolicyInfo(namePolicy: string): Promise<any> {
    try {
      return this.policyService.getPolicyInfo(namePolicy).toPromise();
    } catch (error) {
      this.notification.error('Có lỗi xảy ra', 'Lấy thông tin Policy thất bại.');
    }
  }

  async doSetDataPermissionService(listService: any) {
    let tempList: ServicePermissionDetail[] = [];
    // const getAllPermissionPromises: Promise<void>[] = [];
    listService.forEach((srv: ObjectData) => {
      let srvPerDetail: ServicePermissionDetail = new ServicePermissionDetail();
      srvPerDetail.serviceName = srv.service;
      let listPermission : PermissionDTO[] = [];
      srv.actions.forEach(action => {
        listPermission.push({name: action, description:action, isChecked:false});
      });
      srvPerDetail.listPermission = listPermission;

      tempList.push(srvPerDetail);
    })

    return tempList;
  }

  changeService(selectedPanel: any) {
    let countSerice = 0;
    this.panels.forEach(pln => {
      if (pln.idService == selectedPanel.idService) {
        countSerice++;
      }
    });
    if (countSerice > 1) {
      this.notification.warning("Cảnh báo", "Dịch vụ này đã tồn tại");
      // this.panels = this.panels.filter(pln => pln.id = selectedPanel.id);
      return;
    }

    this.listServiceWithPer.forEach(temp => {
      if (temp.serviceName == selectedPanel.idService) {
        selectedPanel.name = temp.serviceName;
        selectedPanel.listPer = temp.listPermission;
      }
    })

  }


  checkedAll: boolean = false;

  onAllChecked(value: boolean, panel: any): void {
    if (value) {
      panel.listPer.forEach(per => {
        per.isChecked = true;
      })
    } else {
      panel.listPer.forEach(per => {
        per.isChecked = false;
      })
    }
  }
  onOneChecked(value: boolean, data: any){
    if(value){
      data.isChecked = true;
    }else{
      data.isChecked = false;
    }
  }


  backToListPage() {
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

}
