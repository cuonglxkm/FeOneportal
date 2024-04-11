import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormSearchListBalancer, LoadBalancerModel } from '../../../../shared/models/load-balancer.model';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-update-load-balancer-normal',
  templateUrl: './update-load-balancer-normal.component.html',
  styleUrls: ['./update-load-balancer-normal.component.less'],
})
export class UpdateLoadBalancerNormalComponent {
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

  constructor(private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              private loadBalancerService: LoadBalancerService) {
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
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {

  }


}
