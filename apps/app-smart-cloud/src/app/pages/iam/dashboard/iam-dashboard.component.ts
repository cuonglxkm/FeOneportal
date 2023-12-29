import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {FormSearchUserGroup, UserGroupModel} from "../../../shared/models/user-group.model";
import {User} from "../../../shared/models/user.model";
import {UserGroupService} from "../../../shared/services/user-group.service";
import Pagination from "../../../shared/models/pagination";
import {UserService} from "../../../shared/services/user.service";
import {BaseResponse} from "../../../../../../../libs/common-utils/src";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

export class Count {
    count_group: number
    count_user: number
}
@Component({
    selector: 'one-portal-iam-dashboard',
    templateUrl: './iam-dashboard.component.html',
    styleUrls: ['./iam-dashboard.component.less'],
})
export class IamDashboardComponent implements OnInit{
    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));

    loading: boolean = false
    // count_group: number = 0
    // count_user: number = 0

    listUsers: BaseResponse<User>

    listOfData: Count[] = []

    count: Count = new Count()
    constructor(private userGroupService: UserGroupService,
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

    ngOnInit(): void {
        this.loading = true
        this.userGroupService.search(new FormSearchUserGroup()).subscribe(data => {
            console.log('data', data)
            this.count.count_group = data.totalCount
            console.log('count', this.count
            )
            this.userService.search('', 100000, 1).subscribe(data => {
                this.listUsers = data
                this.count.count_user = this.listUsers.totalCount
            })
            console.log('this.listOfData', this.count)
            if(this.listOfData.length > 0){
                this.listOfData.push(this.count)
            } else {
                this.listOfData = [this.count]
            }
            this.loading = false
        })

    }
}
