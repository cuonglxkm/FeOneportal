import { Component } from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'one-portal-vpc-create',
  templateUrl: './vpc-create.component.html',
  styleUrls: ['./vpc-create.component.less'],
})
export class VpcCreateComponent {
  regionId: any;
  loadingCalculate = false;

  form = new FormGroup({
    ipSubnet: new FormControl('', {validators: [Validators.required]}),
    numOfMonth: new FormControl(1, {validators: [Validators.required]}),
    instanceSelected: new FormControl('', {}),
  });

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.router.navigate(['/app-smart-cloud/ip-public']);
  }
}
