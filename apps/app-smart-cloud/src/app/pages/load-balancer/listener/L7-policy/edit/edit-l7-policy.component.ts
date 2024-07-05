import { Component, Inject, OnInit } from '@angular/core';
import { FormUpdateL7Policy, L7Policy, Pool } from '../../../../../shared/models/load-balancer.model';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { urlValidator } from '../create/create-l7-policy.component';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-edit-l7-policy',
  templateUrl: './edit-l7-policy.component.html',
  styleUrls: ['./edit-l7-policy.component.less']
})
export class EditL7PolicyComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idListener: string;
  idLoadBalancer: number;
  idL7Policy: string;

  l7Policy: L7Policy = new L7Policy();

  isLoading: boolean = false;

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
    url: ['']
  });

  nameList: string[] = [];

  actionList = [
    {value: 'REJECT', label: 'REJECT'},
    {value: 'REDIRECT_TO_POOL', label: 'REDIRECT_TO_POOL'},
    {value: 'REDIRECT_TO_URL', label: 'REDIRECT_TO_URL'}
  ]

  listPool: Pool[] = []
  status: any = false
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.doUpdateL7Policy();
    }
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

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
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

  getL7PolicyDetail() {
    this.isLoading = true
    this.loadBalancerService.getDetailL7Policy(this.idL7Policy, this.region, this.project).subscribe(data => {
      this.l7Policy = data
      this.isLoading = false

      this.validateForm.controls.nameL7.setValue(this.l7Policy.name)
      this.validateForm.controls.action.setValue(this.l7Policy.action)

      this.validateForm.controls.pool.setValue(this.l7Policy.poolName)
      if(!['REDIRECT_TO_POOL'].includes(this.validateForm.controls.action.value)){
        this.validateForm.controls.pool.clearValidators();
        this.validateForm.controls.pool.updateValueAndValidity();
      } else {
        this.validateForm.controls.pool.setValidators(Validators.required)
        this.validateForm.controls.pool.setValidators(urlValidator())
      }
      if(!['REDIRECT_TO_URL'].includes(this.validateForm.controls.action.value)){
        this.validateForm.controls.url.clearValidators();
        this.validateForm.controls.url.updateValueAndValidity();
      } else {
        this.validateForm.controls.pool.setValidators(Validators.required)
      }
      this.validateForm.controls.url.setValue(this.l7Policy.redirectUrl)
      this.validateForm.controls.prioritize.setValue(this.l7Policy.position)
      this.validateForm.controls.status.setValue(this.l7Policy.adminStateUp)
      this.validateForm.controls.description.setValue(this.l7Policy.description)

    })
  }

  getListPool() {
    this.loadBalancerService.getListPoolInLB(this.idLoadBalancer).subscribe(data => {
      this.listPool = data
      this.listPool = this.listPool.filter(item => item.protocol.includes("HTTP"))
    })
  }

  onActionChange() {
    if(this.validateForm.controls.action.value === 'REDIRECT_TO_POOL') {
      this.validateForm.controls.pool.setValidators(Validators.required);
    } else {
      this.validateForm.controls.pool.clearValidators();
      this.validateForm.controls.pool.updateValueAndValidity();
      this.validateForm.controls.url.reset()
    }

    if(this.validateForm.controls.action.value === 'REDIRECT_TO_URL') {
      this.validateForm.controls.url.setValidators(Validators.required);
      this.validateForm.controls.url.setValidators(urlValidator())
    } else {
      this.validateForm.controls.url.clearValidators();
      this.validateForm.controls.url.updateValueAndValidity();
      this.validateForm.controls.url.reset()
    }
  }


  getListL7Policy() {
    this.loadBalancerService.getListL7Policy(this.region, this.project, this.idListener).subscribe(data => {
      data?.forEach(item => {
        this.nameList?.push(item.name)
        this.nameList = this.nameList.filter(item => !item.includes(this.validateForm.get('nameL7').value));
      })

    })
  }

  doUpdateL7Policy() {
    this.isLoading = true
    console.log('valid', this.validateForm.valid)
    if(this.validateForm.valid) {
      let formUpdateL7Policy = new FormUpdateL7Policy()
      formUpdateL7Policy.action = this.validateForm.controls.action.value
      formUpdateL7Policy.id = this.idL7Policy
      formUpdateL7Policy.admin_state_up = this.validateForm.controls.status.value
      formUpdateL7Policy.description = this.validateForm.controls.description.value
      formUpdateL7Policy.name = this.validateForm.controls.nameL7.value
      formUpdateL7Policy.position = this.validateForm.controls.prioritize.value
      formUpdateL7Policy.redirect_http_code = null
      formUpdateL7Policy.redirect_pool_id = this.validateForm.controls.pool.value
      formUpdateL7Policy.redirect_prefix = null
      formUpdateL7Policy.redirect_url = this.validateForm.controls.url.value
      formUpdateL7Policy.tags = null
      formUpdateL7Policy.customerId = this.tokenService.get()?.userId
      formUpdateL7Policy.regionId = this.region
      formUpdateL7Policy.vpcId = this.project

      this.loadBalancerService.updateL7Policy(this.idL7Policy, formUpdateL7Policy).subscribe(data => {
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.update.l7.policy.success'))
        //navigate detail listener
        this.router.navigate(['/app-smart-cloud/load-balancer/' + this.idLoadBalancer + '/listener/detail/' + this.idListener])
      }, error => {
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.update.l7.policy.fail'))
      })
    }
  }

  ngOnInit() {
    this.idLoadBalancer = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idLoadBalancer'));
    this.idListener = this.activatedRoute.snapshot.paramMap.get('idListener');
    this.idL7Policy = this.activatedRoute.snapshot.paramMap.get('idL7');

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    this.getL7PolicyDetail()

    this.getListL7Policy()
    this.getListPool()
  }
}
