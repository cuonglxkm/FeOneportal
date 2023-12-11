import {Component} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";

@Component({
  selector: 'one-portal-create-user-group',
  templateUrl: './create-user-group.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class CreateUserGroupComponent {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  isLoading: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>;
  }>

  constructor(
    private fb: NonNullableFormBuilder,
    private location: Location
  ) {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log(this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({onlySelf: true});
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
