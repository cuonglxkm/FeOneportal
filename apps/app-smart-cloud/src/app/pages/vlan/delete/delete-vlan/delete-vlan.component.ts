import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VlanService } from '../../../../shared/services/vlan.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-delete-vlan',
  templateUrl: './delete-vlan.component.html',
  styleUrls: ['./delete-vlan.component.less']
})
export class DeleteVlanComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() id: number;
  @Input() nameNetwork: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisibleDelete: boolean = false;
  isLoadingDelete: boolean = false;

  value: string;
  isInput: boolean = false;
  @ViewChild('vlanNetworkInputName') vlanNetworkInputName!: ElementRef<HTMLInputElement>;

  constructor(private vlanService: VlanService,
              private notification: NzNotificationService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOkDelete();
    }
  }

  ngAfterViewInit(): void {
    this.vlanNetworkInputName?.nativeElement.focus()
  }

  onInput(value) {
    this.value = value;
  }

  showModalDelete() {
    this.isVisibleDelete = true;
    setTimeout(() => {
      this.vlanNetworkInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancelDelete() {
    this.isVisibleDelete = false
    this.isLoadingDelete = false
    this.isInput = false
    this.value = null
    this.onCancel.emit()
  }

  handleOkDelete() {
    this.isLoadingDelete = true
    if (this.value == this.nameNetwork) {
      this.isInput = false
      this.vlanService.deleteNetwork(this.id).subscribe(data => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.success('Thành công', 'Xoá Network thành công')
        this.value = null
        this.onOk.emit(data)
      }, error => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.error('Thất bại', 'Xoá Network thất bại')
        this.value = null
        this.onOk.emit()
      })
    } else {
      this.isInput = true
      this.isLoadingDelete = false
    }
  }
}
