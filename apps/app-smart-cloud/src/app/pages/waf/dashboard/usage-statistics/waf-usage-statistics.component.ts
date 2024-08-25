import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
import { QueryBacktoOriginTrafficAndRequestResponse, QueryBandwidthForMultiDomainResponse2, QueryRequesBandwidthtSavingRatioResponse, QueryTrafficForMultiDomainResponse } from '../../waf.model';
import { differenceInCalendarDays, setHours } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { el } from 'date-fns/locale';
import { forkJoin } from 'rxjs';
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
  dataTraffic: QueryTrafficForMultiDomainResponse;
  totalEdgeTraffic: number;
  totalB2OTraffic: number;
  dataBandwidthSaving: QueryRequesBandwidthtSavingRatioResponse;
  averageBandwidthSaving: number;
  dataBack2Origin: QueryBacktoOriginTrafficAndRequestResponse;
  edgePeakTime: [];
  isValid = true;
  isDateValid = true;
  currentTab = 'bandwidth'
  peakEdge: any;
  peakB2O: any;
  peakSaving: any;
  bandWidthData: number[];
  timeStampData: string[];
  back2OriginData: number[];
  bandWidthSavingData: number[];
  timeStampSavingData: string[];
  apiCallProcessing=[false,false,false];
  xAxis=[];
  peakTable:any[]=[]
  peakEdgeTable: any[]=[];
  peakB2OTable: any[]=[];
  peakSavingTable: any[]=[];
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
    this.renderxAxis();
    this.getData();
  }

  getData(){
    this.wafService.getDomainOfUser().subscribe({
      next: (res) => {
        var any:any = [{domain:'cloud.vnpt.vn',id:1},{domain:'cuong.tokyo',id:2}];
        res = any;
        this.selectDomainOptions = res.map(x=>({label:x.domain,value:x.id}));
        this.selectedDomain = res.map(x=>x.id);
        this.domains = res.map(x=>x.domain);
        this.isValid=this.selectedDomain.length>0;
        this.getDataBandwidth();
        this.getDataTraffic();
        this.getDataBack2Origin();
        this.getBandwidthSaving();
      },
      error: (error) => {
        console.log(error);
      }
    })
    
  };
  draw(){
    if(this.apiCallProcessing.some(x=>x==true)){
      return;
    }
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
        orient:'vertical',
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
          name: 'Unit: Mbps',
          position: 'left',
          axisLine: {
            lineStyle: {
              color: '#000',
            },
            show:true,
            
          },
        },
        {
          type: 'value',
          name: 'Unit: %',
          position: 'right',
          axisLine: {
            lineStyle: {
              color: '#000',
            },
            show:true,
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
        },
        {
          data: this.back2OriginData,
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
        {
          data: this.bandWidthSavingData,
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
          symbolSize: 5,
          showAllSymbol: false,
          yAxisIndex: 1
        }
      ]
    };
  }

  createPeakTableData(){
    if(this.apiCallProcessing.some(x=>x==true)){
      return;
    }
    var maxEdges= this.groupByDateAndGetMax(this.xAxis,this.bandWidthData);
    this.peakEdgeTable=maxEdges.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      bandwidth:x.max
    }));
    debugger;
    var maxB2O= this.groupByDateAndGetMax(this.xAxis,this.back2OriginData);
    this.peakB2OTable=maxB2O.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      bandwidth:x.max
    }));

    var maxSaving= this.groupByDateAndGetMax(this.xAxis,this.bandWidthSavingData);
    this.peakSavingTable=maxSaving.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      bandwidth:x.max
    }));
    this.renderPeakTable();
  }

  renderPeakTable(){
    if(this.selectedTypeRequest=='EDGE'){
      this.peakTable=this.peakEdgeTable;
    }
    if(this.selectedTypeRequest=='B2O'){
      this.peakTable=this.peakB2OTable;
    }
    if(this.selectedTypeRequest=='BSR'){
      this.peakTable=this.peakSavingTable;
    }
  }


  caculateEdge(){
    if(this.selectedTypeDate=='fiveminutes'){
      var max= Math.max(...this.bandWidthData);
      this.peakEdge ={
        bandwidth: max,
        timestamp: this.xAxis[this.bandWidthData.indexOf(max)]
      };
    }
  }
  fillBandwidthData(){
    var leng = this.bandWidthData.length;
      for(let i = leng; i<this.xAxis.length;i++) {
        this.bandWidthData[i]=0;
      }
  }
  
  getDataBandwidth(){
    this.apiCallProcessing[0]=true;
    this.isSpinning=true;
    this.wafService.bandwidthForMultiDomain(this.fromDate,this.toDate,this.selectedTypeDate,this.domains).subscribe({
      next: (res) => {
        this.isSpinning=false;
        this.apiCallProcessing[0]=false;
        this.dataBandwidth = res;
        this.bandWidthData = this.dataBandwidth.bandwidthReport.map(x=>x.bandwidth);
        this.fillBandwidthData();
        this.caculateEdge()
        this.draw();
        this.createPeakTableData();
      },
      error: (error) => {
        this.isSpinning=false;
        this.apiCallProcessing[0]=false;
        console.log(error);
      }
    })
  }

  getDataTraffic(){
    this.wafService.trafficForMultiDomain(this.fromDate,this.toDate,this.selectedTypeDate,this.domains).subscribe({
      next: (res) => {
        this.dataTraffic = res;
        this.totalEdgeTraffic = Math.ceil(this.dataTraffic.flowSummary / 1024 * 100) / 100; 
      },
      error: (error) => {
        this.isSpinning=false;
        console.log(error);
      }
    })
  }

  fillBack2OriginData(){
    var temp = [];
    var back2OriginDatas = this.dataBack2Origin.result;
    back2OriginDatas.forEach(x=>x.flowRequestOriginData[0].timestamp+=':00');
    for(var i=0; i<this.xAxis.length; i++){
      var timestampX = this.xAxis[i];
      var index = back2OriginDatas.findIndex(x=>x.flowRequestOriginData[0].timestamp==timestampX);
      if(index==-1){
        temp[i]=null;
      }else{
        temp[i]= parseFloat(back2OriginDatas[index].flowRequestOriginData[0].bandwidth);
      }
    }
    this.back2OriginData = temp;
  }
  caculateBack2Origin(){
    if(this.selectedTypeDate=='fiveminutes'){
      var max= Math.max(...this.back2OriginData);
      this.peakB2O ={
        bandwidth: max,
        timestamp: this.xAxis[this.back2OriginData.indexOf(max)]
      };
    }
    var sumTraffic = this.dataBack2Origin.result.reduce((a, b) => a + parseFloat(b.totalFlow), 0);
    this.totalB2OTraffic = Math.ceil(sumTraffic / 1024 * 100) / 100; 
  }
  getDataBack2Origin(){
    this.apiCallProcessing[2]=true;
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '5m';
    }
    this.wafService.getBacktoOriginTrafficAndRequest({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:dataInterval,domain:this.domains,groupBy:[],backsrcOnly:null}).subscribe({
      next: (res) => {
        this.apiCallProcessing[2]=false;
        this.dataBack2Origin = res;
        this.back2OriginData = this.dataBack2Origin.result.map(x=>parseFloat(x.flowRequestOriginData[0].bandwidth));
        this.fillBack2OriginData();
        this.caculateBack2Origin()
        this.draw();
        this.createPeakTableData();
      },
      error: (error) => {
        this.apiCallProcessing[2]=false;
        console.log(error);
      }
    })
  }

  caculateBandwidthSaving(){
    this.averageBandwidthSaving = this.dataBandwidthSaving.data[0].totalAvg * 100;
    if(this.selectedTypeDate=='fiveminutes'){
      var max= Math.max(...this.bandWidthSavingData);
      this.peakSaving ={
        savingBandwidth: max,
        timestamp: this.xAxis[this.bandWidthSavingData.indexOf(max)]
      };
    }
    
  }
  getBandwidthSaving(){
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '1h';
    }
    
    this.apiCallProcessing[1]=true;
    this.wafService.getBandWidthSaving({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:dataInterval,domain:this.domains}).subscribe({
      next: (res) => {
        this.dataBandwidthSaving = res;
        this.apiCallProcessing[1]=false;
        this.fillBandwidthSavingData();
        this.caculateBandwidthSaving();
        this.draw();
        this.createPeakTableData();
      },
      error: (error) => {
        this.apiCallProcessing[1]=false;
        console.log(error);
      }
    })
  }
  fillBandwidthSavingData(){
    if(this.selectedTypeDate =='fiveminutes'){
      var temp = [];
      var savingBandwidthDatas = this.dataBandwidthSaving.data[0].savingBandwidthDatas;
      savingBandwidthDatas.forEach(x=>x.timestamp+=':00');
      for(var i=0; i<this.xAxis.length; i++){
        var timestampX = this.xAxis[i];
        var index = savingBandwidthDatas.findIndex(x=>x.timestamp==timestampX);
        if(index==-1){
          temp[i]=null;
        }else{
          temp[i]= parseFloat(savingBandwidthDatas[index].savingBandwidth) * 100;
        }
      }
      this.bandWidthSavingData = temp;
    }else{
      var temp1 = [];
      var savingBandwidthDatas = this.dataBandwidthSaving.data[0].savingBandwidthDatas;
      savingBandwidthDatas.forEach(x=>x.timestamp+=':00:00');
      for(var i=0; i<this.xAxis.length;i++){
        var timestampX1 = this.xAxis[i];
        var index = savingBandwidthDatas.findIndex(x=>x.timestamp==timestampX1);
        if(index==-1){
          temp1[i]=null;
        }else{
          temp1[i]= parseFloat(savingBandwidthDatas[index].savingBandwidth) * 100;
        }
      }
      this.bandWidthSavingData = temp1;
    }
  }

  renderxAxis(){
    this.xAxis = this.generateTimeArray(this.fromDate, this.toDate);
  }

  generateTimeArray(startDate, endDate) {
    const result = [];
    var currentDate = new Date(startDate); // Tạo một bản sao của startDate
    var isFirst=true;
    while (currentDate < endDate) {
        isFirst=false;
        if (this.selectedTypeDate == 'fiveminutes') {
          currentDate = new Date(currentDate.getTime() + 5 * 60000); // Tăng thêm 5 phút
        } else {
          currentDate = new Date(currentDate.getTime() + 60 * 60000); // Tăng thêm 1 giờ
        }
        result.push(this.formatDate(currentDate,isFirst));
    }
    return result;
  }
  
  onDateChange(result: Date[]): void {
    console.log(result);
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
    this.renderxAxis();
    if(!this.isDateValid){
      this.notification.warning('',"Khoảng thời gian không lớn hơn 31 ngày");
      return;
    }
    if(!this.isValid){
      return;
    }
    this.getDataBandwidth();
    this.getDataTraffic();
    this.getDataBack2Origin();
    this.getBandwidthSaving();
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
    this.getDataTraffic();
    this.getDataBack2Origin();
    this.getBandwidthSaving();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  formatDate(date,isFirst=false) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Kiểm tra nếu giờ, phút và giây đều bằng 0
    if (hours === 0 && minutes === 0 && seconds === 0 && !isFirst) {
        // Giảm ngày đi 1 và đặt giờ, phút, giây thành 24:00:00
        var newDate = new Date(date)
        newDate.setDate(newDate.getDate() - 1);
        year = newDate.getFullYear();
        month = String(newDate.getMonth() + 1).padStart(2, '0');
        day = String(newDate.getDate()).padStart(2, '0');
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
  changeTypeRequest(){
    debugger;
    this.renderPeakTable();
  }
  getDatesInRange(startDate: Date, endDate: Date): string[] {
    const dateArray: string[] = [];
    let currentDate: Date = new Date(startDate);

    while (currentDate <= endDate) {
        dateArray.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }
  groupByDateAndGetMax(x: string[], y: number[]): Array<{ dateTime: string, max: number }> {
    const dateMaxMap: { [key: string]: { dateTime: string, max: number } } = {};

    for (let i = 0; i < x.length; i++) {
        const dateTime = x[i];
        const date = dateTime.split(' ')[0]; // Lấy phần ngày 'YYYY-MM-DD'
        const value = y[i];

        if (!dateMaxMap[date] || value > dateMaxMap[date].max) {
            dateMaxMap[date] = { dateTime: dateTime, max: value };
        }
    }

    // Chuyển đổi từ đối tượng dateMaxMap thành mảng
    const resultArray = Object.keys(dateMaxMap).map(date => ({
        dateTime: dateMaxMap[date].dateTime,
        max: dateMaxMap[date].max
    }));

    return resultArray;
  }
}