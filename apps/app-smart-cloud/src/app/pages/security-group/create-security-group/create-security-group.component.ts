import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {SecurityGroupService} from "../../../shared/services/security-group.service";


@Component({
    selector: 'one-portal-create-security-group',
    templateUrl: './create-security-group.component.html',
    styleUrls: ['./create-security-group.component.less'],
})
export class CreateSecurityGroupComponent {
    @Input()  conditionSearch: SecurityGroupSearchCondition
    @Output() onOk = new EventEmitter()
    @Output() onCancel = new EventEmitter()

    isVisible: boolean = false;
    isLoading: boolean = false;

    validateForm: FormGroup<{
        name: FormControl<string>;
        description: FormControl<string>;
    }> = this.fb.group({
        name: ['', [Validators.required,
            Validators.maxLength(50),
            AppValidator.startsWithValidator('SG_')]],
        description: ['', [Validators.maxLength(500)]]
    });

    constructor(private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService,
                private securityGroupService: SecurityGroupService,) {
    }

    showModal(): void {
        this.isVisible = true;
    }

    handleCancel(): void {
        this.isVisible = false;
        this.validateForm.reset();
        this.onCancel.emit();
    }
    submitForm(): void {
        if (this.validateForm.valid) {
            this.isLoading = true;
            this.securityGroupService.create(this.validateForm.value, this.conditionSearch)
                .subscribe(data => {
                    this.notification.success('Thành công', 'Tạo Security Group thành công');
                    this.validateForm.reset();
                    this.isVisible = false;
                    this.isLoading = false;
                    this.onOk.emit(data);
                }, error => {
                    this.isLoading = false;
                    this.notification.error('Thất bại', 'Tạo Security Group thất bại');
                })
        }

    }
}
