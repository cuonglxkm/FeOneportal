import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormCreateL7Rule } from '../../../../../../../shared/models/load-balancer.model';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-create-l7-rule',
  templateUrl: './create-l7-rule.component.html',
  styleUrls: ['./create-l7-rule.component.less']
})
export class CreateL7RuleComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() l7policyId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    invert: FormControl<boolean>
    type: FormControl<string>
    compareType: FormControl<string>
    key: FormControl<string>
    value: FormControl<string>
  }> = this.fb.group({
    invert: [false, [Validators.required]],
    type: [null as string, [Validators.required]],
    compareType: [null as string, [Validators.required]],
    key: [null as string],
    value: [null as string, [Validators.required]]
  });

  nameList: string[] = [];

  types = [
    { value: 'HOST_NAME', label: 'HOST_NAME' },
    { value: 'PATH', label: 'PATH' },
    { value: 'FILE_TYPE', label: 'FILE_TYPE' },
    { value: 'HEADER', label: 'HEADER' },
    { value: 'COOKIE', label: 'COOKIE' }
  ];

  compareTypes = [
    { value: 'REGEX', label: 'REGEX  ' },
    { value: 'STARTS_WITH', label: 'STARTS_WITH' },
    { value: 'ENDS_WITH', label: 'ENDS_WITH' },
    { value: 'CONTAINS', label: 'CONTAINS' },
    { value: 'EQUAL_TO', label: 'EQUAL_TO' }
  ];

  compareTypes1 = [
    { value: 'REGEX', label: 'REGEX  ' },
    { value: 'EQUAL_TO', label: 'EQUAL_TO' }
  ];


  @ViewChild('l7RuleInputName') l7RuleInputName!: ElementRef<HTMLInputElement>;

  constructor(private fb: NonNullableFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  onChangeSelected() {
    if (['HEADER', 'COOKIE'].includes(this.validateForm.controls.type.value)) {
      this.validateForm.controls.key.setValidators(Validators.required);
    } else {
      this.validateForm.controls.key.clearValidators()
      this.validateForm.controls.key.updateValueAndValidity()
    }
    this.validateForm.controls['compareType'].setValue(null as string);
  }

  showModal() {
    this.isVisible = true;
    setTimeout(() => {
      this.l7RuleInputName?.nativeElement.focus();
    }, 1000);


  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    // this.validateForm.controls['invert'].setValue(false);
    // this.validateForm.controls['type'].setValue(null as string);
    // this.validateForm.controls['compareType'].setValue(null as string);
    // this.validateForm.controls['key'].setValue(null as string);
    // this.validateForm.controls['value'].setValue(null as string);
    this.validateForm.reset();
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true
    if(this.validateForm.valid) {
      let formCreateL7Rule = new FormCreateL7Rule();
      formCreateL7Rule.key = this.validateForm.controls.key.value
      formCreateL7Rule.compareType = this.validateForm.controls.compareType.value
      formCreateL7Rule.invert = this.validateForm.controls.invert.value
      formCreateL7Rule.value = this.validateForm.controls.value.value
      formCreateL7Rule.type = this.validateForm.controls.type.value
      formCreateL7Rule.adminStateUp = true
      formCreateL7Rule.customerId = this.tokenService.get()?.userId
      formCreateL7Rule.l7PolicyId = this.l7policyId
      formCreateL7Rule.regionId = this.region
      formCreateL7Rule.vpcId = this.project

      this.loadBalancerService.createL7Rule(formCreateL7Rule)
        .pipe(finalize(() => {
          this.handleCancel();
        }))
        .subscribe(data => {
        this.isVisible = false
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.create.L7.rule.success'))
        this.onOk.emit(data)
      }, error =>  {
        this.isVisible = false
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.create.L7.rule.fail'))
        this.onOk.emit(error)
      })
    }
  }

  ngAfterViewInit() {
    this.l7RuleInputName?.nativeElement.focus();
  }
}
