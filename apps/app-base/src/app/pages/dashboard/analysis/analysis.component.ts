import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';

import { Chart } from '@antv/g2';
import { Pie, RingProgress, TinyColumn, TinyArea, Progress } from '@antv/g2plot';
import { legend } from '@antv/g2plot/lib/adaptor/common';
import { TranslateService } from '@ngx-translate/core';
import { addDays, endOfMonth, endOfWeek, endOfYear, format, getMonth, getYear, isToday, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { values } from 'lodash';
import { inNextTick } from 'ng-zorro-antd/core/util';

interface DataItem {
  sort: number;
  key: string;
  user_num: number;
  growth: number;
  status: number
}

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisComponent implements OnInit, AfterViewInit {
  dateType = 'day';
  date = [new Date(), new Date()];
  type = 'all';

  cardPadding = { padding: '20px 24px 8px' };
  miniBarData = [497, 666, 219, 269, 274, 337, 81, 497, 666, 219, 269];
  miniAreaData = [264, 274, 284, 294, 284, 274, 264, 264, 274, 264, 264, 264, 284, 264, 254, 264, 244, 340, 264, 243, 226, 192];
  histogramData = [
    { type: 'January', value: 769 },
    { type: 'February', value: 769 },
    { type: 'March', value: 861 },
    { type: 'April', value: 442 },
    { type: 'May', value: 555 },
    { type: 'June', value: 439 },
    { type: 'July', value: 590 },
    { type: 'August', value: 434 },
    { type: 'September', value: 843 },
    { type: 'October', value: 840 },
    { type: 'November', value: 769 },
    { type: 'December', value: 769 }
  ];
  ringData = [
    { type: 'Category 1', value: 27 },
    { type: 'Category 2', value: 25 },
    { type: 'Category 3', value: 18 },
    { type: 'Category 4', value: 15 },
    { type: 'Category 5', value: 10 },
    { type: 'Other', value: 5 }
  ];
  saleTypeData = [
    { id: 1, type: 'Elit mauris', value: 4544, percent: '28.79%', checked: true, color: '#5DB1FF' },
    { id: 2, type: 'Mauris non', value: 3321, percent: '21.04%', checked: true, color: '#36CBCB' },
    { id: 3, type: 'Egestas facilisis', value: 3113, percent: '19.73%', checked: true, color: '#4ECB73' },
    { id: 4, type: 'Tellus, at', value: 2341, percent: '14.83%', checked: true, color: '#FBD437' },
    { id: 5, type: 'Pharetra, donec', value: 1231, percent: '7.80%', checked: true, color: '#F2637B' },
    { id: 6, type: 'Aliquam amet', value: 1231, percent: '7.80%', checked: true, color: '#975FE5' },
  ];

  listOfColumn = [
    {
      title: 'Rank',
      compare: null,
      priority: false
    },
    {
      title: 'Keyword',
      compare: (a: DataItem, b: DataItem) => a.sort - b.sort,
      priority: 3
    },
    {
      title: 'Users',
      compare: (a: DataItem, b: DataItem) => a.user_num - b.user_num,
      priority: 2
    },
    {
      title: 'Weekly Range',
      compare: (a: DataItem, b: DataItem) => a.growth - b.growth,
      priority: 1
    }
  ];
  listOfData: DataItem[] = [];

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone, private translate: TranslateService) { }

  ngOnInit(): void {
    for (let i = 1; i < 51; i++) {
      this.listOfData.push({
        sort: i,
        key: 'John Brown',
        user_num: Math.ceil(Math.random() * 1000),
        growth: Math.ceil(Math.random() * 100),
        status: Math.round(Math.random())
      });
    }
  }

  initMinibar(): void {
    const year = getYear(new Date());
    const month = getMonth(new Date());
    const data = [
      { day: year + '-' + (month + 1) + '-01', value: 7 },
      { day: year + '-' + (month + 1) + '-02', value: 5 },
      { day: year + '-' + (month + 1) + '-03', value: 4 },
      { day: year + '-' + (month + 1) + '-04', value: 2 },
      { day: year + '-' + (month + 1) + '-05', value: 4 },
      { day: year + '-' + (month + 1) + '-06', value: 7 },
      { day: year + '-' + (month + 1) + '-07', value: 5 },
      { day: year + '-' + (month + 1) + '-08', value: 6 },
      { day: year + '-' + (month + 1) + '-09', value: 5 },
      { day: year + '-' + (month + 1) + '-10', value: 9 },
      { day: year + '-' + (month + 1) + '-11', value: 6 },
      { day: year + '-' + (month + 1) + '-12', value: 3 },
      { day: year + '-' + (month + 1) + '-13', value: 1 },
      { day: year + '-' + (month + 1) + '-14', value: 5 },
      { day: year + '-' + (month + 1) + '-15', value: 3 },
      { day: year + '-' + (month + 1) + '-16', value: 6 },
      { day: year + '-' + (month + 1) + '-17', value: 5 },
    ];

    const miniChart = new Chart({
      container: 'miniBar',
      autoFit: true,
      height: 32,
      width: 200,
      options: {
        data,
        tooltip: { showTitle: false },
        legends: false
      }
    })
    miniChart.axis('value', { grid: null, label: null })
    miniChart.axis('day', { line: null, tickLine: null, label: null })
    miniChart.interval().position('day*value').color('day', (val) => { return '#58AFFF' })
    miniChart.render()

    // const data = this.miniBarData;
    // const tinyColumn = new TinyColumn('miniBar', {
    //   autoFit: true,
    //   height: 14,
    //   width: 200,
    //   data
    // });

    // tinyColumn.render();
  }

  initMiniArea(): void {
    const year = getYear(new Date());
    const month = getMonth(new Date());
    const data = [
      { day: year + '-' + (month + 1) + '-01', value: 7 },
      { day: year + '-' + (month + 1) + '-02', value: 5 },
      { day: year + '-' + (month + 1) + '-03', value: 4 },
      { day: year + '-' + (month + 1) + '-04', value: 2 },
      { day: year + '-' + (month + 1) + '-05', value: 4 },
      { day: year + '-' + (month + 1) + '-06', value: 7 },
      { day: year + '-' + (month + 1) + '-07', value: 5 },
      { day: year + '-' + (month + 1) + '-08', value: 6 },
      { day: year + '-' + (month + 1) + '-09', value: 5 },
      { day: year + '-' + (month + 1) + '-10', value: 9 },
      { day: year + '-' + (month + 1) + '-11', value: 6 },
      { day: year + '-' + (month + 1) + '-12', value: 3 },
      { day: year + '-' + (month + 1) + '-13', value: 1 },
      { day: year + '-' + (month + 1) + '-14', value: 5 },
      { day: year + '-' + (month + 1) + '-15', value: 3 },
      { day: year + '-' + (month + 1) + '-16', value: 6 },
      { day: year + '-' + (month + 1) + '-17', value: 5 },
    ];

    const miniChart = new Chart({
      container: 'miniArea',
      autoFit: true,
      height: 32,
      width: 200,
      options: {
        data,
        // scales: ({}),
        tooltip: ({ showTitle: false }),
        legends: false,
      },
    })
    miniChart.axis('value', { grid: null, label: null })
    miniChart.axis('day', { line: null, tickLine: null, label: null })
    miniChart.area().shape('smooth').position('day*value').color('value', ['#975FE4'])
    miniChart.render()

    // const data = this.miniAreaData;
    // const tinyArea = new TinyArea('miniArea', {
    //   autoFit: true,
    //   height: 14,
    //   width: 200,
    //   data,
    //   smooth: true,
    //   areaStyle: {
    //     fill: '#d6e3fd' // #975FE4
    //   }
    // });

    // tinyArea.render();
  }

  initProgress(): void {

    // const progress = new Progress('progress', {
    //   height: 14,
    //   width: 200,
    //   autoFit: true,
    //   percent: 0.7,
    //   color: ['#5B8FF9', '#E8EDF3']
    // });

    // progress.render();
  }

  initHistogram(): void {
    const chart = new Chart({
      container: 'histogram',
      autoFit: true,
      height: 295,
      padding: [40, 40, 32, 72]
    });
    chart.data(this.histogramData);
    chart.scale('value', {
      nice: true
    });
    chart.axis('type', {
      tickLine: null
    });

    chart.axis('value', {
      label: {
        formatter: val => {
          return +val;
        }
      }
    });

    chart.tooltip({
      showMarkers: false
    });
    chart.interaction('element-active');

    chart.legend(false);
    chart
      .interval()
      .position('type*value')
      .color('type', val => {
        if (val === '10-30分' || val === '30+分') {
          return '#ff4d4f';
        }
        return '#2194ff';
      })
      .label('value', {
        offset: 10
      });
    chart.render();
  }

  initSearchArea(): void {
    const year = getYear(new Date());
    const month = getMonth(new Date());
    const data = [
      { day: year + '-' + (month + 1) + '-01', value: 1 },
      { day: year + '-' + (month + 1) + '-02', value: 6 },
      { day: year + '-' + (month + 1) + '-03', value: 4 },
      { day: year + '-' + (month + 1) + '-04', value: 8 },
      { day: year + '-' + (month + 1) + '-05', value: 3 },
      { day: year + '-' + (month + 1) + '-06', value: 7 },
      { day: year + '-' + (month + 1) + '-07', value: 2 },
    ];

    const miniChart = new Chart({
      container: 'searchUserChart',
      autoFit: true,
      height: 35,
      options: {
        data,
        tooltip: { showTitle: false },
        legends: false
      }
    })
    miniChart.axis('value', { grid: null, label: null })
    miniChart.axis('day', { line: null, tickLine: null, label: null })
    miniChart.area().shape('smooth').position('day*value').color('value', '#148BFF')
    miniChart.line().shape('smooth').position('day*value').color('value', '#148BFF')
    miniChart.render()

    // const data = this.miniAreaData;
    // const tinyArea = new TinyArea('searchUserChart', {
    //   autoFit: true,
    //   height: 30,
    //   data,
    //   smooth: true,
    //   areaStyle: {
    //     fill: '#d6e3fd'
    //   }
    // });
    // tinyArea.render();
  }

  initSearchAvgArea(): void {
    const year = getYear(new Date());
    const month = getMonth(new Date());
    const data = [
      { day: year + '-' + (month + 1) + '-01', value: 1 },
      { day: year + '-' + (month + 1) + '-02', value: 6 },
      { day: year + '-' + (month + 1) + '-03', value: 4 },
      { day: year + '-' + (month + 1) + '-04', value: 8 },
      { day: year + '-' + (month + 1) + '-05', value: 3 },
      { day: year + '-' + (month + 1) + '-06', value: 7 },
      { day: year + '-' + (month + 1) + '-07', value: 2 },
    ];

    const miniChart = new Chart({
      container: 'searchUserAvgChart',
      autoFit: true,
      height: 32,
      options: {
        data,
        tooltip: { showTitle: false },
        legends: false
      }
    })
    miniChart.axis('value', { grid: null, label: null })
    miniChart.axis('day', { line: null, tickLine: null, label: null })
    miniChart.area().shape('smooth').position('day*value').color('value', '#148BFF')
    miniChart.line().shape('smooth').position('day*value').color('value', '#148BFF')
    miniChart.render()

    // const data = this.miniAreaData;
    // const tinyArea = new TinyArea('searchUserAvgChart', {
    //   autoFit: true,
    //   height: 30,
    //   data,
    //   smooth: true,
    //   areaStyle: {
    //     fill: '#d6e3fd'
    //   }
    // });
    // tinyArea.render();
  }

  initRing(): void {
    const saleTypeChart = new Chart({
      container: 'ringPie',
      autoFit: true,
      height: 248,
      options: {
        data: this.saleTypeData,
        tooltip: { showTitle: false }
      }
    })

    saleTypeChart.legend({
      custom: true,
      useHtml: true,
      flipPage: false,
      position: "right",
      padding: [20, 40, 20, 40],
      items: this.saleTypeData.map(item => ({
        value: item.type,
        name: `${item.type}  ${item.percent} $ ${item.value}`,
        marker: { symbol: 'circle', style: { fill: item.color, r: 5 } }
      }))
    })
    saleTypeChart.coordinate('theta', { radius: 0.75, innerRadius: 0.725 })
    saleTypeChart.interval().adjust('stack')
      .position('value')
      .color('type*color', (type, color) => { return color })
      .shape('slice-shape')
      .tooltip('type*percent', (type, percent) => { return { name: type, value: percent } })
    saleTypeChart.interaction('element-single-selected')
    saleTypeChart.annotation().text({
      position: ['50%', '50%'],
      content: `Sales:\n\n$ 15781`,
      style: {
        textAlign: 'center',
      },
    })

    saleTypeChart.render()




    // const tinyArea = new Pie('ringPie', {
    //   appendPadding: 10,
    //   data: this.saleTypeData,
    //   angleField: 'value',
    //   colorField: 'type',
    //   radius: 1,
    //   innerRadius: 0.64,
    //   meta: {
    //     value: {
    //       formatter: v => `$ ${v}`
    //     }
    //   },
    //   label: {
    //     type: 'inner',
    //     offset: '-50%',
    //     style: {
    //       textAlign: 'center'
    //     },
    //     autoRotate: false,
    //     content: '{value}'
    //   },
    //   statistic: {},
    //   // add central statistics text interaction
    //   interactions: [{ type: 'element-selected' }, { type: 'element-active' }, { type: 'pie-statistic-active' }]
    // });
    // tinyArea.render();
  }



  ngAfterViewInit(): void {
    inNextTick().subscribe(() => {
      this.ngZone.runOutsideAngular(() => {
        this.initMinibar();
        this.initMiniArea();
        this.initProgress();
        this.initHistogram();
        this.initSearchArea();
        this.initSearchAvgArea();
        this.initRing();
      });
    });
  }

  changeDateType(value: any) {
    this.dateType = value;
    switch (value) {
      case 'day':
        this.date = [new Date(), new Date()];
        break;
      case 'week':
        this.date = [addDays(startOfWeek(new Date()), 1), addDays(endOfWeek(new Date()), 1)];
        break;
      case 'month':
        this.date = [startOfMonth(new Date()), endOfMonth(new Date())];
        break;
      case 'year':
        this.date = [startOfYear(new Date()), endOfYear(new Date())];
        break;
    }
  }

  onChangeDate($event: any) {
    if ($event.length > 0) {
      if (isToday($event[0]) && isToday($event[1])) {
        this.dateType = 'day';
      } else if ((format($event[0], 'yyyy-MM-dd') === format(addDays(startOfWeek(new Date()), 1), 'yyyy-MM-dd'))
        && (format($event[1], 'yyyy-MM-dd') === format(addDays(endOfWeek(new Date()), 1), 'yyyy-MM-dd'))) {
        this.dateType = 'week';
      } else if ((format($event[0], 'yyyy-MM-dd') === format(startOfMonth(new Date()), 'yyyy-MM-dd'))
        && (format($event[1], 'yyyy-MM-dd') === format(endOfMonth(new Date()), 'yyyy-MM-dd'))) {
        this.dateType = 'month';
      } else if ((format($event[0], 'yyyy-MM-dd') === format(startOfYear(new Date()), 'yyyy-MM-dd'))
        && (format($event[1], 'yyyy-MM-dd') === format(endOfYear(new Date()), 'yyyy-MM-dd'))) {
        this.dateType = 'year';
      } else {
        // this.dateType = null;
      }
    } else {
      // this.dateType = null;
    }
  }
}
