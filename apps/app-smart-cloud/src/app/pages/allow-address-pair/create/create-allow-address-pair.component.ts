import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  AllowAddressPair,
  AllowAddressPairCreateOrDeleteForm,
  AllowAddressPairSearchForm,
} from '../../../shared/models/allow-address-pair';
import { AllowAddressPairService } from '../../../shared/services/allow-address-pair.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ipValidator } from '../../file-storage/access-rule/action/create/create-access-rule.component';

@Component({
  selector: 'create-allow-address-pair',
  templateUrl: './create-allow-address-pair.component.html',
  styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent implements OnInit {
  @Input() isVisible: boolean;
  @Input() isLoading: boolean;
  @Input() userId: number;
  @Input() region: number;
  @Input() project: number;
  @Input() portId: string;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter<void>();

  formSearch: AllowAddressPairSearchForm = new AllowAddressPairSearchForm();
  formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm =
    new AllowAddressPairCreateOrDeleteForm();

  validateForm: FormGroup<{
    macAddress: FormControl<string>;
    ipAddress: FormControl<string>;
  }> = this.fb.group({
    macAddress: [
      '',
      [Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)],
    ],
    ipAddress: [
      '',
      [
        Validators.required,
        ipValidator(),
        this.duplicateNameValidator.bind(this),
      ],
    ],
  });

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.listAlowAdressPair && this.listAlowAdressPair.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  listAlowAdressPair: AllowAddressPair[] = [];
  getAllowAddressPair(formSearch: AllowAddressPairSearchForm) {
    this.isLoading = true;
    this.allowAddressPairService.search(formSearch).subscribe(
      (data) => {
        this.isLoading = false;
        this.listAlowAdressPair = data.records;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private allowAddressPairService: AllowAddressPairService,
    private notification: NzNotificationService
  ) {}

  submitForm(): void {
    if (this.validateForm.valid) {
      this.formDeleteOrCreate.portId = this.portId;
      this.formDeleteOrCreate.pairInfos = [this.validateForm.value];
      this.formDeleteOrCreate.isDelete = false;
      this.formDeleteOrCreate.region = this.region;
      this.formDeleteOrCreate.vpcId = this.project;
      this.formDeleteOrCreate.customerId = this.userId;

      this.isLoading = true;
      this.allowAddressPairService
        .createOrDelete(this.formDeleteOrCreate)
        .subscribe(
          (data) => {
            this.validateForm.reset();
            this.isLoading = false;
            console.log('dâta', data);
            this.notification.success(
              'Thành công',
              `Tạo Allow Address Pair thành công`
            );
            this.onOk.emit();
          },
          (error) => {
            // this.isVisible = false;
            this.isLoading = false;
            this.validateForm.reset();
            console.log('error', error.status);
            this.notification.error('Thất bại', 'Địa chỉ IP đã tồn tại!');
            this.onOk.emit();
          }
        );
    }
  }

  handleCancel(): void {
    this.validateForm.reset();
    this.onCancel.emit();
  }

  ngOnInit(): void {
    this.formSearch.vpcId = this.project;
    this.formSearch.region = this.region;
    this.formSearch.portId = this.portId;
    this.formSearch.pageSize = 10;
    this.formSearch.currentPage = 1;
    this.formSearch.search = null;
  }
}
