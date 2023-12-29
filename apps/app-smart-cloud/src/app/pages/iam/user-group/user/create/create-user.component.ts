import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionModel} from "../../../../../shared/models/region.model";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {UserService} from "../../../../../shared/services/user.service";
import {User} from "../../../../../shared/models/user.model";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

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

    listOfCurrentPageData: readonly User[] = [];
    setOfCheckedId: Set<string> = new Set<string>();

    listUsers: User[]


    constructor(private route: ActivatedRoute,
                private router: Router,
                private userService: UserService, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
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

    onCurrentPageDataChange(listOfCurrentPageData: readonly User[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        this.refreshCheckedStatus();
    }

    refreshCheckedStatus(): void {
        const listOfEnabledData = this.listOfCurrentPageData;
        this.checked = listOfEnabledData.every(({userName}) => this.setOfCheckedId.has(userName));
        this.indeterminate = listOfEnabledData.some(({userName}) => this.setOfCheckedId.has(userName)) && !this.checked;
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
            .forEach(({userName}) => this.updateCheckedSet(userName, checked));
        this.refreshCheckedStatus();
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
    }

    getUsers() {
        this.loading = true
        this.userService.search('', 1000000, 1, this.tokenService.get()?.userId, this.tokenService.get()?.token).subscribe(data => {
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
