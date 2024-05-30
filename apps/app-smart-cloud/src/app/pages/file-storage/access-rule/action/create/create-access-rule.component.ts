import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NetWorkModel } from '../../../../../shared/models/vlan.model';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AccessRule, FormCreateAccessRule } from '../../../../../shared/models/access-rule.model';
import { AccessRuleService } from '../../../../../shared/services/access-rule.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { AppValidator } from '../../../../../../../../../libs/common-utils/src';

export function ipValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty values to allow optional fields
    }

    // Regular expression for IP and IP/Subnet
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
    // Regular expression for IP with subnet
    const subnetPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}\/([1-9]|[1-2][0-9]|3[0-2])$/;


    if (ipPattern.test(value)) {
      return validateOctets(value) ? null : { invalidIp: true };
    } else if (subnetPattern.test(value)) {
      const [ipPart, subnetPart] = value.split('/');
      return validateOctets(ipPart) && validateSubnet(ipPart, subnetPart) ? null : { invalidIp: true };
    }

    return { invalidIp: true };
  };
}

function validateOctets(ip: string): boolean {
  const octets = ip.split('.').map(Number);
  return octets.every(octet => octet >= 0 && octet <= 255);
}

function validateSubnet(ip: string, subnet: string): boolean {
  const subnetValue = Number(subnet);
  if(subnetValue === 16) {
    const octets = ip.split('.').map(Number);
    return octets[2] === 0 && octets[3] === 0;
  } else if (subnetValue === 24) {
    const octets = ip.split('.').map(Number);
    return octets[3] === 0;
  }
  return subnetValue >= 0 && subnetValue <= 32;
}
@Component({
  selector: 'one-portal-create-access-rule',
  templateUrl: './create-access-rule.component.html',
  styleUrls: ['./create-access-rule.component.less']
})
export class CreateAccessRuleComponent implements AfterViewInit{
  @Input() region: number;
  @Input() project: number;
  @Input() shareCloudId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  listAccessTo: string[] = []
  listAccessRule: AccessRule[] = []
  listNetwork: NetWorkModel[] = [];
  validateForm: FormGroup<{
    accessTo: FormControl<string>
    accessLevel: FormControl<string>
  }> = this.fb.group({
    accessTo: ['', [Validators.required,
      ipValidator(),
        this.duplicateNameValidator.bind(this)]],
    accessLevel: ['ro', [Validators.required]]
  });

  @ViewChild('accessToInput') accessToInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private accessRuleService: AccessRuleService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  ngAfterViewInit() {
    this.accessToInput?.nativeElement.focus()
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitForm();
    }
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.listAccessTo && this.listAccessTo.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  showModalCreate() {
    this.isVisible = true;
    this.getListAccessRule()
    setTimeout(() => {this.accessToInput?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.validateForm.reset();
    this.onCancel.emit();
  }

  getListAccessRule() {
    this.accessRuleService.getListAccessRule(this.shareCloudId, this.project, this.region, 9999, 1, null, null)
      .subscribe(data => {
        this.listAccessRule = data.records
        this.listAccessRule?.forEach(item => {
          this.listAccessTo?.push(item.access_to)
          console.log('list', this.listAccessTo)
        })
    })
  }
  submitForm() {
    if (this.validateForm.valid) {
      this.isLoading = true;
      let formCreate = new FormCreateAccessRule();
      formCreate.shareId = this.shareCloudId;
      formCreate.access_type = 'ip';
      formCreate.access_to = this.validateForm.controls.accessTo.value;
      formCreate.access_key = '';
      formCreate.access_level = this.validateForm.controls.accessLevel.value;
      formCreate.vpcId = this.project;
      formCreate.regionId = this.region;
      formCreate.customerId = this.tokenService.get()?.userId;

      this.accessRuleService.createAccessRule(formCreate).subscribe(data => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.file.system.access.to.create.success'));
        this.onOk.emit();

      }, error => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.system.access.to.create.fail ') + error.error.detail);
      });
      this.validateForm.reset();
    }

  }

}
