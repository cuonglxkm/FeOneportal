import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { FormCreateL7Policy, Pool } from '../../../../../shared/models/load-balancer.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    const isValid = urlRegex.test(control.value);
    return isValid ? null : { 'invalidUrl': { value: control.value } };
  };
}

@Component({
  selector: 'one-portal-create-l7-policy',
  templateUrl: './create-l7-policy.component.html',
  styleUrls: ['./create-l7-policy.component.less'],
})
export class CreateL7PolicyComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idListener: string
  idLoadBalancer: number

  nameList: string[] = [];

  actionList = [
    {value: 'REJECT', label: 'REJECT'},
    {value: 'REDIRECT_TO_POOL', label: 'REDIRECT_TO_POOL'},
    {value: 'REDIRECT_TO_URL', label: 'REDIRECT_TO_URL'}
  ]

  validateForm: FormGroup<{
    nameL7: FormControl<string>
    action: FormControl<string>
    prioritize: FormControl<number>
    pool: FormControl<string>
    status: FormControl<boolean>
    description: FormControl<string>
    url: FormControl<string>
  }> = this.fb.group({
    nameL7: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this), Validators.maxLength(50)]],
    action: ['', [Validators.required]],
    prioritize: [1, [Validators.required]],
    pool: [''],
    status: [false, [Validators.required]],
    description: [''],
    url: ['', [urlValidator()]]
  });

  status: any = false

  listPool: Pool[] = []

  isLoading: boolean = false

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    // this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel){
    this.project = project?.id;
    // this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  onSwitchStatus() {
    this.status = this.validateForm.controls.status.value
    console.log('on off', this.status)
  }

  onActionChange() {
    if(this.validateForm.controls.action.value == 'REDIRECT_TO_POOL') {
      this.validateForm.controls.pool.setValidators(Validators.required);
    } else {
      this.validateForm.controls.pool.clearValidators();
      this.validateForm.controls.pool.updateValueAndValidity();
    }

    if(this.validateForm.controls.action.value == 'REDIRECT_TO_URL') {
      this.validateForm.controls.url.setValidators(Validators.required);
    } else {
      this.validateForm.controls.url.clearValidators();
      this.validateForm.controls.url.updateValueAndValidity();
    }
  }

  getListL7Policy() {
    this.loadBalancerService.getListL7Policy(this.region, this.project, this.idListener).subscribe(data => {
      data?.forEach(item => {
        this.nameList?.push(item.name)
      })

    })
  }

  getListPool() {
    this.loadBalancerService.getListPoolInLB(this.idLoadBalancer).subscribe(data => {
      this.listPool = data
      this.listPool = this.listPool.filter(item => item.protocol.includes("HTTP"))
    })
  }

  submitForm() {
    this.isLoading = true
    let formCreateL7Policy = new FormCreateL7Policy()
    formCreateL7Policy.action = this.validateForm.controls.action.value
    formCreateL7Policy.adminStateUp = this.validateForm.controls.status.value
    formCreateL7Policy.description = this.validateForm.controls.description.value
    formCreateL7Policy.listenerId = this.idListener
    formCreateL7Policy.regionId = this.region
    formCreateL7Policy.vpcId = this.project
    formCreateL7Policy.name = this.validateForm.controls.nameL7.value
    formCreateL7Policy.position = this.validateForm.controls.prioritize.value
    formCreateL7Policy.projectId = this.project.toString()
    formCreateL7Policy.redirectHttpCode = null
    formCreateL7Policy.redirectPoolId = null
    formCreateL7Policy.redirectUrl = null
    formCreateL7Policy.customerId = this.tokenService.get()?.userId

    this.loadBalancerService.createL7Policy(formCreateL7Policy).subscribe(data => {
      this.isLoading = false
      this.router.navigate(['/app-smart-cloud/load-balancer/detail/'+this.idLoadBalancer])
      this.notification.success('Thành công', 'Tạo mới L7 Policy thành công')
    }, error =>  {
      this.isLoading = false
      // this.router.navigate(['/app-smart-cloud/load-balancer/detail/'+this.idLoadBalancer])
      this.notification.error('Thất bại', 'Tạo mới L7 Policy thất bại')
    })
  }


  ngOnInit() {
    this.idLoadBalancer = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idLoadBalancer'));
    this.idListener = this.activatedRoute.snapshot.paramMap.get('idListener');

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    this.getListPool()
    this.getListL7Policy()
  }

}