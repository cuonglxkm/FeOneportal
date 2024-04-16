import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-delete-load-balancer',
  templateUrl: './delete-load-balancer.component.html',
  styleUrls: ['./delete-load-balancer.component.less'],
})
export class DeleteLoadBalancerComponent implements AfterViewInit{
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

  @ViewChild('loadBalancerInputName') loadBalancerInputName!: ElementRef<HTMLInputElement>;

  constructor(private notification: NzNotificationService,
              private loadBalancerService: LoadBalancerService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  onInput(value) {
    this.value = value
  }

  showModal() {
    this.isVisible = true
    setTimeout(() => {this.loadBalancerInputName?.nativeElement.focus()}, 1000)
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

  ngAfterViewInit() {
    this.loadBalancerInputName?.nativeElement.focus();
  }

}
