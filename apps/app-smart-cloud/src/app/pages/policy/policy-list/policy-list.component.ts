import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {PolicyModel} from "../../../shared/models/policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";
import {ClipboardService} from "ngx-clipboard";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { debounceTime, finalize, Subject } from 'rxjs';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from "ng-zorro-antd/notification";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { TimeCommon } from '../../../shared/utils/common';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
@Component({
  selector: 'one-portal-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.less'],
})
export class PolicyListComponent implements OnInit{
  selectedStatus: any;
  selectedAction: any;
  isVisibleDelete = false;
  regionId: number;
  projectId: number;
  radioValue: any = null;
  expandSet = new Set<string>();
  nameDelete: any;
  listOfData: PolicyModel[];
  total: any;
  index: any = 1;
  size: any = 10;
  searchValue: any = "";
  loading: boolean = false;
  searchParam: any;
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;
  searchDelay = new Subject<boolean>();

  listPolicyType =[
    {label: this.i18n.fanyi("app.policies.allTypePolicy"),value :""},
    {label:"Portal managed",value :"Portal managed"},
    {label:"Customer managed",value :"Customer managed"}
  ];

  listAction =[
    {label:this.i18n.fanyi("app.policies.attach"),value :"0"},
    {label:this.i18n.fanyi("app.policies.detach"),value :"1"},
  ];
  disableDelete = true;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private service: PolicyService,private router: Router,
              private clipboardService: ClipboardService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = "view";
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.selectedStatus = this.listPolicyType[0].value;
    this.selectedAction = this.listAction[0].value;
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.search();
    })
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.searchPolicy(this.searchValue,this.index, this.size,
      this.tokenService.get()?.userId, this.tokenService.get()?.token, this.selectedStatus)
      .pipe(finalize(() => {this.loading = false;}))
      .subscribe(
      (data)=>{
        this.listOfData = data.records;
        this.total = data.totalCount;
      }
    )
  }

  createPolicy() {
    this.router.navigate(['/app-smart-cloud/policy/create'])
  }

  deletePolicy() {
    this.isVisibleDelete = true;
  }

  deleteHandlePolicy() {
    this.isVisibleDelete = false;
    this.service.deletePolicy(this.nameDelete, this.tokenService.get()?.token)
      .pipe(finalize(() => {this.nameDelete = ""}))
      .subscribe(
      () =>{
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.policy.delete.noti.success"))
        this.search();
      },
      error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.policy.delete.noti.fail"))
      }
    );
  }

  search() {
    this.loadData();
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.loadData();
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.loadData();
  }

  onExpandChange(name: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(name);
    } else {
      this.expandSet.delete(name);
    }
  }

  get code () {
    return JSON.stringify(this.listOfData[0], null, 2);
  }

  set code (v) {
    try{
      this.listOfData[0] = JSON.parse(v);
    }
    catch(e) {
      console.log('error occored while you were typing the JSON');
    }
  }

  copyText(data: any) {
    this.clipboardService.copyFromContent(JSON.stringify(data));
  }

  detail(name: any) {
    this.router.navigate(['/app-smart-cloud/policy/detail',  name])
  }

  selectAction(event: any) {
    if (this.radioValue !== undefined && this.radioValue !== null) {
      if (event === false) {
        if (this.selectedAction == 0) {
          //attach
          this.router.navigate(['/app-smart-cloud/policy/attach', this.radioValue])
        } else {
          //detach
          this.router.navigate(['/app-smart-cloud/policy/detach', this.radioValue])
        }
      }
    }
  }

  handleCancel() {
    this.isVisibleDelete = false;
  }

  reload() {
    this.searchValue = '';
    this.radioValue = null;
    this.loadData();
  }

  handleRadioClick(name: any) {
    if (this.radioValue === name) {
      this.radioValue = null;
    } else {
      this.radioValue = name;
    }
  }

  checkDelete() {
    this.disableDelete = this.nameDelete == this.radioValue ? false : true;
  }
}
