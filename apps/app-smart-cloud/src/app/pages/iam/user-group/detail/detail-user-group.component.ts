import {Component, ViewChild} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {Router} from "@angular/router";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";
import {JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
// import { schema } from './schema.value';

export interface UserGroup {
  id: number;
  name: string;
  group: number;
  last_activity: string;
  created_at: string
}

@Component({
  selector: 'one-portal-detail-user-group',
  templateUrl: './detail-user-group.component.html',
  styleUrls: ['./detail-user-group.component.less'],
})
export class DetailUserGroupComponent {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  value?: string;
  isVisibleEdit: boolean = false
  checked = false;
  loading = false;
  indeterminate = false;
  listOfData: { last_activity: string; name: string; created_at: string; id: number; group: string }[] = [];
  listOfDataPolicies = [
    {
      id: 1,
      name: 'parent 1',
      type: '100',
      attached_entities: true,
      children: {
        title: '0-1-1',
        key: '011',
        children: [
          { title: '0-1-1-0', key: '0110', isLeaf: true },
          { title: '0-1-1-1', key: '0111', isLeaf: true },
          { title: '0-1-1-2', key: '0112', isLeaf: true }
        ]
      }
    },
    {
      id: 2,
      name: 'parent 2',
      type: '100',
      attached_entities: true,
      children: 'abc'
    },
    {
      id: 3,
      name: 'parent 3',
      type: '100',
      attached_entities: true,
      children: 'abc'
    }
  ];
  listOfCurrentPageData: readonly UserGroup[] = [];
  setOfCheckedId = new Set<number>();

  protected readonly Date = Date;

  public editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  constructor(private router: Router) {
    this.editorOptions = new JsonEditorOptions()
    // this.editorOptions.mode = 'code';
    this.editorOptions.modes = ['code', 'tree'];
    // this.editorOptions.schema = schema;
    // this.editorOptions.statusBar = false;
    this.editorOptions.onChange = () => console.log(this.editor.get());
  }

  expandSet = new Set<number>();

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId
    // this.formSearch.regionId = this.region
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    // this.formSearch.project = this.project
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly UserGroup[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({id}) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({id}) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({id}) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/iam/user-group'])
  }

  showModalEdit() {
    this.isVisibleEdit = true
  }

  handleCancelEdit() {
    this.isVisibleEdit = false
  }

  handleOkEdit() {
    this.isVisibleEdit = false
  }

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
  }

  ngOnInit(): void {
    this.listOfData = new Array(10).fill(0).map((_, index) => ({
      id: index,
      name: `test ${index}`,
      group: `TT ${index}`,
      created_at: `${index}/10/2023 1${index}:00:2${index}`,
      last_activity: `none`,
    }));
  }

  protected readonly JSON = JSON;
}
