import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-delete-l7-policy',
  templateUrl: './delete-l7-policy.component.html',
  styleUrls: ['./delete-l7-policy.component.less']
})
export class DeleteL7PolicyComponent implements AfterViewInit {
  @Input() region: number
  @Input() project: number
  @Input() idL7: string
  @Input() L7Name: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false;
  isLoading: boolean = false;

  isInput: boolean =  false;

  value: string;

  @ViewChild('L7InputName') L7InputName!: ElementRef<HTMLInputElement>;

  constructor(private loadBalancerService: LoadBalancerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
    setTimeout(() => {this.L7InputName?.nativeElement.focus()}, 1000)
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
    if (this.value == this.L7Name) {
      this.isInput = false
      this.loadBalancerService.deleteL7Policy(this.idL7, this.region, this.project).subscribe(data => {
        if (data) {
          this.isLoading = false
          this.isVisible = false
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.delete.l7.policy.success'))
          this.onOk.emit(data)
        } else {
          console.log('data', data)
          this.isLoading = false
          this.isVisible = false
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.delete.l7.policy.fail'))
        }
      }, error => {
        console.log('error', error)
        this.isLoading = false
        this.isVisible = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.delete.l7.policy.fail'))
      })
    } else {
      this.isInput = true
      this.isLoading = false
    }
  }

  ngAfterViewInit(): void {
    this.L7InputName?.nativeElement.focus()
  }
}
