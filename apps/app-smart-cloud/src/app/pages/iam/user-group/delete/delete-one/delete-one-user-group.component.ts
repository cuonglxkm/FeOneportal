import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-delete-one-user-group',
  templateUrl: './delete-one-user-group.component.html',
  styleUrls: ['./delete-one-user-group.component.less'],
})
export class DeleteOneUserGroupComponent {
  @Input() nameGroup: string
  @Input() isVisible: boolean
  @Input() isLoading: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  value: string
  handleCancel(): void {
    this.isVisible = false
    this.onCancel.emit();
  }

  handleOk(): void {
    if(this.value.includes('delete')){

    }
    this.onOk.emit();
  }

  onInputChange() {
    console.log('input change', this.value)
  }
}
