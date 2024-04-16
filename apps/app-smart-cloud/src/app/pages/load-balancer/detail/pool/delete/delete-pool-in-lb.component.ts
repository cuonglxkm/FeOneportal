import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-delete-pool-in-lb',
  templateUrl: './delete-pool-in-lb.component.html',
  styleUrls: ['./delete-pool-in-lb.component.less'],
})
export class DeletePoolInLbComponent implements AfterViewInit{
  @Input() region: number
  @Input() project: number
  @Input() poolId: string
  @Input() loadBlancerId: number
  @Input() listenerId: string
  @Input() namePool: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  value: string

  isInput: boolean = false

  @ViewChild('poolInputName') poolInputName!: ElementRef<HTMLInputElement>;

  constructor(private notification: NzNotificationService,
              private loadBalancerService: LoadBalancerService) {
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
    setTimeout(() => {this.poolInputName?.nativeElement.focus()}, 1000)
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
    if (this.value == this.namePool) {
      this.isInput = false
      this.loadBalancerService.deletePool(this.poolId, this.region, this.project).subscribe(data => {
        if (data) {
          this.isLoading = false
          this.isVisible = false
          this.notification.success('Thành công', 'Xóa Pool thành công')
          this.onOk.emit(data)
        } else {
          console.log('data', data)
          this.isLoading = false
          this.isVisible = false
          this.notification.error('Thất bại', 'Xóa Pool thất bại')
        }
      }, error => {
        console.log('error', error)
        this.isLoading = false
        this.isVisible = false
        this.notification.error('Thất bại', 'Xóa Pool thất bại')
      })
    } else {
      this.isInput = true
      this.isLoading = false
    }
  }
  ngAfterViewInit() {
    this.poolInputName?.nativeElement.focus();
  }

}
