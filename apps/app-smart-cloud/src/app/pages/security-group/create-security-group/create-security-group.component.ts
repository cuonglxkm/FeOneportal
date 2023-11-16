import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {SecurityGroupService} from "../../../shared/services/security-group.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {Router} from "@angular/router";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";


@Component({
    selector: 'one-portal-create-security-group-security-group',
    templateUrl: './create-security-group.component.html',
    styleUrls: ['./create-security-group.component.less'],
})
export class CreateSecurityGroupComponent implements OnInit{
    ngOnInit(): void {
        this.conditionSearch.projectId = 4079
        this.conditionSearch.regionId = 3
        this.conditionSearch.userId = this.tokenService.get()?.userId
    }

    conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();

    validateForm: FormGroup<{
        name: FormControl<string>;
        description: FormControl<string>;
    }>;

    submitForm(): void {
        if (this.validateForm.valid) {
            const formData = Object.assign(this.validateForm.value, {
                projectId: this.conditionSearch.projectId,
                regionId: this.conditionSearch.regionId,
                userId: this.conditionSearch.userId,
            })
            console.log("value", this.validateForm.value);
            this.securityGroupService.create(this.validateForm.value, this.conditionSearch)
                .subscribe((data) => {
                    // this.message.create('success', `Đã thêm thành công`);
                    this.notification.success('Thành công', 'Đã tạo Security Group thành công');
                    this.router.navigate([
                        '/app-smart-cloud/security-group'
                    ])
                }, error => {
                    this.notification.error('Thất bại', 'Tạo Security Group thất bại');
                })
        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
        }
    }

    regionChanged(region: RegionModel) {
        this.conditionSearch.regionId = region.regionId;
    }

    goBack(): void {
        this._location.back();
    }

    constructor(private fb: NonNullableFormBuilder,
                private _location: Location,
                private router: Router,
                private securityGroupService: SecurityGroupService,
                private message: NzMessageService,
                private notification: NzNotificationService,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(50),
                AppValidator.startsWithValidator('SG_')]],
            description: ['', [Validators.maxLength(500)]]
        });
    }
}
