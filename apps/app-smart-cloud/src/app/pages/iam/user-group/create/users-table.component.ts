import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserService} from "../../../../shared/services/user.service";
import {User} from "../../../../shared/models/user.model";
import {BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {NzTableQueryParams} from "ng-zorro-antd/table";

@Component({
    selector: 'one-portal-users-table',
    templateUrl: './users-table.component.html',
    styleUrls: ['./create-user-group.component.less'],
})
export class UsersTableComponent implements OnInit {
    @Output() listUsersSelected? = new EventEmitter<any>();

    value?: string;
    listOfCurrentPageData: readonly User[] = [];
    checked = false;
    indeterminate = false;
    setOfCheckedId = new Set<string>();
    listOfSelected: readonly any[] = []

    loading = false

    listUsers: User[] = []
    countGroup: number = 0

    response: BaseResponse<User[]>
    pageSize = 5
    pageIndex = 1

    constructor(private userService: UserService) {
    }

    onInputChange(value: string) {
        this.value = value;
    }

    onQueryParamsChange(params: NzTableQueryParams) {
        const {pageSize, pageIndex} = params
        this.pageSize = pageSize;
        this.pageIndex = pageIndex
        this.getUsers()
        this.refreshCheckedStatus()
    }

    refreshCheckedStatus(): void {
        const listOfEnabledData = this.listOfCurrentPageData;
        this.checked = listOfEnabledData.every(({userName}) => this.setOfCheckedId.has(userName));
        this.indeterminate = listOfEnabledData.some(({userName}) => this.setOfCheckedId.has(userName)) && !this.checked;
    }

    onAllChecked(checked: boolean): void {
        this.listOfCurrentPageData
            .forEach(({userName}) => this.updateCheckedSet(userName, checked));
        this.refreshCheckedStatus();
    }

    onItemChecked(userName: string, checked: boolean): void {
        this.updateCheckedSet(userName, checked);
        this.refreshCheckedStatus();
    }

    updateCheckedSet(userName: string, checked: boolean): void {
        if (checked) {
            this.setOfCheckedId.add(userName);
        } else {
            this.setOfCheckedId.delete(userName);
        }
        this.listOfSelected = this.listUsers.filter(data => this.setOfCheckedId.has(data.userName))
        console.log('user selected', this.listOfSelected)
        this.listUsersSelected.emit(this.listOfSelected)
    }

    getUsers() {
        this.loading = true
        this.userService.search('', this.pageSize, this.pageIndex).subscribe(data => {
            this.listUsers = data.records
            this.loading = false
            this.response = data
        }, error => {
            this.response = null
            this.listUsers = null
        })
    }

    ngOnInit(): void {
        this.pageSize = 5
        this.pageIndex = 1
        this.getUsers()
    }
}
