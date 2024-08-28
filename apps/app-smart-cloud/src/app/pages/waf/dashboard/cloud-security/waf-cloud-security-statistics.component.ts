import { Component, OnInit } from '@angular/core';
import type { EChartsOption, SeriesOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
import { EventTrend, EventTrendValue, QueryEventTrendResponse,   QueryStatusCodeDistributionResponseResultStatusCodeData, QueryStatusCodeDistributionResponseResultStatusCodeDataRequestData } from '../../waf.model';
import { differenceInCalendarDays } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-waf-cloud-security-statistics',
  styleUrls: ['./waf-cloud-security-statistics.component.less'],
  templateUrl: './waf-cloud-security-statistics.component.html',
})

export class WafCloudSecurityStatistics implements OnInit {
  today = new Date();
  options: EChartsOption;
  selectedDate:Date[];
  selectDomainOptions = [];
  selectedDomain: any;
  isSpinning = false;
  fromDate = new Date();
  toDate = new Date();
  domains: string[];
  queryEventTrendResponse: QueryEventTrendResponse;
  statusCodeData: QueryStatusCodeDistributionResponseResultStatusCodeData[];
  legendData: string[] = [];
  isValid = true;
  isDateValid = true;
  seriesOptions : SeriesOption[];
  tableStatusCodeTable:any[]=[];
  tableOriginStatusCodeTable:any[]=[];
  xAxis=[];
  sumTotal = 0;
  sumMitigated = 0;
  sumMonitored = 0;
  sumWhitelist = 0;

  constructor(
    private wafService: WafService,
    private notification: NzNotificationService) {
    
  }
  ngOnInit() {
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate.setHours(23, 59, 59, 0);
    this.selectedDate=[this.fromDate,this.toDate];
    this.getData();
  }

  getData(){
    this.wafService.getDomainOfUser().subscribe({
      next: (res) => {
        var any:any = [{domain:'cuong.tokyo',id:2}];
        res = any;
        this.selectDomainOptions = res.map(x=>({label:x.domain,value:x.id}));
        this.selectedDomain = res.map(x=>x.id);
        this.domains = res.map(x=>x.domain);
        this.isValid=this.selectedDomain.length>0;
        this.queryEventTrend();
      },
      error: (error) => {
        console.log(error);
      }
    })
    
  };
  draw(){
    this.options = {
      legend: {
        data: this.legendData,
        align: 'auto',
        top: 0,
        icon:'square'
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
      dataZoom: [
        {
          type: 'inside',
        },
        {
          startValue: this.formatDate(this.fromDate),
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.xAxis,
        axisLine: {
          lineStyle: {
            color: '#000',
          },
          onZero: true
        }
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
          axisLine: {
            lineStyle: {
              color: '#000',
            },
            show:true,
          },
        }
      ],
      series: this.seriesOptions
    };
  }


  mapColor(status:string){
    switch(status){
      case 'Total':
        return '#2d74ff';
      case 'Mitigated':
        return '#47cbff';
      case 'Monitored':
        return '#ff7a33';
      case 'Whitelisted':
        return '#45de7f';
    }
  }

  caculateSum(){
    this.sumTotal = 0;
    this.sumMitigated = 0;
    this.sumMonitored = 0;
    this.sumWhitelist = 0;
    this.queryEventTrendResponse.data.forEach(item => {
      this.sumTotal += item.total;
      this.sumMitigated += item.mitigated;
      this.sumMonitored += item.monitored;
      this.sumWhitelist += item.whitelist;
    })
  }
  convertStatusToDataChart(){
    
    var eventTrends:EventTrend[] = [
      {
        name:'Total',
        data:[]
      },
      {
        name:'Mitigated',
        data:[]
      },
      {
        name:'Monitored',
        data:[]
      },
      {
        name:'Whitelisted',
        data:[]
      }
    ];
    this.xAxis = this.queryEventTrendResponse.data.map(x=>x.timePoint);
    this.queryEventTrendResponse.data.forEach(item => {
      eventTrends.find(x=>x.name=='Total').data.push({timePoint: item.timePoint, value: item.total});
      eventTrends.find(x=>x.name=='Mitigated').data.push({timePoint: item.timePoint, value: item.mitigated});
      eventTrends.find(x=>x.name=='Monitored').data.push({timePoint: item.timePoint, value: item.monitored});
      eventTrends.find(x=>x.name=='Whitelisted').data.push({timePoint: item.timePoint, value: item.whitelist});
    })
    this.legendData = eventTrends.map(x=>x.name);  
    this.seriesOptions = eventTrends.map(x=>({
      name: x.name,
      type: 'line',
      data: x.data.map(x=>x.value),
      lineStyle: {
        width: 1,
        color: this.mapColor(x.name)
      },
      symbolSize: 5,
      showAllSymbol: false,
      itemStyle: {
        color: this.mapColor(x.name)
      },
      areaStyle: {
        opacity: 0.1
      }
    }));
  }
  queryEventTrend(){
    this.isSpinning = true;
    this.wafService.queryEventTrend({startTime:this.fromDate,endTime:this.toDate,domains:this.domains,actType:null}).subscribe({
      next: (res) => {
        this.queryEventTrendResponse = res;
        this.caculateSum();
        this.convertStatusToDataChart();
        this.draw();
        this.isSpinning = false;
      },
      error: (error) => {
        this.isSpinning = false;
        console.log(error);
      }
    })
  }

  
  onDateChange(result: Date[]): void {
    this.isValid = this.selectedDomain.length>0;
    var diffDays= differenceInCalendarDays(result[1], result[0]);
    this.isDateValid = diffDays <= 31;
    this.fromDate = result[0];
    this.toDate = result[1];
    if(!this.isDateValid){
      this.notification.warning('',"Khoảng thời gian không lớn hơn 31 ngày");
      return;
    }
    if(!this.isValid){
      return;
    }
    this.queryEventTrend();
  }
  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  onTypeDateChange(){
    this.queryEventTrend();
  }

  onChangeDomain(){
    this.isValid = this.selectedDomain.length>0;
    this.domains = this.selectDomainOptions.filter(x=>this.selectedDomain.includes(x.value)).map(x=>x.label);
  }

  queryDomain(){
    if(!this.isDateValid){
      this.notification.warning('',"Khoảng thời gian không lớn hơn 31 ngày");
      return;
    }
    if(!this.isValid){
      this.notification.warning('',"Vui lòng chọn domains");
      return;
    }
      this.queryEventTrend();
  }

  formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

}