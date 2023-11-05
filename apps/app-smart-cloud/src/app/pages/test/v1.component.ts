import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import type { Chart } from '@antv/g2';
import { OnboardingService } from '@delon/abc/onboarding';
import { _HttpClient } from '@delon/theme';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-dashboard-v1',
  template: '<p>user-profile 2 works!</p>',
})
export class V1Component implements OnInit {
  constructor() {
  }



  ngOnInit(): void {
    // this.http.get('/chart').subscribe(res => {
    //   this.webSite = res.visitData.slice(0, 10);
    //   this.salesData = res.salesData;
    //   this.offlineChartData = res.offlineChartData;
    //   this.cdr.detectChanges();
    // });
  }
}
