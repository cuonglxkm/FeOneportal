import {Component, Inject, ViewChild} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PolicyModel} from "../policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";
import {ClipboardService} from "ngx-clipboard";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {finalize} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from "ng-zorro-antd/notification";
@Component({
  selector: 'one-portal-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.less'],
})
export class PolicyListComponent {
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
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;

  listPolicyType =[
    {label:"Tất cả trạng thái",value :"0"},
    {label:"Họat động",value :"1"},
    {label:"Ngừng hoạt động",value :"2"}
  ];

  listAction =[
    {label:"Attach",value :"0"},
    {label:"Detach",value :"1"},
  ];

  constructor(private service: PolicyService,private router: Router,
              private clipboardService: ClipboardService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = "view";
  }

  ngOnInit() {
    this.selectedStatus = this.listPolicyType[0].value;
    this.selectedAction = this.listAction[0].value;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.searchPolicy(this.searchValue,this.index, this.size,
      this.tokenService.get()?.userId, this.tokenService.get()?.token)
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
        this.notification.success('Thành công', '`Xóa thành công Policy')
      },
      error => {
        this.notification.error('Thất bại', 'Xóa thất bại Policy')
      }
    );
  }

  search(search: any) {
    this.searchValue = search;
    this.loadData();
  }

  onRegionChange(region: RegionModel) {
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
    };
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
    this.loadData();
  }
}
