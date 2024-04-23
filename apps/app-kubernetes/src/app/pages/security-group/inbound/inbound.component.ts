import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SecurityGroupService } from '../../../services/security-group.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs';
import SecurityGroupRule from '../../../model/security-group.model';

@Component({
  selector: 'one-portal-inbound',
  templateUrl: './inbound.component.html',
  styleUrls: ['./inbound.component.css'],
})
export class InboundComponent implements OnInit, OnChanges {

  @Input('listOfInbound') listOfInbound: SecurityGroupRule[];
  
  pageIndex: number;
  pageSize: number;
  total: number;

  isLoadingInbound: boolean;
  isShowModalCreateInbound: boolean;

  constructor(
    private sgService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.isLoadingInbound = false;
    this.isShowModalCreateInbound = false;
  }

  ngOnInit(): void {
      
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listOfInbound']?.currentValue) {
      this.listOfInbound = changes['listOfInbound']?.currentValue;
      console.log(this.listOfInbound);
    }
  }

  onQueryParamsChange(event: any) {

  }

  showModalCreateSG() {
    this.isShowModalCreateInbound = true;
  }

  handleCancelModalCreateSG() {
    this.isShowModalCreateInbound = false;
  }
  
}
