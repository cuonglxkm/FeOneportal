import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {AllowAddressPairService} from "../../../shared/services/allow-address-pair.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AllowAddressPairCreateOrDeleteForm} from "../../../shared/models/allow-address-pair";
import {NzMessageService} from "ng-zorro-antd/message";
import {AppValidator} from "../../../../../../../libs/common-utils/src";

@Component({
  selector: 'one-portal-create-allow-address-pair',
  templateUrl: './create-allow-address-pair.component.html',
  styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent implements OnInit {
  @Input() isVisible: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter()

  formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm;

  validateForm: FormGroup<{
    macAddress: FormControl<string>;
    ipAddress: FormControl<string>;
  }> = this.fb.group({
    macAddress: [''],
    ipAddress: ['', [Validators.required, AppValidator.ipWithCIDRValidator,
      Validators.pattern( /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\/\d{1,2}$/)]],
  });
  constructor(private fb: NonNullableFormBuilder) {
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.onOk.emit(this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
  }

  ngOnInit(): void {
  }
}
