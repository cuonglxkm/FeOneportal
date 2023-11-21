import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'delete-allow-address-pair',
  templateUrl: './delete-allow-address-pair.component.html',
  styleUrls: ['./delete-allow-address-pair.component.less'],
})
export class DeleteAllowAddressPairComponent {
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  modalStyle = {
    'height': '217px'
  };

  handleCancel(): void {
    this.onCancel.emit();
  }

  handleOk(): void {
    this.onOk.emit();
  }

}
