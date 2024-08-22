import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
import { QueryBandwidthForMultiDomainResponse2 } from '../../waf.model';
import { differenceInCalendarDays, setHours } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { el } from 'date-fns/locale';
@Component({
  selector: 'app-waf-usage-statistics',
  styleUrls: ['./waf-usage-statistics.component.less'],
  templateUrl: './waf-usage-statistics.component.html',
})

export class WafUsageStatistics implements OnInit {
  today = new Date();
  options: EChartsOption;
  selectedDate:Date[];
  selectedTypeDate: string = 'fiveminutes';
  selectDomainOptions = [];
  selectedDomain: any;
  selectedTypeRequest:string="EDGE";
  isSpinning = false;
  dailyTableLoading = false;
  top10TableLoading = false;
  fromDate = new Date();
  toDate = new Date();
  domains: string[];
  dataBandwidth: QueryBandwidthForMultiDomainResponse2;
  edgePeakTime: [];
  isValid = true;
  isDateValid = true;
  currentTab = 'bandwidth'
  constructor(
    private wafService: WafService,
    private notification: NzNotificationService) {
    
  }
  ngOnInit() {
    var from = new Date(this.fromDate);
    var to = new Date(this.toDate);
    this.selectedDate=[from,to];
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate.setHours(24, 0, 0, 0);
    this.getData();
  }

  getData(){
    this.wafService.getDomainOfUser().subscribe({
      next: (res) => {
        this.selectDomainOptions = res.map(x=>({label:x.domain,value:x.id}));
        this.selectedDomain = res.map(x=>x.id);
        this.domains = res.map(x=>x.domain);
        this.isValid=this.selectedDomain.length>0;
        this.getDataBandwidth();
      },
      error: (error) => {
        console.log(error);
      }
    })
  };
  draw(){
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
        data: this.timeStampData,
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
          data: this.bandWidthData,
          lineStyle: {
            width: 1,
            color: '#4168FF'
          },
          symbolSize: 5,
          showAllSymbol: false,
          itemStyle: {
            color: '#4168FF', // Màu sắc của cột trong series

          },
          areaStyle: {
            opacity: 0.1
          }
        }
        //,
        // {
        //   data: [821, 0, 901, 934, 1290, 1330, 1320],
        //   name: 'Back-to-Origin',
        //   type: 'line',
        //   lineStyle: {
        //     width: 1,
        //     color: '#47CBFF'
        //   },
        //   itemStyle: {
        //     color: '#47CBFF' // Màu sắc của cột trong series
        //   },
        //   areaStyle: {
        //     opacity: 0.1,
        //     color: '#47CBFF'
        //   },
        //   emphasis: {
        //     focus: 'series'
        //   }
        // },
        // {
        //   data: [821, 0, 901, 934, 1290, 1330, 1320],
        //   name: 'Bandwidth Saving Ratio',
        //   type: 'line',
        //   lineStyle: {
        //     width: 1,
        //     color: '#009B4E'
        //   },
        //   itemStyle: {
        //     color: '#009B4E' // Màu sắc của cột trong series
        //   },
        //   areaStyle: {
        //     opacity: 0.1,
        //     color: '#009B4E'
        //   },
        //   emphasis: {
        //     focus: 'series'
        //   },
        //   yAxisIndex: 1
        // }
      ]
    };
  }
  caculate(){
    //this.timeStampData
  }
  bandWidthData: number[];
  timeStampData: string[];
  getDataBandwidth(){
    this.isSpinning=true;
    this.wafService.bandwidthForMultiDomain(this.fromDate,this.toDate,this.selectedTypeDate,this.domains).subscribe({
      next: (res) => {
        this.isSpinning=false;
        this.dataBandwidth = res;
        this.bandWidthData = this.dataBandwidth.bandwidthReport.map(x=>x.bandwidth);
        this.timeStampData = this.dataBandwidth.bandwidthReport.map(x=>x.timestamp);
        this.fillData();
        this.draw();
        this.caculate()
      },
      error: (error) => {
        this.isSpinning=false;
        console.log(error);
      }
    })
  }

  fillData(){
    if(this.selectedTypeDate=='fiveminutes'){
      var currentLength = this.bandWidthData.length;
      var lastDate = new Date(this.timeStampData[currentLength-1]);
      for(let i=currentLength;i<288;i++){
        this.bandWidthData.push(0);
        lastDate.setMinutes(lastDate.getMinutes() + 5);
        this.timeStampData.push(this.formatDate(lastDate));
      }
    }
    if(this.selectedTypeDate=='hourly'){
      var lastHour = this.timeStampData[this.timeStampData.length-1].slice(-2);
      var lstDate = this.timeStampData[this.timeStampData.length-1].slice(0, 10);
      var hour = Number(lastHour);
      for(let i=hour;i<24;i++){
        this.bandWidthData.push(0);
        this.timeStampData.push(`${lstDate} ${i+1}`);
      }
    }
  }
  onDateChange(result: Date[]): void {
    debugger;
    this.isValid = this.selectedDomain.length>0;
    this.isDateValid = differenceInCalendarDays(result[1], result[0]) <= 31;
    var from = new Date(result[0]);
    var to = new Date(result[1]);
    from.setHours(0,0,0,0); 
    to.setHours(24,0,0,0);
    this.fromDate = from;
    this.toDate = to;
    if(this.isSameDay(result[0],result[1])){
      this.selectedTypeDate = 'fiveminutes';
    }else{
      this.selectedTypeDate = 'hourly';
    }
    if(!this.isDateValid){
      this.notification.warning('',"Khoảng thời gian không lớn hơn 31 ngày");
      return;
    }
    if(!this.isValid){
      return;
    }
    this.getDataBandwidth();
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
    this.getDataBandwidth();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Kiểm tra nếu giờ, phút và giây đều bằng 0
    if (hours === 0 && minutes === 0 && seconds === 0) {
        // Giảm ngày đi 1 và đặt giờ, phút, giây thành 24:00:00
        date.setDate(date.getDate() - 1);
        year = date.getFullYear();
        month = String(date.getMonth() + 1).padStart(2, '0');
        day = String(date.getDate()).padStart(2, '0');
        hours = '24'; // Đặt giờ là 24
        minutes = '00';
        seconds = '00';
    } else {
        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');
    }

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  changeTab(tabName){
    this.currentTab = tabName;
  }
}