import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
@Component({
  selector: 'app-waf-dashboard',
  templateUrl: './waf-dash.component.html',
})

export class WafDash implements OnInit {
  options: EChartsOption;
  statusLoaded = false;
  cloudLoaded = false;
  constructor() {
    
  }
  ngOnInit() {
    
  }
  onTabChange(index: number): void {
      if (index == 1) {
        this.statusLoaded = true;
      }
      if (index == 2) {
        this.cloudLoaded = true;
      }
  }
}