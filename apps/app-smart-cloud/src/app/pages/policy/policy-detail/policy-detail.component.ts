import {Component, OnInit, ViewChild} from '@angular/core';
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {JsonEditorComponent, JsonEditorOptions} from 'ang-jsoneditor';
import {RegionService} from "../../../shared/services/region.service";

@Component({
  selector: 'one-portal-policy-detail',
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.less'],
})
export class PolicyDetailComponent implements OnInit {

  public editorOptions: JsonEditorOptions;

  public jsonPermission: any;
  public jsonEntities: any;

  @ViewChild(JsonEditorComponent, {static: false}) editor: JsonEditorComponent;


  constructor(private regionService: RegionService) {
    this.editorOptions = new JsonEditorOptions()
    // this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
    this.editorOptions.mode = 'code'; //set only one mode



  }

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  policyInfoSearch: string;

  isJson: boolean = true;

  tabPolicyIndex: number;

  ngOnInit(): void {

    this.regionService.getAll().subscribe(data => {
      // console.log(data);
      this.jsonPermission = data;
      if (this.jsonPermission.length > 0) {


      }
    }, error => {
      this.jsonPermission = []
    });
  }


  searchPolicInfo() {

  }

  edit() {

  }

  toVisual() {
    this.isJson = false;
  }

  toJson() {
    this.isJson = true;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

}
