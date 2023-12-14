import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionModel} from "../../../../../shared/models/region.model";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {PolicyService} from "../../../../../shared/services/policy.service";
import {PolicyModel} from "../../../../policy/policy.model";
import {FormSearchUserGroup} from "../../../../../shared/models/user-group.model";

@Component({
    selector: 'one-portal-create-policy',
    templateUrl: './create-policy.component.html',
    styleUrls: ['./create-policy.component.less'],
})
export class CreatePolicyComponent implements OnInit {
    nameGroup: string
    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));

    countPolicy: number

    value?: string
    checked = false;
    loading = false;
    indeterminate = false;

    listOfData: { last_activity: string; name: string; created_at: string; id: number; group: string }[] = [];
    listOfDataPolicies = []
    listOfCurrentPageData: readonly PolicyModel[] = [];
    setOfCheckedId = new Set<string>();
    expandSet = new Set<string>();

    listPolicies: PolicyModel[]

    formSearch: FormSearchUserGroup = new FormSearchUserGroup()

    constructor(private route: ActivatedRoute,
                private router: Router,
                private policyService: PolicyService) {
    }

    onExpandChange(name: string, checked: boolean): void {
        if (checked) {
            this.expandSet.add(name);
        } else {
            this.expandSet.delete(name);
        }
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

    onCurrentPageDataChange(listOfCurrentPageData: readonly PolicyModel[]): void {
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
            .forEach(({id}) => this.updateCheckedSet(id, checked));
        this.refreshCheckedStatus();
    }

    getPolicies() {
        this.loading = true
        this.formSearch.name = this.value
        this.policyService.getPolicy(this.formSearch).subscribe(data => {
            this.listPolicies = data.records
            this.countPolicy = data.totalCount
            this.loading = false
            console.log('data', this.listPolicies)
        })
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
    }

    create() {
    }

    ngOnInit(): void {
        this.nameGroup = this.route.snapshot.paramMap.get('groupName')
        console.log(this.nameGroup)
        this.getPolicies()
    }
}
