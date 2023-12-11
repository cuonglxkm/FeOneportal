import {Component, ViewChild} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PolicyModel} from "../policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";
@Component({
  selector: 'one-portal-policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.less'],
})
export class PolicyListComponent {
  selectedStatus: any;
  selectedAction: any;

  regionId: number;
  projectId: number;
  radioValue: any;
  expandSet = new Set<number>();

  listOfData: PolicyModel[];
  total: any;
  index: any = 1;
  size: any = 10;
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

  constructor(private service: PolicyService,private router: Router,) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = "text";
  }

  ngOnInit() {
    this.selectedStatus = this.listPolicyType[0].value;
    this.selectedAction = this.listAction[0].value;
    this.loadData();
  }

  loadData() {
    this.service.searchPolicy().subscribe(
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

  }

  search(search: any) {

  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  onPageSizeChange(event: any) {
    this.size = event;
  }

  onPageIndexChange(event: any) {
    this.index = event;
  }

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
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
}
