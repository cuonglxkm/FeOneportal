import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormCreateL7Rule } from '../../../../../../../shared/models/load-balancer.model';

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

  @ViewChild('l7RuleInputName') l7RuleInputName!: ElementRef<HTMLInputElement>;

  constructor(private fb: NonNullableFormBuilder,
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

      this.loadBalancerService.createL7Rule(formCreateL7Rule).subscribe(data => {
        this.isVisible = false
        this.isLoading = false
        this.notification.success('Thành công', 'Tạo mới L7 Rule thành công')
        this.onOk.emit(data)
      }, error =>  {
        this.isVisible = false
        this.isLoading = false
        this.notification.error('Thất bại', 'Tạo mới L7 Rule thất bại')
        this.onOk.emit(error)
      })
    }
  }

  ngAfterViewInit() {
    this.l7RuleInputName?.nativeElement.focus();
  }
}
