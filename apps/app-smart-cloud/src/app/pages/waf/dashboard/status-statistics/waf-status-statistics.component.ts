import { Component, OnInit } from '@angular/core';
import type { EChartsOption, SeriesOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
import { QueryOriginStatusCodeDistributionResponse, QueryOriginStatusCodeDistributionResponseResultStatusCodeOriginData, QueryStatusCodeDistributionResponse, QueryStatusCodeDistributionResponseResultStatusCodeData, QueryStatusCodeDistributionResponseResultStatusCodeDataRequestData, QueryTrafficForMultiDomainResponse, QueryTrafficRequestInTotalAndPeakValueResponse } from '../../waf.model';
import { differenceInCalendarDays } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-waf-status-statistics',
  styleUrls: ['./waf-status-statistics.component.less'],
  templateUrl: './waf-status-statistics.component.html',
})

export class WafStatusStatistics implements OnInit {
  today = new Date();
  options: EChartsOption;
  selectedDate:Date[];
  selectedTypeDate: string = 'hourly';
  selectDomainOptions = [];
  selectedDomain: any;
  isSpinning = false;
  fromDate = new Date();
  toDate = new Date();
  domains: string[];
  statusCodeDistributionResponse: QueryStatusCodeDistributionResponse;
  originStatusCodeDistributionResponse: QueryOriginStatusCodeDistributionResponse;
  statusCodeData: QueryStatusCodeDistributionResponseResultStatusCodeData[];
  originStatusCodeData: QueryOriginStatusCodeDistributionResponseResultStatusCodeOriginData[];
  legendData: string[] = [];
  isValid = true;
  isDateValid = true;
  currentTab = 'edge'
  xAxis=[];
  seriesOptions : SeriesOption[];
  tableStatusCodeTable:any[]=[];
  tableOriginStatusCodeTable:any[]=[];

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
        this.queryStatusCodeDistribution();
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
      case '200':
        return '#4168ff';
      case '403':
        return '#47cbff';
      case '0':
        return '#ff7a33';
      case '304':
        return '#45de7f';
      case '400':
        return '#ffac34';
      case '405':
        return '#5ad7d8';
      case '444':
        return '#8163e9';
      case '302':
        return '#ff5f45';
      case '408':
        return '#01c581';
    }
  }
  mapDataToTimestamp(data: QueryStatusCodeDistributionResponseResultStatusCodeDataRequestData[]) : string[] {
    data.shift();
    data.forEach(x=>x.timestamp = x.timestamp+':00');
    if(this.selectedTypeDate=='5m'){
      return data.map(x=>x.value);
    }
    var temp = [];
    if(this.selectedTypeDate=='hourly'){
      var currentDateAndHour = data[0].timestamp.substring(0,13);
      var totalRequestInHour = 0;
      data.forEach(x=>{
        totalRequestInHour += parseInt(x.value);
        if(x.timestamp.substring(0,13) != currentDateAndHour){
          temp.push(totalRequestInHour);
          currentDateAndHour = x.timestamp.substring(0,13);
          totalRequestInHour = 0;
        }
      });
    }
    if(this.selectedTypeDate=='daily'){
      this.xAxis.forEach(x=>{ 
        var totalRequestInDay = data.filter(y=>y.timestamp.split(' ')[0] == x.split(' ')[0]).reduce((a,b)=>a+parseInt(b.value),0);
        temp.push(totalRequestInDay);
      })
    }
    return temp;
  }
  
  convertStatusToDataChart(){
    this.statusCodeData = this.statusCodeDistributionResponse.result[0].statusCodeData.filter(item => {
      const parsed = parseInt(item.statusCode, 10);
      return !isNaN(parsed) && parsed.toString() === item.statusCode;
    });
    var statusCodeData = this.statusCodeData.sort((a,b)=>parseInt(b.totalRequest)-parseInt(a.totalRequest)).slice(0,10);
    this.legendData = statusCodeData.map(x=>x.statusCode);  

    this.seriesOptions = statusCodeData.map(x=>({
      name: x.statusCode,
      type: 'line',
      data: this.mapDataToTimestamp(x.requestData),
      lineStyle: {
        width: 1,
        color: this.mapColor(x.statusCode)
      },
      symbolSize: 5,
      showAllSymbol: false,
      itemStyle: {
        color: this.mapColor(x.statusCode)
      },
      areaStyle: {
        opacity: 0.1
      }
    }));
  }
  createStatusTableDetails(){
    var totalRequestAllStatusCode = this.statusCodeData.reduce((a,b)=>a+parseInt(b.totalRequest),0);
    var temp = [];
    this.statusCodeData.forEach(x=>{
      var ratio = (parseInt(x.totalRequest)/totalRequestAllStatusCode) * 100;
      temp.push({statusCode:x.statusCode,totalRequest:x.totalRequest,ratio:ratio})
    })
    this.tableStatusCodeTable=temp.sort((a,b)=>parseInt(b.totalRequest)-parseInt(a.totalRequest));
  }
  queryStatusCodeDistribution(){
    this.isSpinning = true;
    this.wafService.queryStatusCodeDistribution({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,dataInterval:'5m',groupBy:null,dataPadding:true,queryBy:null}).subscribe({
      next: (res) => {
        this.statusCodeDistributionResponse = res;
        this.convertStatusToDataChart();
        this.draw();
        this.createStatusTableDetails()
        this.isSpinning = false;
      },
      error: (error) => {
        this.isSpinning = false;
        console.log(error);
      }
    })
  }

  convertOriginStatusToDataChart(){
    var dates = this.generateTimeArray(this.fromDate, this.toDate, true);
    this.originStatusCodeDistributionResponse.result[0].statusCodeOriginData.forEach(x=>{
      var temp = [];
      dates.forEach(y=>{
        var timestamp = y.substring(0,16);
        var data = x.requestData.find(z=>z.timestamp == timestamp);
        if(data){
          temp.push(data);
        }else{
          temp.push({timestamp: timestamp, value: 0});
        }
      });
      x.totalRequest = temp.reduce((a,b)=>a+parseInt(b.value),0);
      x.requestData = temp;
    }); //fill Data bị thiếu

    this.originStatusCodeData = this.originStatusCodeDistributionResponse.result[0].statusCodeOriginData.filter(item => {
      const parsed = parseInt(item.statusCode, 10);
      return !isNaN(parsed) && parsed.toString() === item.statusCode;
    });

    var originStatusCodeData = this.originStatusCodeData.sort((a,b)=>parseInt(b.totalRequest)-parseInt(a.totalRequest)).slice(0,10);

    this.legendData = originStatusCodeData.map(x=>x.statusCode);  

    this.seriesOptions = originStatusCodeData.map(x=>({
      name: x.statusCode,
      type: 'line',
      data: this.mapDataToTimestamp(x.requestData),
      lineStyle: {
        width: 1,
        color: this.mapColor(x.statusCode)
      },
      symbolSize: 5,
      showAllSymbol: false,
      itemStyle: {
        color: this.mapColor(x.statusCode)
      },
      areaStyle: {
        opacity: 0.1
      }
    }));
  }
  
  createOriginStatusTableDetails(){
    var totalRequestAllStatusCode = this.originStatusCodeData.reduce((a,b)=>a+parseInt(b.totalRequest),0);
    var temp = [];
    this.originStatusCodeData.forEach(x=>{
      var ratio = (parseInt(x.totalRequest)/totalRequestAllStatusCode) * 100;
      temp.push({statusCode:x.statusCode,totalRequest:x.totalRequest,ratio:ratio})
    })
    this.tableOriginStatusCodeTable=temp.sort((a,b)=>parseInt(b.totalRequest)-parseInt(a.totalRequest));
  }
  queryOriginStatusCodeDistribution(){
    this.isSpinning = true;
    this.wafService.queryOriginStatusCodeDistribution({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,dataInterval:'5m',groupBy:null,backsrcOnly:1,queryBy:null}).subscribe({
      next: (res) => {
        this.originStatusCodeDistributionResponse = res;
        this.convertOriginStatusToDataChart();
        this.draw();
        this.createOriginStatusTableDetails();
        this.isSpinning = false;
      },
      error: (error) => {
        this.isSpinning = false;
        console.log(error);
      }
    })
  }

  

  renderxAxis(){
    if(this.selectedTypeDate == '5m'){ 
      var from = new Date(this.fromDate.getTime() + 5 * 60000);
      this.xAxis = this.generateTimeArray(from, this.toDate);
    }
    if(this.selectedTypeDate == 'hourly'){ 
      var from = new Date(this.fromDate.getTime() + 60 * 60000); 
      this.xAxis = this.generateTimeArray(from, this.toDate);
    }
    if (this.selectedTypeDate == 'daily'){
      this.xAxis = this.generateTimeArray(this.fromDate, this.toDate);
    }
  }

  generateTimeArray(startDate, endDate, is5minutes = false) {
    const result = [];
    var currentDate = new Date(startDate); // Tạo một bản sao của startDate
    while (currentDate <= endDate) {
        if(this.selectedTypeDate == '5m' || is5minutes){
          result.push(this.formatDate(currentDate));
          currentDate = new Date(currentDate.getTime() + 5 * 60000); // Tăng thêm 1 giờ
        }
        else
        if(this.selectedTypeDate == 'hourly'){
          result.push(this.formatDate(currentDate));
          currentDate = new Date(currentDate.getTime() + 60 * 60000); // Tăng thêm 1 giờ
        }
        else
        if(this.selectedTypeDate == 'daily'){
          if(currentDate.getTime() != endDate.getTime()){
            result.push(this.formatDate(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1); // Tăng thêm 1 giờ
        }
    }
    return result;
  }
  
  onDateChange(result: Date[]): void {
    this.isValid = this.selectedDomain.length>0;
    this.isDateValid = differenceInCalendarDays(result[1], result[0]) <= 31;
    var from = new Date(result[0]);
    var to = new Date(result[1]);
    from.setHours(0,0,0,0); 
    to.setHours(24,0,0,0);
    this.fromDate = from;
    this.toDate = to;
    if(!this.isDateValid){
      this.notification.warning('',"Khoảng thời gian không lớn hơn 31 ngày");
      return;
    }
    if(!this.isValid){
      return;
    }
    
    if(this.currentTab=='edge'){
      this.queryStatusCodeDistribution();
    }else{
      this.queryOriginStatusCodeDistribution();
    }
  }

  onTypeDateChange(){
    this.renderxAxis();
    if(this.currentTab=='edge'){
      this.queryStatusCodeDistribution();
    }else{
      this.queryOriginStatusCodeDistribution();
    }
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
    if(this.currentTab=='edge'){
      this.queryStatusCodeDistribution();
    }else{
      this.queryOriginStatusCodeDistribution();
    }
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

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  changeTab(tabName){
    this.currentTab = tabName;
    if(tabName=="edge"){
      this.queryStatusCodeDistribution();
    }
    if(tabName=="b2o"){
      this.queryOriginStatusCodeDistribution();
    }
  }
  changeTypeRequest(){
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
  groupByDateAndGetMax(x: string[], y: number[]): Array<{ dateTime: string, max: number, total: number,count: number }> {
    const dateMaxMap: { [key: string]: { dateTime: string, max: number, total: number, count: number } } = {};

    for (let i = 0; i < x.length; i++) {
        const dateTime = x[i];
        const date = dateTime.split(' ')[0]; // Lấy phần ngày 'YYYY-MM-DD'
        const value = y[i];
      
        if (!dateMaxMap[date]) {
            dateMaxMap[date] = { dateTime: dateTime, max: value, total: value, count: 1 };
        } else {
            dateMaxMap[date].total += value;
            dateMaxMap[date].count += 1;
            if (value > dateMaxMap[date].max) {
                dateMaxMap[date].max = value;
                dateMaxMap[date].dateTime = dateTime;
            }
        }
    }

    // Chuyển đổi từ đối tượng dateMaxMap thành mảng
    const resultArray = Object.keys(dateMaxMap).map(date => ({
        dateTime: dateMaxMap[date].dateTime,
        max: dateMaxMap[date].max,
        total: dateMaxMap[date].total,
        count: dateMaxMap[date].count
    }));

    return resultArray;
  }

  groupByDateAndGetMax2(x: string[], y: number[], z:number[]): Array<{ dateTime: string, max: number, total: number }> {
    const dateMaxMap: { [key: string]: { dateTime: string, max: number, total: number } } = {};

    for (let i = 0; i < x.length; i++) {
        const dateTime = x[i];
        const date = dateTime.split(' ')[0]; // Lấy phần ngày 'YYYY-MM-DD'
        const valueMax = y[i];
        const valueTotal = z[i];
        if (!dateMaxMap[date]) {
            dateMaxMap[date] = { dateTime: dateTime, max: valueMax, total: valueTotal };
        } else {
            dateMaxMap[date].total += valueTotal;
            if (valueMax > dateMaxMap[date].max) {
                dateMaxMap[date].max = valueMax;
                dateMaxMap[date].dateTime = dateTime;
            }
        }
    }

    // Chuyển đổi từ đối tượng dateMaxMap thành mảng
    const resultArray = Object.keys(dateMaxMap).map(date => ({
        dateTime: dateMaxMap[date].dateTime,
        max: dateMaxMap[date].max,
        total: dateMaxMap[date].total
    }));

    return resultArray;
  }

  
  
}