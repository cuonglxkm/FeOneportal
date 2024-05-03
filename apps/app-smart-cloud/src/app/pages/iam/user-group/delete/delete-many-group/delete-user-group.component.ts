import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {FormDeleteUserGroups} from "../../../../../shared/models/user-group.model";
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
                private notification: NzNotificationService,
                @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
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
                this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.user-group.deleteMany.success"))
                this.isLoading = false
                this.onOk.emit();
            }, error => {
                this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user-group.deleteMany.fail"))
            })
        } else {
            this.isLoading = false
            this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user-group.deleteMany.fail2"))
        }
    }

    onInputChange() {
        console.log('input change', this.value)
    }


}
