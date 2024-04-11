import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-delete-load-balancer',
  templateUrl: './delete-load-balancer.component.html',
  styleUrls: ['./delete-load-balancer.component.less'],
})
export class DeleteLoadBalancerComponent {
  @Input() idLoadBalancer: number
  @Input() nameLoadBalancer: string
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  value: string
  isInput: boolean = false

  constructor(private notification: NzNotificationService,
              private loadBalancerService: LoadBalancerService) {
  }

  onInput(value) {
    this.value = value
  }

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.isInput = false
    this.value = null
    this.onCancel.emit()
  }

  handleOk() {
    this.isLoading = true
    if (this.value == this.nameLoadBalancer) {
      this.isInput = false
      this.loadBalancerService.deleteLoadBalancer(this.idLoadBalancer).subscribe(data => {
        if (data) {
          this.isLoading = false
          this.isVisible = false
          this.notification.success('Thành công', 'Xóa Load Balancer thành công')
          this.onOk.emit(data)
        } else {
          console.log('data', data)
          this.isLoading = false
          this.isVisible = false
          this.notification.error('Thất bại', 'Xóa Load Balancer thất bại')
        }
      }, error => {
        console.log('error', error)
        this.isLoading = false
        this.isVisible = false
        this.notification.error('Thất bại', 'Xóa Load Balancer thất bại')
      })
    } else {
      this.isInput = true
      this.isLoading = false
    }
  }

}
