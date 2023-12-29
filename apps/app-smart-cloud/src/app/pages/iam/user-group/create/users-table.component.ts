import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {UserService} from "../../../../shared/services/user.service";
import {User} from "../../../../shared/models/user.model";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
    selector: 'one-portal-users-table',
    templateUrl: './users-table.component.html',
    styleUrls: ['./create-user-group.component.less'],
})
export class UsersTableComponent implements OnInit {
    @Output() listUsersSelected = new EventEmitter<any>();

    value?: string;
    listOfCurrentPageData: readonly User[] = [];
    checked = false;
    indeterminate = false;
    setOfCheckedId = new Set<string>();
    listOfSelected: readonly any[] = []

    loading = false

    listUsers: User[] = []
    countGroup: number = 0

    constructor(private userService: UserService, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
    }

    onInputChange(value: string) {
        this.value = value;
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
        this.listUsersSelected.emit(this.listOfSelected)
    }

    getUsers() {
        this.loading = true
        this.userService.search('', 1000000, 1, this.tokenService.get()?.userId, this.tokenService.get()?.token).subscribe(data => {
            this.listUsers = data.records
            this.loading = false

        })
    }

    ngOnInit(): void {
        this.getUsers()
    }
}
