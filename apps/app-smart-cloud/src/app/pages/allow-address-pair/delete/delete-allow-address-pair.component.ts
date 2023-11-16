import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NzNotificationService} from "ng-zorro-antd/notification";
import {AllowAddressPairCreateOrDeleteForm} from "../../../shared/models/allow-address-pair";
import {AllowAddressPairService} from "../../../shared/services/allow-address-pair.service";

@Component({
    selector: 'delete-allow-address-pair',
    templateUrl: './delete-allow-address-pair.component.html',
    styleUrls: ['./delete-allow-address-pair.component.less'],
})
export class DeleteAllowAddressPairComponent {
    @Input() formDeletePair: AllowAddressPairCreateOrDeleteForm
    @Input() isVisible: boolean
    @Output() onCancel = new EventEmitter<void>()
    @Output() onOk = new EventEmitter<void>()

    isConfirmLoading = false;

  modalStyle = {
    'height': '217px'
  };

    constructor(private notification: NzNotificationService,
                private allowAddressPairService: AllowAddressPairService) {
    }

    handleCancel(): void {
        this.onCancel.emit();
    }

    handleOk(): void {
        console.log('form', this.formDeletePair)
        this.allowAddressPairService.createOrDelete(this.formDeletePair).subscribe(
            data => {
                this.notification.success('Thành công', `Xóa Allow Address Pair thành công`);

            },
            error => {
                this.notification.error('Thất bại', 'Xóa Allow Address Pair thất bại');
            }
        )
        this.onOk.emit();
    }

}
