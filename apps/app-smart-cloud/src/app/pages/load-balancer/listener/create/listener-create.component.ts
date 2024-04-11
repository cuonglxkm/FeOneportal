import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-listener-create',
  templateUrl: './listener-create.component.html',
  styleUrls: ['./listener-create.component.less']
})
export class ListenerCreateComponent {
  step: number = 0;
  validateForm: FormGroup<{
    name: FormControl<string>
    radio: FormControl<any>
    subnet: FormControl<string>
    ipAddress: FormControl<string>
    ipFloating: FormControl<number>
    offer: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    radio: [''],
    subnet: [''],
    ipAddress: ['', Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)],
    ipFloating: [0],
    offer: [1, Validators.required],
    description: ['', Validators.maxLength(255)],
    time: [1, Validators.required]
  });
  radioValue: any;

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
  }

  nextStep() {
    this.step += 1;
  }

  priviousStep() {
    if (this.step == 0) {
      this.router.navigate(['/app-smart-cloud/load-balancer/list']);
    } else {
      this.step -= 1;
    }
  }

  checkDisable() {
  }

  createListener() {
  }
}
