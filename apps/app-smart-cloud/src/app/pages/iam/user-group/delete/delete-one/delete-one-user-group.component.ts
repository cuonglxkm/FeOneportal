import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormDeleteUserGroups} from "../../../../../shared/models/user-group.model";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
    selector: 'one-portal-delete-one-user-group',
    templateUrl: './delete-one-user-group.component.html',
    styleUrls: ['./delete-one-user-group.component.less'],
})
export class DeleteOneUserGroupComponent {
    @Input() nameGroup: any[]
    @Input() isVisible: boolean
    @Input() isLoading: boolean
    @Output() onCancel = new EventEmitter<void>()
    @Output() onOk = new EventEmitter<void>()

    value: string
    formDelete: FormDeleteUserGroups = new FormDeleteUserGroups()
    nameList: string[] = []

    constructor(private userGroupService: UserGroupService,
                private notification: NzNotificationService,
                @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    }

    handleCancel(): void {
        this.isVisible = false
        this.onCancel.emit();
    }

    handleOk(): void {
        this.isLoading = true
        console.log('name', this.nameGroup)
        console.log('name', this.nameGroup[0]?.name)
        if (this.nameGroup[0]?.name == this.value) {
            this.nameList.push(this.nameGroup[0].name)
            this.userGroupService.delete(this.nameList).subscribe(data => {
                this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.user-group.deleteOne.delete")+ ' ' + this.nameGroup[0]?.name + ' ' + this.i18n.fanyi("app.user-group.deleteOne.success"))
                this.isLoading = false
                this.onOk.emit();
            }, error => {
                this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user-group.deleteOne.delete")+ ' ' + this.nameGroup[0]?.name + ' ' + this.i18n.fanyi("app.user-group.deleteOne.fail"))
            })
        } else {
            this.isLoading = false
            this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user-group.deleteMany.fail2") + this.nameGroup)
        }
    }

    onInputChange() {
        console.log('input change', this.value)
    }
}
