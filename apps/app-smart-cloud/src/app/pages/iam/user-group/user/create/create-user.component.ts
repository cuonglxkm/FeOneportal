import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionModel} from "../../../../../shared/models/region.model";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {UserService} from "../../../../../shared/services/user.service";
import {UserModel} from "../../../../../../../../../libs/common-utils/src";
import {User} from "../../../../../shared/models/user.model";

@Component({
    selector: 'one-portal-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.less'],
})
export class CreateUserComponent implements OnInit {
    nameGroup: string
    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));

    value?: string
    checked = false;
    loading = false;
    indeterminate = false;

    listOfCurrentPageData: readonly UserModel[] = [];
    setOfCheckedId: Set<string> = new Set<string>();

    listUsers: User[]


    constructor(private route: ActivatedRoute,
                private router: Router,
                private userService: UserService) {
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
        // this.formSearch.regionId = this.region
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
        // this.formSearch.project = this.project
    }

    onInputChange(value: string) {
        this.value = value;
        console.log('input text: ', this.value)
    }

    onCurrentPageDataChange(listOfCurrentPageData: readonly UserModel[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        this.refreshCheckedStatus();
    }

    refreshCheckedStatus(): void {
        const listOfEnabledData = this.listOfCurrentPageData;
        this.checked = listOfEnabledData.every(({name}) => this.setOfCheckedId.has(name));
        this.indeterminate = listOfEnabledData.some(({name}) => this.setOfCheckedId.has(name)) && !this.checked;
    }

    updateCheckedSet(name: string, checked: boolean): void {
        if (checked) {
            this.setOfCheckedId.add(name);
        } else {
            this.setOfCheckedId.delete(name);
        }
    }

    onItemChecked(name: string, checked: boolean): void {
        this.updateCheckedSet(name, checked);
        this.refreshCheckedStatus();
    }

    onAllChecked(checked: boolean): void {
        this.listOfCurrentPageData
            .forEach(({name}) => this.updateCheckedSet(name, checked));
        this.refreshCheckedStatus();
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
    }

    getUsers() {
        this.loading = true
        this.userService.getUsers().subscribe(data => {
            this.listUsers = data.records
            this.loading = false
            this.loading = false
            console.log('data', this.listUsers)
        })
    }

    create() {
    }

    ngOnInit(): void {
        this.nameGroup = this.route.snapshot.paramMap.get('groupName')
        console.log(this.nameGroup)

        this.getUsers()
    }
}
