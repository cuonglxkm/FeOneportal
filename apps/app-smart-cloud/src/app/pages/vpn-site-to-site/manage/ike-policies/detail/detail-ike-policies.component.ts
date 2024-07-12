import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { IKEPolicyModel } from 'src/app/shared/models/vpns2s.model';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { IkePolicyService } from 'src/app/shared/services/ike-policy.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';


@Component({
  selector: 'one-portal-detail-ike-policies',
  templateUrl: './detail-ike-policies.component.html',
  styleUrls: ['./detail-ike-policies.component.less'],
})
export class DetailIkePoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  ikePolicy: IKEPolicyModel = new IKEPolicyModel();
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private ikePolicyService: IkePolicyService,
              private router: Router,
              private activatedRoute: ActivatedRoute
              ) {
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  getIkePolicyById(id) {
    this.isLoading = true
    this.ikePolicyService.getIkePolicyById(id,this.project,this.region).subscribe(data => {
      this.ikePolicy = data
      console.log(data);
      
      this.isLoading = false
    }, error => {
      this.ikePolicy = null
      this.isLoading = false
    })
  }

  ngOnInit() {
    this.getIkePolicyById(this.activatedRoute.snapshot.paramMap.get('id'))
  }
}
