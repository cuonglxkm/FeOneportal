import { Component, Inject, Input, OnInit } from '@angular/core';
import SecurityGroupRule, { SecurityGroupData } from '../../../model/security-group.model';
import { ShareService } from '../../../services/share.service';
import { SecurityGroupService } from '../../../services/security-group.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-outbound',
  templateUrl: './outbound.component.html',
  styleUrls: ['./outbound.component.css'],
})
export class OutboundComponent implements OnInit {

  listOfOutbound: SecurityGroupRule[];
  pageIndex: number;
  pageSize: number;
  total: number;

  regionId: number;
  projectId: number;
  securityGroupId: string;

  constructor(
    private sgService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.listOfOutbound = [];
    this.pageIndex = 1;
    this.pageSize = 5;
    this.total = 0;

    this.shareService.$securityGroupData.subscribe((sgData: SecurityGroupData) => {

    });
  }

  onQueryParamsChange(event) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
  }

  showModalCreateSG() {}
}
