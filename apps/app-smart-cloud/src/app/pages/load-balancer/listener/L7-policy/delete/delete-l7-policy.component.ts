import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
          this.notification.success('Thành công', 'Xóa L7 Policy thành công')
          this.onOk.emit(data)
        } else {
          console.log('data', data)
          this.isLoading = false
          this.isVisible = false
          this.notification.error('Thất bại', 'Xóa L7 Policy thất bại')
        }
      }, error => {
        console.log('error', error)
        this.isLoading = false
        this.isVisible = false
        this.notification.error('Thất bại', 'Xóa L7 Policy thất bại')
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
