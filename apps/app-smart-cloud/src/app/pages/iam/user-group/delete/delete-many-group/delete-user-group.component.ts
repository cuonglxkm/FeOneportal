import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'one-portal-delete-user-group',
  templateUrl: './delete-user-group.component.html',
  styleUrls: ['./delete-user-group.component.less'],
})
export class DeleteUserGroupComponent{
  @Input() items: any[]
  @Input() isVisible: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  value: string
  isLoading: boolean
  handleCancel(): void {
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
