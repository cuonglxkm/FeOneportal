import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormSearchListBalancer, FormUpdateLB, LoadBalancerModel } from '../../../../shared/models/load-balancer.model';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { OrderService } from '../../../../shared/services/order.service';

@Component({
  selector: 'one-portal-update-load-balancer-normal',
  templateUrl: './update-load-balancer-normal.component.html',
  styleUrls: ['./update-load-balancer-normal.component.less'],
})
export class UpdateLoadBalancerNormalComponent implements AfterViewInit{
  // @Input() loadBalancerId: number
  @Input() region: number
  @Input() project: number
  @Input() loadBalancer: LoadBalancerModel
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    nameLoadBalancer: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameLoadBalancer: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(70),
      this.duplicateNameValidator.bind(this)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  nameList: string[] = [];

  @ViewChild('loadBalancerInputName') loadBalancerInputName!: ElementRef<HTMLInputElement>;

  constructor(private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              private orderService : OrderService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private loadBalancerService: LoadBalancerService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
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

  getListLoadBalancer() {
    let formSearchLB = new FormSearchListBalancer()
    formSearchLB.regionId = this.region
    formSearchLB.currentPage = 1
    formSearchLB.pageSize = 9999
    formSearchLB.vpcId = this.project
    formSearchLB.isCheckState = true
    this.loadBalancerService.search(formSearchLB).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item?.name)

        this.nameList = this.nameList?.filter(item => item !==  this.validateForm.get('nameLoadBalancer').getRawValue());
      })
    })
  }

  showModal() {
    this.isVisible = true
    this.getListLoadBalancer()
    this.validateForm.get('nameLoadBalancer').setValue(this.loadBalancer?.name)
    this.validateForm.get('description').setValue(this.loadBalancer?.description)

    setTimeout(() => {this.loadBalancerInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {
    this.isLoading = true
    let formUpload = new FormUpdateLB()
    formUpload.id = this.loadBalancer.id
    formUpload.name = this.validateForm.controls.nameLoadBalancer.value
    formUpload.description = this.validateForm.controls.description.value
    formUpload.customerId = this.loadBalancer.customerId
    formUpload.offerId = this.loadBalancer.offerId
    this.loadBalancerService.updateLoadBalancer(formUpload).subscribe(data => {
      this.isLoading = false
      this.isVisible = false
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.update.LB.info.success'))
      this.onOk.emit(data)
    }, error => {
      this.isLoading = false
      this.isVisible = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.update.LB.info.fail'))
    })

  }

  ngAfterViewInit() {
    this.loadBalancerInputName?.nativeElement.focus();
  }

}
