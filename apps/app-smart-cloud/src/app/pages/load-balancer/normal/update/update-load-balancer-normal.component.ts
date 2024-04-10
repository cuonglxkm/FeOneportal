import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-update-load-balancer-normal',
  templateUrl: './update-load-balancer-normal.component.html',
  styleUrls: ['./update-load-balancer-normal.component.less'],
})
export class UpdateLoadBalancerNormalComponent {
  @Input() loadBalancerId: number
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    nameVolume: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameVolume: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  constructor(private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              ) {
  }
  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {

  }


}
