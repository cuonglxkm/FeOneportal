import {Component} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';

@Component({
    selector: 'one-portal-create-security-group',
    templateUrl: './create-security-group.component.html',
    styleUrls: ['./create-security-group.component.less'],
})
export class CreateSecurityGroupComponent {

    validateForm: FormGroup<{
        name: FormControl<string>;
        desc: FormControl<string>;
    }>;

    submitForm(): void {
        if (this.validateForm.valid) {
            console.log('submit', this.validateForm.value);
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

    constructor(private fb: NonNullableFormBuilder, private _location: Location) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            desc: ['']
        });
    }


}
