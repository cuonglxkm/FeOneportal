import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormDeleteUserGroups} from "../../../../../shared/models/user-group.model";
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
    selector: 'one-portal-delete-user-group',
    templateUrl: './delete-user-group.component.html',
    styleUrls: ['./delete-user-group.component.less'],
})
export class DeleteUserGroupComponent {
    @Input() items: any[]
    @Input() isVisible: boolean
    @Output() onCancel = new EventEmitter<void>()
    @Output() onOk = new EventEmitter<void>()

    value: string
    isLoading: boolean
    nameList: string[] = []

    constructor(private userGroupService: UserGroupService,
                private notification: NzNotificationService) {
    }

    handleCancel(): void {
        this.onCancel.emit();
    }

    handleOk(): void {
        if (this.value.includes('delete')) {
            this.items.forEach(item => {
                this.nameList?.push(item.name)
            })
            this.userGroupService.delete(this.nameList).subscribe(data => {
                this.notification.success('Thành công', 'Xóa User Group thành công')
                this.isLoading = false
                this.onOk.emit();
            }, error => {
                this.notification.error('Thất bại', 'Xóa User Group thất bại')
            })
        } else {
            this.isLoading = false
            this.notification.error('Thất bại', 'Không thể xóa User Group ')
        }
    }

    onInputChange() {
        console.log('input change', this.value)
    }


}
