import {Component, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {FormSearchUserGroup} from "../../../../shared/models/user-group.model";

@Component({
    selector: 'one-portal-create-user-group',
    templateUrl: './create-user-group.component.html',
    styleUrls: ['./create-user-group.component.less'],
})
export class CreateUserGroupComponent implements OnInit {

    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));
    isLoading: boolean = false;

    validateForm: FormGroup<{
        name: FormControl<string>
        parent: FormControl<string>
    }>

    listGroupParent = []
    listGroupParentUnique = []
    formSearch: FormSearchUserGroup = new FormSearchUserGroup()


    constructor(
        private fb: NonNullableFormBuilder,
        private location: Location,
        private userGroupService: UserGroupService,
    ) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            parent: [null as string | null]
        });
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
    }

    getGroupParent() {
        this.userGroupService.search(this.formSearch).subscribe(data => {
            data.records.forEach(item => {
                if(this.listGroupParent.length > 0) {
                    this.listGroupParent.push(item.parent)
                } else {
                    this.listGroupParent = [item.parent]
                }
            })
            console.log('list data', this.listGroupParent)
            this.listGroupParentUnique = Array.from(new Set(this.listGroupParent))
        })
    }

    submitForm(): void {
        if (this.validateForm.valid) {
            console.log(this.validateForm.value);
        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
        }
    }


    ngOnInit(): void {
        this.getGroupParent()
    }

    goBack(): void {
        this.location.back();
    }


}
