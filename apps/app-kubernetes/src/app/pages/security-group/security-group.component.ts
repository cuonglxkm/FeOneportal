import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ClipboardService } from 'ngx-clipboard';
import { finalize } from 'rxjs';
import SecurityGroupRule, { SecurityGroup, SecurityGroupSearchCondition } from '../../model/security-group.model';
import { SecurityGroupService } from '../../services/security-group.service';

@Component({
  selector: 'security-group',
  templateUrl: './security-group.component.html',
  styleUrls: ['./security-group.component.css'],
})
export class SecurityGroupComponent implements OnInit, OnChanges {

  @Input('regionId') regionId: number;
  @Input('projectId') projectId: number;

  isLoadingSG: boolean;
  listOfSG: SecurityGroup[];
  listOfInbound: SecurityGroupRule[];
  listOfOutbound: SecurityGroupRule[];
  selectedSG: SecurityGroup;

  constructor(
    private clipboardService: ClipboardService,
    private securityGroupService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {}

  ngOnInit(): void {
    this.isLoadingSG = false;
    this.listOfSG = [];
    this.listOfInbound = [];
    this.listOfOutbound = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']?.currentValue) {
      this.projectId = changes['projectId'].currentValue;
    }

    if (changes['regionId']?.currentValue) {
      this.regionId = changes['regionId'].currentValue;
    }

    if (this.projectId && this.regionId) this.getListSG();
  }

  handleCopyIDGroup() {
    this.clipboardService.copy('123');
  }

  getListSG() {
    let conditionSearch = new SecurityGroupSearchCondition();
    conditionSearch.userId = this.tokenService.get()?.userId;
    conditionSearch.projectId = this.projectId;
    conditionSearch.regionId = this.regionId;

    this.securityGroupService.searchSecurityGroup(conditionSearch)
    .pipe(finalize(() => this.isLoadingSG = false))
    .subscribe(data => {
      this.listOfSG = data;

      data.forEach(item => {
        if(item.name.includes("default")) {
          this.selectedSG = item;
        }
      })

      this.listOfInbound = this.selectedSG.rulesInfo.filter(value => value.direction === 'ingress');
      this.listOfOutbound = this.selectedSG.rulesInfo.filter(value => value.direction === 'egress');
    });
  }

}
