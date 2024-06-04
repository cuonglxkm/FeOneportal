import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { PolicyService } from '../../../shared/services/policy.service';
import {
  PermissionDTO,
  PolicyInfo,
  ServicePermissionDetail,
  ServicePolicyDTO,
  UpdatePolicyRequest
} from '../../../shared/models/policy.model';
import { result } from 'lodash';
import { concatMap, flatMap, forkJoin, map, of } from 'rxjs';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { data } from 'vis-network';
import { finalize } from 'rxjs/operators';

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
  styleUrls: ['./policy-update.component.less']
})
export class PolicyUpdateComponent implements OnInit {

  public editorOptions: JsonEditorOptions;

  region = JSON.parse(localStorage.getItem('regionId'));

  project = JSON.parse(localStorage.getItem('projectId'));

  policyName: string;

  isVisual: boolean = true;

  policyInfo: PolicyInfo;

  serviceArray: ServicePolicyDTO[];

  isLoadding: boolean = false;


  panels: Pannel[];

  allServiceAvaiable: string[] = [];

  listServiceWithPer: ServicePermissionDetail[] = [];

  allPermission: any;

  descPermission: any;


  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private router: Router,
    private notification: NzNotificationService,
    private policyService: PolicyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {

    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
  }

  listAcction: string[];

  visualOption(isVisual: boolean) {
    this.isVisual = isVisual;
    this.listAcction = [];
    // console.log(this.panels);
    if (this.panels.length > 0) {
      this.panels.forEach(panel => {
        panel.listPer.forEach(per => {
          if (per.isChecked) {
            this.listAcction.push(per.name);
          }
        });
      });
    }
  }

  deleteService(panel: any) {
    this.allServiceAvaiable.push(panel.idService);
    if (this.panels != null) {
      // @ts-ignore
      this.panels = this.panels.filter(temp => temp.id != panel.id);
    }
    console.log(this.allServiceAvaiable);
  }

  addService() {
    this.panels.push({
      id: this.generateRandomString(10),
      idService: null,
      name: null,
      listPer: null
    });
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
      this.policyService.getAllPermissions()
        .pipe(finalize(() => {
          this.getAllServiceV2().then(result => {
            // this.allService = result;
            result.forEach(objData => {
              this.allServiceAvaiable.push(objData.service);
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
                });
              });
              this.isLoadding = false;
            });
          });
        }))
        .subscribe(
          data => {
            this.allPermission = data;
          }
        );
    }).catch((error) => {
      this.policyInfo = null;
      this.isLoadding = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.policy-detail.noti.fail'));
    });


    // lấy giá trị mặc định
    this.panels = [
      {
        id: this.generateRandomString(10),
        name: null,
        idService: null,
        listPer: null
      }
    ];

  }

  editPolicy() {
    let updateRequest = new UpdatePolicyRequest();
    let listAcction = [];
    // console.log(this.panels);
    if (this.panels.length > 0) {
      this.panels.forEach(panel => {
        if (panel?.listPer?.length > 0) {
          panel.listPer.forEach(per => {
            if (per.isChecked) {
              listAcction.push(per.name);
            }
          });
        }
      });
      if (listAcction.length > 0) {
        updateRequest.name = this.policyInfo.name;
        updateRequest.desciption = this.policyInfo.description;
        updateRequest.effect = this.policyInfo.effect;
        updateRequest.resource = this.policyInfo.resource;
        updateRequest.actions = listAcction;

        this.policyService.createPolicy(updateRequest).subscribe(data => {
          this.router.navigate(['/app-smart-cloud/policy']);
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.edit-policy.noti.sucess'));
        }, error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.edit-policy.noti.fail'));
        });
        console.log(updateRequest);
      } else {
        this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('app.edit-policy.noti.warming.1'));
      }
    } else {
      this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('app.edit-policy.noti.warming.1'));
    }
  }

  private async getAllServiceV2(): Promise<ObjectData[]> {
    const actions: Action = {};
    for (const actionString of this.allPermission) {
      const [service, action] = actionString.split(':');
      if (actions.hasOwnProperty(service)) {
        actions[service].push(service + ':' + action);
      } else {
        actions[service] = [service + ':' + action];
      }
    }

    const objectList: ObjectData[] = [];

    for (const service in actions) {
      if (actions.hasOwnProperty(service)) {
        const objectData: ObjectData = {
          service,
          actions: actions[service]
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
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.edit-policy.noti.warming.2'));
    }
  }

  async doSetDataPermissionService(listService: any) {
    let tempList: ServicePermissionDetail[] = [];
    // const getAllPermissionPromises: Promise<void>[] = [];
    listService.forEach((srv: ObjectData) => {
      let srvPerDetail: ServicePermissionDetail = new ServicePermissionDetail();
      srvPerDetail.serviceName = srv.service;
      let listPermission: PermissionDTO[] = [];
      srv.actions.forEach(action => {
        listPermission.push({ name: action, description: action, isChecked: false });
      });
      srvPerDetail.listPermission = listPermission;

      tempList.push(srvPerDetail);
    });

    return tempList;
  }

  changeService(selectedPanel: any) {
    let countSerice = 0;
    this.panels.forEach(pln => {
      if (pln.idService == selectedPanel.idService) {
        countSerice++;
      }
    });

    this.allServiceAvaiable.splice(this.allServiceAvaiable.findIndex(item => item === selectedPanel.idService), 1);
    this.listServiceWithPer.forEach(temp => {
      if (temp.serviceName == selectedPanel.idService) {
        selectedPanel.name = temp.serviceName;
        selectedPanel.listPer = temp.listPermission;
      }
    });

  }


  checkedAll: boolean = false;

  onAllChecked(value: boolean, panel: any): void {
    if (value) {
      panel.listPer.forEach(per => {
        per.isChecked = true;
      });
    } else {
      panel.listPer.forEach(per => {
        per.isChecked = false;
      });
    }
  }

  onOneChecked(value: boolean, data: any) {
    if (value) {
      data.isChecked = true;
    } else {
      data.isChecked = false;
    }
  }


  backToListPage() {
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

}
