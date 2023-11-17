import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SecurityGroupSearchCondition} from "../../../../shared/models/security-group";

@Component({
    selector: 'one-portal-create-security-group-inbound',
    templateUrl: './create-inbound.component.html',
    styleUrls: ['./create-inbound.component.less'],
})
export class CreateInboundComponent implements OnInit {
    @Input() disabled?: boolean
    @Input() condition: SecurityGroupSearchCondition
    @Output() onOk = new EventEmitter()
    @Output() onCancel = new EventEmitter()

    isVisible: boolean = false;

    showModal(): void {
        this.isVisible = true;
    }

    handleOk() {
        this.isVisible = false;
        this.onOk.emit();
    }

    handleCancel(): void {
        this.isVisible = false;
        this.onCancel.emit();
    }

    ngOnInit(): void {

    }
}
