import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {JsonEditorOptions} from "ang-jsoneditor";
import {PolicyService} from "../../../shared/services/policy.service";
import {PolicyInfo, ServicePermissionDetail, ServicePolicyDTO} from "../policy.model";
import {result} from "lodash";
import {concatMap, flatMap, forkJoin, map, of} from "rxjs";


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




  panels: [{
    id: string,
    idService: any,
    name: string,
    listPer: any,
  }];

  allService: any;

  listServiceWithPer: ServicePermissionDetail[] = [];

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
    if(this.panels != null){
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
      this.doGetAllServices().then(result => {
        this.allService = result
        this.doSetDataPermissionService(this.allService).then( result => {
          this.listServiceWithPer = result;
          //Lấy thông tin Permission of Policy set vào local variable
          this.listServiceWithPer.forEach(serviceLocal => {
            serviceLocal.listPermission.forEach(permissionLocal => {
              const foundItem = this.policyInfo.actions.find(perPolicy => perPolicy === permissionLocal.name);
              if(foundItem){
                permissionLocal.isChecked = true;
              }
            })
          })
          this.isLoadding = false;
        });
      })
    }).catch((error) => {
      this.policyInfo = null;
      this.isLoadding =false;
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
    console.log(this.panels);
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

  async doGetPolicyInfo(namePolicy: string): Promise<any> {
    try {
      return this.policyService.getPolicyInfo(namePolicy).toPromise();
    } catch (error) {
      this.notification.error('Có lỗi xảy ra', 'Lấy thông tin Policy thất bại.');
    }
  }

  async doSetDataPermissionService(listService: any) {
    let tempList :ServicePermissionDetail[] = [];
    const getAllPermissionPromises: Promise<void>[] = [];
    listService.forEach((srv: string) => {
      let srvPerDetail: ServicePermissionDetail = new ServicePermissionDetail();
      srvPerDetail.serviceName = srv;
      const  promise = this.doGetAllPermissionOfServices(srv).then((result) => {
        srvPerDetail.listPermission = result;
        tempList.push(srvPerDetail);
      });
      getAllPermissionPromises.push(promise);
    })
    await Promise.all(getAllPermissionPromises);
    return tempList;
  }
  changeService(selectedPanel: any) {
    console.log(this.listServiceWithPer);
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
