import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {ActivatedRoute, Router} from "@angular/router";
import {PolicyInfo} from "../../../shared/models/policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import { RegionCoreService, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-policy-detail',
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.less'],
})
export class PolicyDetailComponent implements OnInit {

  public editorOptions: JsonEditorOptions;

  jsonPermission: any;
  jsonEntities: any;

  isLoadingPolicyInfo: boolean;

  @ViewChild(JsonEditorComponent, {static: false}) editor: JsonEditorComponent;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private regionService: RegionCoreService,
              private policyService: PolicyService,
              private router: Router,
              private notification: NzNotificationService,
              private activatedRoute: ActivatedRoute,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.editorOptions = new JsonEditorOptions()
    // this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
    this.editorOptions.mode = 'code'; //set only one mode


  }

  region = JSON.parse(localStorage.getItem('regionId'));

  project = JSON.parse(localStorage.getItem('projectId'));

  policyInfoSearch: string;

  isJson: boolean = false;

  tabPolicyIndex: number;

  isLoadingPer: boolean;

  policyName: string;

  policyInfo: PolicyInfo;

  permissionNameSearh: string;

  perPageSize: number = 5;

  perCurrentPage: number = 1;

  perTotalData: number;

  optionsEntities: NzSelectOptionInterface[] = [
    {label: 'Tất cả các loại', value: null},
    {label: 'Users', value: 1},
    {label: 'Users Groups', value: 2},

  ];
  entitiesTypeSearch: number;

  entitiesNameSearch: string;

  entTotalData: number;

  entPageSize: number = 5;

  entCurrentPage: number = 1;

  isLoadingEntities: boolean;

  ngOnInit(): void {

    //Lấy thông tin Policy
    const url = this.activatedRoute.snapshot.url;
    this.policyName = url[url.length - 1].path;
    this.doGetPolicyInfo(this.policyName);

    //Lấy danh sách Permission Policy
    this.doGetPermission(this.policyName, null, 5, 1);

    //Lấy danh sách Entities Policy
    this.doGetAttachedEntities(this.policyName, null, null, 1, 5);

  }

  private doGetPolicyInfo(policyNam: string) {
    this.isLoadingPolicyInfo = true
    this.policyService.getPolicyInfo(policyNam).subscribe(
      data => {
        this.policyInfo = data;
        this.isLoadingPolicyInfo = false
      },
      error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.policy-detail.noti.fail"));
        this.isLoadingPolicyInfo = false;
      }
    );
  }

  searchPermission() {
    this.doGetPermission(this.policyName, this.permissionNameSearh, this.perPageSize, this.perCurrentPage);
  }

  doGetPermission(policyName: string, actionName: string, pageSize: number, currentPage: number) {
    this.isLoadingPer = true;
    this.policyService.getPermisssions(policyName, actionName, pageSize, currentPage).subscribe(
      data => {
        this.perTotalData = data.totalCount;
        this.jsonPermission = data.records
        this.isLoadingPer = false;
      }, error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.policy.permission.noti.fail"));
        this.isLoadingPer = false;
      }
    )
  }

  onPerQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params;
    this.perPageSize = pageSize;
    this.perCurrentPage = pageIndex;
    this.searchPermission();
  }

  onEntitiesQueryParamsChange(params: NzTableQueryParams){
    const {pageSize, pageIndex} = params;
    this.entPageSize = pageSize;
    this.entCurrentPage = pageIndex;
    this.searchEntities();
  }

  searchEntities(){
    this.doGetAttachedEntities(this.policyName, this.entitiesNameSearch, this.entitiesTypeSearch, this.entPageSize, this.entCurrentPage);
  }

  private doGetAttachedEntities(policyName: string, entityName: string, type: number, pageSize: number, currentPage: number) {
    this.isLoadingEntities = true;
    this.policyService.getAttachedEntities(policyName, entityName, type, pageSize, currentPage).subscribe(
      data => {
        this.entTotalData = data.totalCount;
        this.jsonEntities = data.records;
        this.isLoadingEntities = false;
      },
      error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.detach-policy.attach-entities.noti.fail"));
        this.isLoadingEntities = false;
      }
    )

  }

  searchPolicInfo() {

  }

  edit() {
    this.router.navigate(['/app-smart-cloud/policy/update/' + this.policyName]);
  }

  toVisual() {
    this.isJson = false;
  }

  toJson() {
    this.isJson = true;
  }

  navigateToAttach() {
    this.router.navigate(['/app-smart-cloud/policy/attach/' + this.policyName]);
  }

  navigateToDetach() {
    this.router.navigate(['/app-smart-cloud/policy/detach/' + this.policyName]);
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

  protected readonly navigator = navigator;
}
