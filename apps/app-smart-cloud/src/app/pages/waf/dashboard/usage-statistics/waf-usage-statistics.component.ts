import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
@Component({
  selector: 'app-waf-usage-statistics',
  styleUrls: ['./waf-usage-statistics.component.less'],
  templateUrl: './waf-usage-statistics.component.html',
})

export class WafUsageStatistics implements OnInit {
  options: EChartsOption;

  private oneDay = 24 * 3600 * 1000;
  private now: Date;
  private value: number;
  private timer: any;
  date = null;
  selectOptions = [
    { label: "this.i18n.fanyi('app.status.all')", value: '' },
    { label: "this.i18n.fanyi('service.status.active')", value: 'ACTIVE' },
  ];
  selectedValue: any;
  isSpinning = false;
  dailyTableLoading = false;
  top10TableLoading = false;
  fromDate = new Date();
  toDate = new Date();
  domains: string[] = ["cuong.tokyo"];
  constructor(
    private wafService: WafService) {
    
  }
  ngOnInit() {
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate.setHours(24, 0, 0, 0);
    this.getData();
    
    this.options = {
      legend: {
        data: ['EDGE','Back-to-Origin','Bandwidth Saving Ratio'],
        align: 'auto',
        bottom: 10
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {},
        },
        right: 10,
        bottom: 250,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: {
          lineStyle: {
            color: '#000',
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Unit: Mbps',
          position: 'left',
          axisLine: {
            lineStyle: {
              color: '#000',
            },
          },
        },
        {
          type: 'value',
          name: 'Unit: %',
          position: 'right',
          axisLine: {
            lineStyle: {
              color: '#000',
              type:'solid',
              width:2
            },
          },
        },
      ],
      
      series: [
        {
          name: 'EDGE',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 5000],
          lineStyle: {
            width: 1,
            color: '#4168FF'
          },
          itemStyle: {
            color: '#4168FF' // Màu sắc của cột trong series
          },
          areaStyle: {
            opacity: 0.1
          },
          emphasis: {
            focus: 'series'
          }
        },
        {
          data: [821, 0, 901, 934, 1290, 1330, 1320],
          name: 'Back-to-Origin',
          type: 'line',
          lineStyle: {
            width: 1,
            color: '#47CBFF'
          },
          itemStyle: {
            color: '#47CBFF' // Màu sắc của cột trong series
          },
          areaStyle: {
            opacity: 0.1,
            color: '#47CBFF'
          },
          emphasis: {
            focus: 'series'
          }
        },
        ,
        {
          data: [821, 0, 901, 934, 1290, 1330, 1320],
          name: 'Bandwidth Saving Ratio',
          type: 'line',
          lineStyle: {
            width: 1,
            color: '#009B4E'
          },
          itemStyle: {
            color: '#009B4E' // Màu sắc của cột trong series
          },
          areaStyle: {
            opacity: 0.1,
            color: '#009B4E'
          },
          emphasis: {
            focus: 'series'
          },
          yAxisIndex: 1
        }
      ]
    };
  }

  getData(){
    this.wafService.bandwidthForMultiDomain(this.fromDate,this.toDate,'fiveminutes',this.domains).subscribe({
      next: (res) => {
        console.log(res,'bandwidthForMultiDomain');
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  onChange(result: Date[]): void {
    console.log('onChange: ', result);
  }
}