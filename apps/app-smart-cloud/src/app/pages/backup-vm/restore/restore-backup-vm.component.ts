import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import Flavor from "../../../shared/models/flavor.model";
import Image from "../../../shared/models/image";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Location} from '@angular/common';
import {SecurityGroup} from "../../../shared/models/security-group";

@Component({
  selector: 'one-portal-restore-backup-vm',
  templateUrl: './restore-backup-vm.component.html',
  styleUrls: ['./restore-backup-vm.component.less'],
})
export class RestoreBackupVmComponent implements OnInit{

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  radioValue = 'A';

  validateForm: FormGroup<{
    name: FormControl<string>
    flavor: FormControl<Flavor | null>
    image: FormControl<Image | null>
    securityGroup: FormControl<SecurityGroup | null>
    iops: FormControl<number>
    storage: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required]],
    flavor: [null as Flavor | null, [Validators.required]],
    image: [null as Image | null, [Validators.required]],
    securityGroup: [null as SecurityGroup | null, [Validators.required]],
    iops: [null as number | null, [Validators.required]],
    storage: [null as number | null, [Validators.required]],
  })

  constructor(private fb: NonNullableFormBuilder,
              private location: Location) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    console.log(this.project)
  }


  handleFlavorChange(flavor: Flavor) {
    this.validateForm.controls.flavor.setValue(flavor)
  }

  handleImageChange(image: Image) {
    this.validateForm.controls.image.setValue(image)
  }

  handleSecurityGroupChange(securityGroup: SecurityGroup) {
    this.validateForm.controls.securityGroup.setValue(securityGroup)
  }

  submitForm() {

    if (this.validateForm.valid) {

    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({onlySelf: true});
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    console.log(this.region)
    console.log(this.project)
  }


}
