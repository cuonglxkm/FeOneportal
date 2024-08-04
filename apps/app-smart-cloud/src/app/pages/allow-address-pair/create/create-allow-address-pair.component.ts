import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import {
  AllowAddressPairCreateOrDeleteForm,
  AllowAddressPairSearchForm,
} from '../../../shared/models/allow-address-pair';
import { AllowAddressPairService } from '../../../shared/services/allow-address-pair.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ipValidator } from '../../file-storage/access-rule/action/create/create-access-rule.component';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { I18NService } from '@core';

@Component({
  selector: 'create-allow-address-pair',
  templateUrl: './create-allow-address-pair.component.html',
  styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent implements OnInit {
  @Input() userId: number;
  @Input() region: number;
  @Input() project: number;
  @Input() portId: string;
  @Output() onOk = new EventEmitter<void>();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private allowAddressPairService: AllowAddressPairService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {}

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
    if (this.listIpAddressCidr && this.listIpAddressCidr.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  listIpAddressCidr: string[] = [];
  getAllowAddressPair(formSearch: AllowAddressPairSearchForm) {
    this.allowAddressPairService.search(formSearch).subscribe({
      next: (data) => {
        data.records.forEach((e) => this.listIpAddressCidr.push(e.ipAddress));
        if (data.totalCount >= 10) {
          this.isVisible = false;
          this.notification.warning(
            '',
            this.i18n.fanyi('app.notify.create.allow.address.pair.warning')
          );
        } else {
          this.isVisible = true;
        }
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.get.list.allow.address.pair')
        );
        this.listIpAddressCidr = [];
      },
    });
  }

  isVisible: boolean = false;
  showModalCreate() {
    this.formSearch.customerId = this.userId;
    this.formSearch.vpcId = this.project;
    this.formSearch.region = this.region;
    this.formSearch.portId = this.portId;
    this.formSearch.pageSize = 100;
    this.formSearch.currentPage = 1;
    this.formSearch.search = null;
    this.listIpAddressCidr = [];
    this.getAllowAddressPair(this.formSearch);
  }

  submitForm(): void {
    this.isVisible = false;
    if (this.validateForm.valid) {
      this.formDeleteOrCreate.portId = this.portId;
      this.formDeleteOrCreate.pairInfos = [this.validateForm.value];
      this.formDeleteOrCreate.isDelete = false;
      this.formDeleteOrCreate.region = this.region;
      this.formDeleteOrCreate.vpcId = this.project;
      this.formDeleteOrCreate.customerId = this.userId;

      this.allowAddressPairService
        .createOrDelete(this.formDeleteOrCreate)
        .subscribe({
          next: (data) => {
            this.validateForm.reset();
            this.notification.success(
              '',
              this.i18n.fanyi('app.notify.create.allow.address.pair.success')
            );

            this.onOk.emit();
          },
          error: (e) => {
            this.validateForm.reset();
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notify.create.allow.address.pair.fail')
            );
            this.onOk.emit();
          },
        });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset();
  }
}
