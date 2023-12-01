import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {AllowAddressPairCreateOrDeleteForm} from "../../../shared/models/allow-address-pair";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {AllowAddressPairService} from "../../../shared/services/allow-address-pair.service";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'create-allow-address-pair',
  templateUrl: './create-allow-address-pair.component.html',
  styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent implements OnInit {
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Input() userId: number
  @Input() region: number
  @Input() project: number
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm = new AllowAddressPairCreateOrDeleteForm();

  validateForm: FormGroup<{
    macAddress: FormControl<string>;
    ipAddress: FormControl<string>;
  }> = this.fb.group({
    macAddress: ['', [Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)]],
    ipAddress: ['', [Validators.required, AppValidator.ipWithCIDRValidator,
      Validators.pattern(/^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/)]],
  });

  constructor(private fb: NonNullableFormBuilder,
              private allowAddressPairService: AllowAddressPairService,
              private notification: NzNotificationService) {
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.formDeleteOrCreate.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
      this.formDeleteOrCreate.pairInfos = [this.validateForm.value];
      this.formDeleteOrCreate.isDelete = false;
      this.formDeleteOrCreate.region = this.region;
      this.formDeleteOrCreate.vpcId = this.project;
      this.formDeleteOrCreate.customerId = this.userId;

      this.isLoading = true;
      this.allowAddressPairService.createOrDelete(this.formDeleteOrCreate)
        .subscribe(data => {
          this.validateForm.reset();
          this.isLoading = false;
          console.log('dâta', data)
          this.notification.success('Thành công', `Tạo Allow Address Pair thành công`);
          this.onOk.emit();
        }, error => {
          // this.isVisible = false;
          this.isLoading = false;
          this.validateForm.reset();
          console.log('error', error.status)
          this.notification.error('Thất bại', 'Tạo Allow Address Pair thất bại');
          this.onOk.emit();
        })
    }

  }

  handleCancel(): void {
    this.validateForm.reset();
    this.onCancel.emit();
  }

  ngOnInit(): void {
  }
}
