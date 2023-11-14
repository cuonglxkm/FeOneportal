import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'one-portal-create-security-group-inbound',
    templateUrl: './create-inbound.component.html',
    styleUrls: ['./create-inbound.component.less'],
})
export class CreateInboundComponent implements OnInit {
  securityGroupId: string;
  constructor(private route: ActivatedRoute) {
  }

    ngOnInit(): void {
      this.route.queryParams.subscribe(queryParams => {
        const value = queryParams['param'];
        console.log('Received value:', value);
        this.securityGroupId = value;
      });
    }
}
