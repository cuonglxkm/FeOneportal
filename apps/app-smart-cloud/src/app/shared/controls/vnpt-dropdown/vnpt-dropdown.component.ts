import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PolicyService } from '../../../../../../../libs/common-utils/src/lib/services/policy.service';

@Component({
  selector: 'vnpt-dropdown',
  templateUrl: './vnpt-dropdown.component.html',
  styleUrls: ['./vnpt-dropdown.component.less'],
})
export class VnptDropdownComponent implements OnInit {
  @Input() isDisable = false;
  @Input() tooltip: string;
  @Input() suffixIcon: string;
  @Input() placeHolder: string;
  @Output() valueChanged = new EventEmitter();
  userSelected: any;
  datas: any[] = [];
  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    this.datas.push({
      id: user.userId,
      email: user.email,
      name: user.name,
    });

    if (localStorage.getItem('ShareUsers')) {
      this.datas = JSON.parse(localStorage.getItem('ShareUsers'));
      if (localStorage.getItem('UserRootId')) {
        this.userSelected = this.datas.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
          ? this.datas.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
          : { id: user.userId, email: user.email, name: user.name };
      } else {
        this.userSelected = this.datas[0];
        localStorage.setItem('UserRootId', JSON.stringify(user.userId));
      }
    } else {
      this.policyService.getShareUsers().subscribe(
        (data) => {
          if (data) {
            this.datas = this.datas.concat(
              data.filter((x) => x.id != user.userId)
            );
            localStorage.setItem('ShareUsers', JSON.stringify(this.datas));
            if (localStorage.getItem('UserRootId')) {
              this.userSelected = this.datas.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
                ? this.datas.find((x) => x.id == Number(localStorage.getItem('UserRootId')))
                : { id: user.userId, email: user.email, name: user.name };
            } else {
              this.userSelected = this.datas[0];
              localStorage.setItem(
                'UserRootId',
                JSON.stringify(this.userSelected.id)
              );
            }
          }
        },
        (error) => {
          this.datas = [];
        }
      );
    }
  }

  valueDataChange(user) {
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
