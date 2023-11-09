import {Component} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {SecurityGroupService} from "../../../core/service/security-group.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {Router} from "@angular/router";

@Component({
    selector: 'one-portal-create-security-group',
    templateUrl: './create-security-group.component.html',
    styleUrls: ['./create-security-group.component.less'],
})
export class CreateSecurityGroupComponent {

    conditionSearch: SecurityGroupSearchCondition = {
        userId: 669,
        regionId: 3,
        projectId: 4079
    }

    validateForm: FormGroup<{
        name: FormControl<string>;
        description: FormControl<string>;
    }>;

    submitForm(): void {
        if (this.validateForm.valid) {
            this.securityGroupService.create(this.validateForm.value, this.conditionSearch).subscribe((data) => {
                this.message.create('success', `Đã thêm thành công`);
                this.router.navigate([
                    '/app-smart-cloud/security-group'
                ])
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

    goBack(): void {
        this._location.back();
    }

    constructor(private fb: NonNullableFormBuilder, private _location: Location, private router: Router, private securityGroupService: SecurityGroupService, private message: NzMessageService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['']
        });
    }


}
