import { ChangeDetectorRef, Component, ElementRef, Inject, NgZone, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Chart } from '@antv/g2';
import { _HttpClient } from '@delon/theme';
import { OnboardingService } from '@delon/abc/onboarding';
import { Platform } from '@angular/cdk/platform';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { G2MiniAreaData, G2MiniAreaModule } from '@delon/chart/mini-area';
import { format } from 'date-fns';

@Component({
  selector: 'kafka-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {

  webSite!: any[];
  salesData!: any[];
  offlineChartData!: any[];
  visitData: G2MiniAreaData[] = [];

  constructor(
    private http: _HttpClient,
    private cdr: ChangeDetectorRef,
    // private obSrv: OnboardingService,
    private platform: Platform,
    @Inject(DOCUMENT) private doc: NzSafeAny
  ) {
    // TODO: Wait for the page to load
    setTimeout(() => this.genOnboarding(), 1000);
  }

  fixDark(chart: Chart): void {
    if (!this.platform.isBrowser || (this.doc.body as HTMLBodyElement).getAttribute('data-theme') !== 'dark') return;

    chart.theme({
      styleSheet: {
        backgroundColor: 'transparent'
      }
    });
  }

  ngOnInit(): void {
    // this.http.get('/chart').subscribe(res => {
    //   this.webSite = res.visitData.slice(0, 10);
    //   this.salesData = res.salesData;
    //   this.offlineChartData = res.offlineChartData;
    //   this.cdr.detectChanges();
    // });
    const beginDay = new Date().getTime();
    for (let i = 0; i < 20; i += 1) {
      this.visitData.push({
        x: format(new Date(beginDay + 1000 * 60 * 60 * 24 * i), 'yyyy-MM-dd'),
        y: Math.floor(Math.random() * 100) + 10
      });
    }

    this.offlineChartData = [
      {
        "time": "2024-01-26T10:02:53.519Z",
        "y1": 29,
        "y2": 26,
        "_time": 1706263373519
      },
      {
        "time": "2024-01-26T10:32:53.519Z",
        "y1": 58,
        "y2": 41,
        "_time": 1706265173519
      },
      {
        "time": "2024-01-26T11:02:53.519Z",
        "y1": 28,
        "y2": 35,
        "_time": 1706266973519
      },
      {
        "time": "2024-01-26T11:32:53.519Z",
        "y1": 88,
        "y2": 95,
        "_time": 1706268773519
      },
      {
        "time": "2024-01-26T12:02:53.519Z",
        "y1": 62,
        "y2": 52,
        "_time": 1706270573519
      },
      {
        "time": "2024-01-26T12:32:53.519Z",
        "y1": 107,
        "y2": 100,
        "_time": 1706272373519
      },
      {
        "time": "2024-01-26T13:02:53.519Z",
        "y1": 70,
        "y2": 38,
        "_time": 1706274173519
      },
      {
        "time": "2024-01-26T13:32:53.519Z",
        "y1": 30,
        "y2": 26,
        "_time": 1706275973519
      },
      {
        "time": "2024-01-26T14:02:53.519Z",
        "y1": 74,
        "y2": 58,
        "_time": 1706277773519
      },
      {
        "time": "2024-01-26T14:32:53.519Z",
        "y1": 19,
        "y2": 16,
        "_time": 1706279573519
      },
      {
        "time": "2024-01-26T15:02:53.519Z",
        "y1": 57,
        "y2": 12,
        "_time": 1706281373519
      },
      {
        "time": "2024-01-26T15:32:53.519Z",
        "y1": 14,
        "y2": 71,
        "_time": 1706283173519
      },
      {
        "time": "2024-01-26T16:02:53.519Z",
        "y1": 53,
        "y2": 13,
        "_time": 1706284973519
      },
      {
        "time": "2024-01-26T16:32:53.519Z",
        "y1": 16,
        "y2": 53,
        "_time": 1706286773519
      },
      {
        "time": "2024-01-26T17:02:53.519Z",
        "y1": 51,
        "y2": 19,
        "_time": 1706288573519
      },
      {
        "time": "2024-01-26T17:32:53.519Z",
        "y1": 91,
        "y2": 109,
        "_time": 1706290373519
      },
      {
        "time": "2024-01-26T18:02:53.519Z",
        "y1": 10,
        "y2": 43,
        "_time": 1706292173519
      },
      {
        "time": "2024-01-26T18:32:53.519Z",
        "y1": 61,
        "y2": 32,
        "_time": 1706293973519
      },
      {
        "time": "2024-01-26T19:02:53.519Z",
        "y1": 47,
        "y2": 59,
        "_time": 1706295773519
      },
      {
        "time": "2024-01-26T19:32:53.519Z",
        "y1": 27,
        "y2": 18,
        "_time": 1706297573519
      }
    ];
    console.log('offlineChartData: ', this.offlineChartData);

  }

  private genOnboarding(): void {
    const KEY = 'on-boarding';
    if (!this.platform.isBrowser || localStorage.getItem(KEY) === '1') {
      return;
    }
    this.http.get(`./assets/tmp/on-boarding.json`).subscribe(res => {
      // this.obSrv.start(res);
      localStorage.setItem(KEY, '1');
    });
  }

  title = 'angular-with-g2';

}
