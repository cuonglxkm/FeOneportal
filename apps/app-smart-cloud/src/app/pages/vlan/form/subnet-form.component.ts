import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../shared/services/vlan.service';
import { Subnet } from '../../../shared/models/vlan.model';
import { AppValidator } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-subnet-form',
  templateUrl: './subnet-form.component.html',
  styleUrls: ['./subnet-form.component.less'],
})
export class SubnetFormComponent {
  @Input() value: Subnet | null | undefined
  @Output() onSubmit = new EventEmitter<Record<string, unknown>>;

  editId: number | null = null;
  // subnets: Subnet[] = [];

  validateForm: FormGroup<{
    name: FormControl<string>
    subnetAddressRequired: FormControl<string>
    disableGatewayIp: FormControl<boolean>
    enableDhcp: FormControl<boolean>
    gateway: FormControl<string>
    allocationPool: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
    subnetAddressRequired: ['', [Validators.required, Validators.pattern(/^(\d{1,3}\.){2}0\.0\/(16|24)$/)]],
    disableGatewayIp: [false],
    enableDhcp: [false],
    gateway: [''],
    allocationPool: ['', [Validators.pattern('^([0-9]{1,3}\.){3}[0-9]{1,3}$')]],
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,) {
  }

  // addRow(): void {
  //   this.subnets = [
  //     ...this.subnets,
  //     new Subnet()
  //   ];
  // }

  // nameChange() {
  //   const filteredArrayHas = this.subnets.filter(
  //     (item) => item.name == ''
  //   );
  //   if (!filteredArrayHas.length) {
  //     this.addRow()
  //   }
  // }

  // deleteRow(id: number): void {
  //   this.subnets = this.subnets.filter(d => d.id !== id);
  // }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.onSubmit.emit(Object.assign(this.validateForm.value))
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  formatIPAddresses() {
    // Chia các địa chỉ IP thành mảng bằng dấu phẩy
    const ipArray = this.validateForm.controls.allocationPool.value.split(',');

    // Loại bỏ khoảng trắng thừa ở đầu và cuối mỗi địa chỉ IP
    const trimmedIPArray = ipArray.map(ip => ip.trim());

    // Ghép các địa chỉ IP lại với nhau, mỗi địa chỉ trên một dòng
    this.validateForm.controls.allocationPool.setValue(trimmedIPArray.join('\n'))
  }

  ngOnInit() {
    if (this.value) {
      // this.validateForm.controls.subnetAddressRequired.clearValidators();
      // this.validateForm.controls.subnetAddressRequired.markAsPristine();
      // this.subnets = this.value.subnets
      // const filteredArrayHas = this.value.subnets.filter(
      //   (item) => item.name == ''
      // );
      // if (!filteredArrayHas.length) {
      //   this.addRow()
      // }
      this.validateForm.patchValue({ ...this.value, allocationPool: this.value.allocationPools.map(pool => `${pool.start}, ${pool.end}`).join('\n') })
    }
  }

  protected readonly console = console;
}
