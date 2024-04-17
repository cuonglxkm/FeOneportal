import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from '../../shared/models/project.model';
import { RegionModel } from '../../shared/models/region.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.less'],
})
export class SecurityComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  toggleSwitch: boolean = false
  isLoading: boolean = false
  isVisibleUpdate: boolean = false

  email:string = ''

  form: FormGroup<{
    otp: FormControl<string>;
  }> = this.fb.group({
    otp: ['', [Validators.required]],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
  }

  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.email = this.tokenService.get().email
    
  }

  // clickSwitch(): void {
  //   this.toggleSwitch = !this.toggleSwitch;
  // }

  handleSubmit(): void {
    this.isVisibleUpdate = true;
    console.log(this.toggleSwitch);
    
  }

  handleCancel(){
    this.isVisibleUpdate = false;
  }

  handleChangeSwitch(event){
    this.toggleSwitch = event
    
  }

  handleUpdate(){
    
  }
}
