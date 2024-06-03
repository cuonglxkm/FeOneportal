import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
              private loadBalancerService: LoadBalancerService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
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
          this.isLoading = false
          this.isVisible = false
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.delete.load.balancer.success'))
          this.onOk.emit(data)
        this.value = null
      }, error => {
        console.log('error', error)
        this.isLoading = false
        this.isVisible = false
        // this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.delete.load.balancer.fail'))
        this.notification.error(this.i18n.fanyi('app.status.fail'), error?.error?.message == undefined ? this.i18n.fanyi('app.notification.delete.load.balancer.fail') : error?.error?.message)
        this.value = null
      })
    } else {
      this.isInput = true
      this.isLoading = false
      this.value = null
    }
  }

  ngAfterViewInit() {
    this.loadBalancerInputName?.nativeElement.focus();
  }

}
