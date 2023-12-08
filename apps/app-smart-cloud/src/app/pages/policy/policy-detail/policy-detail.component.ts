import {Component, OnInit, ViewChild} from '@angular/core';
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
@Component({
  selector: 'one-portal-policy-detail',
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.less'],
})
export class PolicyDetailComponent implements OnInit {

  public editorOptions: JsonEditorOptions;
  public data: any;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;


  constructor() {
    this.editorOptions = new JsonEditorOptions()
    // this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
    this.editorOptions.mode = 'code'; //set only one mode

    this.data = {
      "products": [{
        "name": "car",
        "product": [{
          "name": "honda",
          "model": [{"id": "civic", "name": "civic"}, {"id": "accord", "name": "accord"}, {
            "id": "crv",
            "name": "crv"
          }, {"id": "pilot", "name": "pilot"}, {"id": "odyssey", "name": "odyssey"}]
        }]
      }]
    }


  }

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  ngOnInit(): void {
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

}
