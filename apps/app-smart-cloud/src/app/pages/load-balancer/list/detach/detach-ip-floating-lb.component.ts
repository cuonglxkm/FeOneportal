import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-detach-ip-floating-lb',
  templateUrl: './detach-ip-floating-lb.component.html',
  styleUrls: ['./detach-ip-floating-lb.component.less'],
})
export class DetachIpFloatingLbComponent implements AfterViewInit{
  @Input() region: number
  @Input() project: number
  @Input() IsFloatingIP: boolean
  @Input() ipFloatingAddress: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false
  isInput: boolean = false
  value: string

  @ViewChild('ipFloatingAddressInput') ipFloatingAddressInput!: ElementRef<HTMLInputElement>;
  constructor(private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  onInput(value) {
    this.value = value
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal() {
    this.isVisible = true
    setTimeout(() => {this.ipFloatingAddressInput?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {
    this.isLoading = true
    this.isLoading = true
    if (this.value == this.ipFloatingAddress) {
      this.isInput = false

    } else {
      this.isInput = true
      this.isLoading = false
    }
  }

  ngAfterViewInit() {
    this.ipFloatingAddressInput?.nativeElement.focus();
  }
}
