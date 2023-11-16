import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'delete-allow-address-pair',
    templateUrl: './delete-allow-address-pair.component.html',
    styleUrls: ['./delete-allow-address-pair.component.less'],
})
export class DeleteAllowAddressPairComponent {
    @Input() isVisible: boolean
    @Output() onCancel = new EventEmitter<void>()
    @Output() onOk = new EventEmitter<void>()

    isConfirmLoading = false;

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
