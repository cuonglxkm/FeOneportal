import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupAttachPolicyComponent} from "../popup-policy/popup-attach-policy.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PolicyService} from "../../../shared/services/policy.service";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {AttachOrDetachRequest} from "../../../shared/models/policy.model";
import {UserGroupService} from "../../../shared/services/user-group.service";
import {UserService} from "../../../shared/services/user.service";
import {FormSearchUserGroup} from "../../../shared/models/user-group.model";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';



@Component({
  selector: 'one-portal-policy-attach',
  templateUrl: './policy-attach.component.html',
  styleUrls: ['./policy-attach.component.less'],
})
export class PolicyAttachComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('regionId'));

  project = JSON.parse(localStorage.getItem('projectId'));

  typeSearch : number = 2 ;

  entitiesNameSearch : string;

  optionsEntities : NzSelectOptionInterface[] = [
    {label: this.i18n.fanyi("app.group-detail.allTypes"), value: null},
    {label: 'Users', value: 1},
    {label: 'Users Groups', value: 2},

  ];

  policyName : string;
  checked = false;
  indeterminate = false;
  listOfData: any;
  listOfCurrentPageData: any;
  setOfCheckedId = new Set<string>();
  isLoadingEntities: boolean;

  totalData: number;
  currentPage: number = 1;
  pageSize: number = 5;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  searchEntities(){
    this.doGetAttachedEntities(this.policyName, this.entitiesNameSearch, this.typeSearch, this.pageSize, this.currentPage);
  }

  reload() {
    this.entitiesNameSearch = '';
    this.doGetAttachedEntities(this.policyName, this.entitiesNameSearch, this.typeSearch, this.pageSize, this.currentPage);
  }
  onQueryParamsChange(params: NzTableQueryParams){
    const {pageSize, pageIndex} = params;
    this.pageSize = pageSize;
    this.currentPage = pageIndex;
    this.searchEntities();
  }

  updateCheckedSet(name:string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(name);
    } else {
      this.setOfCheckedId.delete(name);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: any): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ name }) => this.setOfCheckedId.has(name));
    this.indeterminate = listOfEnabledData.some(({ name }) => this.setOfCheckedId.has(name)) && !this.checked;
  }

  onItemChecked(name: string, checked: boolean): void {
    this.updateCheckedSet(name, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({ name }) => this.updateCheckedSet(name, checked));
    this.refreshCheckedStatus();
  }

  attachPolicy(){
    let requestData;
    if(this.typeSearch == 2){
      requestData = this.listOfData.filter(data => this.setOfCheckedId.has(data.name));
    }else{
      requestData = this.listOfData.filter(data => this.setOfCheckedId.has(data.userName));
    }
    for (let item of requestData) {
      if(item.name != undefined) {
        item.type = 2;
      } else {
        item.name = item.userName
        item.type = 1;
      }
    }

    const modal: NzModalRef = this.modalService.create({
      nzTitle: this.i18n.fanyi("app.button.attach-policy"),
      nzContent:PopupAttachPolicyComponent,
      nzFooter: [
        {
          label: this.i18n.fanyi("app.button.cancel"),
          type: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: this.i18n.fanyi("app.button.agree"),
          type: 'primary',
          onClick: () => {
            this.doAttachPolicy(requestData, this.policyName);
            modal.destroy()
          }
        }
      ]
    });

  }
  private doAttachPolicy(requestData: any , policyName: string){
    let request = {
      policyName : policyName,
      action : 'attach',
      items : requestData,
    }
    console.log(request);
    this.policiService.attachOrDetach(request).subscribe(data => {
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.attach-policy.noti.success"));
        this.router.navigate(['/app-smart-cloud/policy']);
      },
      error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.attach-policy.noti.fail"));
      }
    )
  }

  goBack(){
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  ngOnInit(): void {

    const url = this.activatedRoute.snapshot.url;
    this.policyName = url[url.length - 1].path;
    this.doGetAttachedEntities(this.policyName, null, null, 5,1);

  }


  private doGetAttachedEntities(policyName: string, entityName: string, type: number, pageSize:number, currentPage:number){
    this.isLoadingEntities = true;
    //USER
    if(type == 1){
      this.userService.search(entityName,pageSize,currentPage).subscribe(
        data => {
          this.totalData = data.totalCount;
          this.listOfData = data.records;
          this.isLoadingEntities = false;
        },
        error => {
          this.notification.error(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.attach-policy.user.noti.fail"));
          this.isLoadingEntities = false;
        }
      )
    }else{
      let request = new FormSearchUserGroup();
      request.name = entityName;
      request.currentPage = currentPage;
      request.pageSize =pageSize;
      this.userGroupService.search(request).subscribe(
        data => {
          this.totalData = data.totalCount;
          this.listOfData = data.records;
          this.isLoadingEntities = false;
        },
        error => {
          this.notification.error(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.attach-policy.user-group.noti.fail"));
          this.isLoadingEntities = false;
        }
      )
    }
    // this.policiService.getAttachedEntities(policyName,entityName,type,pageSize,currentPage).subscribe(
    //   data => {
    //     this.totalData = data.totalCount;
    //     this.listOfData = data.records;
    //     this.isLoadingEntities = false;
    //   },
    //   error => {
    //     this.notification.error('Có lỗi xảy ra','Lấy danh sách Attached Entities thất bại');
    //     this.isLoadingEntities = false;
    //   }
    // )
  }
  constructor(
    private policiService: PolicyService,
    private userGroupService: UserGroupService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

}
