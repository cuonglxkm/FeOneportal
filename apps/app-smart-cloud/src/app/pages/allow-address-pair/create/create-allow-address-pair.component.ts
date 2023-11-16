import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {AllowAddressPairCreateOrDeleteForm} from "../../../shared/models/allow-address-pair";
import {AppValidator} from "../../../../../../../libs/common-utils/src";

@Component({
    selector: 'create-allow-address-pair',
    templateUrl: './create-allow-address-pair.component.html',
    styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent implements OnInit {
    @Input() isVisible: boolean
    @Output() onCancel = new EventEmitter<void>()
    @Output() onOk = new EventEmitter()

    formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm;

    validateForm: FormGroup<{
        macAddress: FormControl<string>;
        ipAddress: FormControl<string>;
    }> = this.fb.group({
        macAddress: ['', [Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)]],
        ipAddress: ['', [Validators.required, AppValidator.ipWithCIDRValidator,
            Validators.pattern(/^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/)]],
    });

    constructor(private fb: NonNullableFormBuilder) {
    }

    submitForm(): void {
        if (this.validateForm.valid) {
            this.onOk.emit(this.validateForm.value);
        }

    }

    handleCancel(): void {
        this.validateForm.patchValue({
            ipAddress: '',
            macAddress: ''
        });
        this.onCancel.emit();
    }

    ngOnInit(): void {
    }
}
