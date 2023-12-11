import {Component} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {PermissionPolicyModel} from "../policy.model";
import {PolicyService} from "../../../shared/services/policy.service";
import {JsonEditorOptions} from 'ang-jsoneditor';
import {Router} from "@angular/router";

@Component({
  selector: 'one-portal-policy-create',
  templateUrl: './policy-create.component.html',
  styleUrls: ['./policy-create.component.less'],
})
export class PolicyCreateComponent {
  current = 0;
  regionId: number;
  projectId: number;
  selectedService: any = false;
  isVisual: boolean = true;
  isVisualSelecService: boolean = false;
  isVisualTablePermiss: boolean = false;
  isVisibleCreate: boolean = false;
  titleCreate: any = 'Chọn dịch vụ';
  listPermission: readonly PermissionPolicyModel[] = [];
  setOfCheckedId = new Set<number>();
  public optionJsonEditor: JsonEditorOptions;
  dataJson: JSON;
  listOfSelection = [
    {
      text: 'Select All Row',
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
    {
      text: 'Select Odd Row',
      onSelect: () => {
        this.listPermission.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 !== 0));
        this.refreshCheckedStatus();
      }
    },
    {
      text: 'Select Even Row',
      onSelect: () => {
        this.listPermission.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 === 0));
        this.refreshCheckedStatus();
      }
    }
  ];
  checked = false;
  indeterminate = false;

  constructor(private service: PolicyService, private router: Router) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = "text";
  }

  visualOption(option: any) {
    if (option == 1) {
      this.isVisual = true;
    } else {
      this.isVisual = false;
    }
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  openSelectService() {
    if (this.isVisualSelecService || this.isVisualTablePermiss) {
      this.isVisualSelecService = false;
    } else {
      this.isVisualSelecService = true;
    }

    this.isVisualTablePermiss = false;
  }

  selectService(event: any) {
    this.titleCreate = event;
    this.isVisualSelecService = false;
    this.isVisualTablePermiss = true;
    this.service.searchPolicyPermisstion().subscribe(
      (data) => {
        this.listPermission = data.records;
      }
    )
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listPermission.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly PermissionPolicyModel[]): void {
    this.listPermission = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listPermission.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listPermission.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  setStep(step: any) {
    this.current = step;
  }

  search(search: any) {

  }

  onPageSizeChange(event: any) {

  }

  onPageIndexChange(event: any) {

  }

  createPolicy() {
    this.isVisibleCreate = true;
  }

  handleCreate() {
    this.isVisibleCreate = false;
    this.router.navigate(['/app-smart-cloud/policy']);
  }

  handleCancel() {
    this.isVisibleCreate = false;
  }
}
