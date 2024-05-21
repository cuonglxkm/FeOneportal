import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PolicyService } from '../../services/policy.service';

@Component({
  selector: 'share-users-combobox',
  templateUrl: './share-users-combobox.component.html',
  styleUrls: ['./share-users-combobox.component.less'],
})
export class ShareUsersComboboxComponent implements OnInit {
  @Input() isDisable = false;
  @Output() valueChanged = new EventEmitter();
  @Output() userChanged = new EventEmitter();
  userSelected: any;
  listUser: any[] = [];
  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    this.listUser.push({
      id: user.userId,
      email: user.email,
      name: user.name,
    });

    if (localStorage.getItem('ShareUsers')) {
      this.listUser = JSON.parse(localStorage.getItem('ShareUsers'));
      if (localStorage.getItem('UserRootId')) {
        this.userSelected = this.listUser.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
          ? this.listUser.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
          : { id: user.userId, email: user.email, name: user.name };
      } else {
        this.userSelected = this.listUser[0];
        localStorage.setItem('UserRootId', JSON.stringify(user.userId));
      }
    } else {
      this.policyService.getShareUsers().subscribe(
        (data) => {
          if (data) {
            this.listUser = this.listUser.concat(
              data.filter((x) => x.id != user.userId)
            );
            localStorage.setItem('ShareUsers', JSON.stringify(this.listUser));
            if (localStorage.getItem('UserRootId')) {
              this.userSelected = this.listUser.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
                ? this.listUser.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
                : { id: user.userId, email: user.email, name: user.name };
            } else {
              this.userSelected = this.listUser[0];
              localStorage.setItem(
                'UserRootId',
                JSON.stringify(this.userSelected.id)
              );
            }
          }
        },
        (error) => {
          this.listUser = [];
        }
      );
    }
  }

  shareUserChanged(user) {
    localStorage.setItem('UserRootId', JSON.stringify(user.id));
    localStorage.removeItem('projectId');
    localStorage.removeItem('projects');
    this.policyService
      .getUserPermissions()
      .pipe()
      .subscribe((permission) => {
        localStorage.setItem('PermissionOPA', JSON.stringify(permission));
        window.location.reload();
        this.valueChanged.emit(user);
      });
  }
}
