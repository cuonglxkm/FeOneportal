import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
import { QueryBacktoOriginTrafficAndRequestResponse, QueryBandwidthForMultiDomainResponse2, QueryRequesBandwidthtSavingRatioResponse, QueryRequestHitRatioResponse, QueryTrafficForMultiDomainResponse, QueryTrafficRequestInTotalAndPeakValueResponse } from '../../waf.model';
import { differenceInCalendarDays, setHours } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { el } from 'date-fns/locale';
import { catchError, forkJoin, of } from 'rxjs';
import * as e from 'express';
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
  totalEdgeNumberRequest: number;
  peakEdgeNumberRequest: number;
  totalB20NumberRequest: number;
  peakB20NumberRequest: number;
  dataBandwidthSaving: QueryRequesBandwidthtSavingRatioResponse;
  averageBandwidthSaving: number;
  averageHitRatio: number;
  peakHitRatio: number;
  dataBack2Origin: QueryBacktoOriginTrafficAndRequestResponse;
  dataRequestNumber: QueryTrafficRequestInTotalAndPeakValueResponse;
  dataRequestHitRatio: QueryRequestHitRatioResponse;
  edgePeakTime: [];
  isValid = true;
  isDateValid = true;
  currentTab = 'bandwidth'
  peakEdge: any;
  peakB2O: any;
  peakSaving: any;
  bandWidthData: number[];
  timeStampData: string[];
  back2OriginBandwidthData: number[];
  back2OriginRequestData: number[];
  bandWidthSavingData: number[];
  timeStampSavingData: string[];
  requestNumberData: number[];
  requestHitRatioData: number[];
  apiCallProcessing=[false,false,false];
  apiRequestCallProcessing=[false,false,false];
  xAxis=[];
  peakTable:any[]=[]
  peakEdgeTable: any[]=[];
  peakB2OTable: any[]=[];
  peakSavingTable: any[]=[];
  totalEdgeRequestTable: any[]=[];
  totalB2ORequestTable: any[]=[];
  totalHitRatioTable: any[]=[];
  top10SavingTable: any[]=[];
  top10HitRatioTable: any[]=[];
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
        this.getTop10BandwidthSaving();
      },
      error: (error) => {
        console.log(error);
      }
    })
    
  };
  draw(){
    if(this.apiCallProcessing.some(x=>x==true) && this.currentTab=='bandwidth'){
      return;
    }
    if(this.apiRequestCallProcessing.some(x=>x==true) && this.currentTab=='requests'){
      return;
    }
    this.options = {
      legend: {
        data: ['EDGE','Back-to-Origin', this.currentTab=='bandwidth'?'Bandwidth Saving Ratio':'Hit Ratio'],
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
          name: this.currentTab=='bandwidth' ? 'Unit: Mbps':'Unit: Times',
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
          data: this.currentTab=='bandwidth' ? this.bandWidthData : this.requestNumberData,
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
          data: this.currentTab=='bandwidth' ? this.back2OriginBandwidthData : this.back2OriginRequestData,
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
          data: this.currentTab=='bandwidth' ? this.bandWidthSavingData: this.requestHitRatioData,
          name: this.currentTab=='bandwidth' ? 'Bandwidth Saving Ratio':'Hit Ratio',
          type: 'line',
          lineStyle: {
            width: 1,
            color: this.currentTab=='bandwidth'? '#009B4E': '#FF7A33'
          },
          itemStyle: {
            color: this.currentTab=='bandwidth'? '#009B4E': '#FF7A33' // Màu sắc của cột trong series
          },
          areaStyle: {
            opacity: 0.1,
            color: this.currentTab=='bandwidth'? '#009B4E': '#FF7A33'
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

  createDailyTableData(){
    if(this.apiCallProcessing.some(x=>x==true) && this.currentTab=='bandwidth'){
      return;
    }
    if(this.apiRequestCallProcessing.some(x=>x==true) && this.currentTab=='requests'){
      return;
    }
    if(this.currentTab=='bandwidth'){
      var maxEdges= this.groupByDateAndGetMax(this.xAxis,this.bandWidthData);
      this.peakEdgeTable=maxEdges.map(x=>({
        date:x.dateTime.split(' ')[0],
        time:x.dateTime.split(' ')[1],
        bandwidth:x.max
      }));
      var maxB2O= this.groupByDateAndGetMax(this.xAxis,this.back2OriginBandwidthData);
      this.peakB2OTable=maxB2O.map(x=>({
        date:x.dateTime.split(' ')[0],
        time:x.dateTime.split(' ')[1],
        bandwidth:x.max
      }));
  
      var maxSaving= this.groupByDateAndGetMax(this.xAxis,this.bandWidthSavingData);
      this.peakSavingTable=maxSaving.map(x=>({
        date:x.dateTime.split(' ')[0],
        time:x.dateTime.split(' ')[1],
        peak:x.max
      }));
    }
    else{
      var maxEdges= this.groupByDateAndGetMax(this.xAxis,this.requestNumberData);
      this.totalEdgeRequestTable=maxEdges.map(x=>({
        date:x.dateTime.split(' ')[0],
        total:x.total
      }));
      this.totalEdgeRequestTable.push({
        date:'Total',
        total: this.totalEdgeRequestTable.reduce((a, b) => a + b.total, 0)
      })

      var maxB2O= this.groupByDateAndGetMax(this.xAxis,this.back2OriginRequestData);
      this.totalB2ORequestTable=maxB2O.map(x=>({
        date:x.dateTime.split(' ')[0],
        total:x.total
      }));
      this.totalB2ORequestTable.push({
        date:'Total',
        total: this.totalB2ORequestTable.reduce((a, b) => a + b.total, 0)
      })
      
      var maxHitRatio= this.groupByDateAndGetMax(this.xAxis,this.requestHitRatioData);
      this.totalHitRatioTable=maxHitRatio.map(x=>({
        date:x.dateTime.split(' ')[0],
        peak:x.max,
        averange:0// chưa tính được
      }));
    }
    
    this.renderPeakTable();
  }


  renderPeakTable(){
    if(this.currentTab=='bandwidth'){
      if(this.selectedTypeRequest=='EDGE'){
        this.peakTable=this.peakEdgeTable;
      }
      if(this.selectedTypeRequest=='B2O'){
        this.peakTable=this.peakB2OTable;
      }
      if(this.selectedTypeRequest=='BSR'){
        this.peakTable=this.peakSavingTable;
      }
    }else{
      if(this.selectedTypeRequest=='EDGE'){
        this.peakTable=this.totalEdgeRequestTable;
      }
      if(this.selectedTypeRequest=='B2O'){
        this.peakTable=this.totalB2ORequestTable;
      }
      if(this.selectedTypeRequest=='HR'){
        this.peakTable=this.totalHitRatioTable;
      }
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
  
  offSpining(){
    if(this.apiCallProcessing.some(x=>x==true) && this.currentTab=='bandwidth'){
      return;
    }
    if(this.apiCallProcessing.some(x=>x==true)&& this.currentTab=='requests'){
      return;
    }
    this.isSpinning = false;
  }

  getDataBandwidth(){
    this.apiCallProcessing[0]=true;
    this.isSpinning=true;
    this.wafService.bandwidthForMultiDomain(this.fromDate,this.toDate,this.selectedTypeDate,this.domains).subscribe({
      next: (res) => {
        this.apiCallProcessing[0]=false;
        this.offSpining();
        this.dataBandwidth = res;
        this.bandWidthData = this.dataBandwidth.bandwidthReport.map(x=>x.bandwidth);
        this.fillBandwidthData();
        this.caculateEdge()
        this.draw();
        this.createDailyTableData();
      },
      error: (error) => {
        this.apiCallProcessing[0]=false;
        this.offSpining();
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

  fillBack2OriginBanwidthData(){
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
    this.back2OriginBandwidthData = temp;
  }
  fillBack2OriginRequestData(){
    var temp = [];
    var back2OriginDatas = this.dataBack2Origin.result;
    back2OriginDatas.forEach(x=>x.flowRequestOriginData[0].timestamp+=':00');
    for(var i=0; i<this.xAxis.length; i++){
      var timestamp = this.xAxis[i];
      var index = back2OriginDatas.findIndex(x=>x.flowRequestOriginData[0].timestamp==timestamp);
      if(index==-1){
        temp[i]=null;
      }else{
        temp[i]= parseInt(back2OriginDatas[index].flowRequestOriginData[0].request);
      }
    }
    this.back2OriginRequestData = temp;
  }
  
  caculateBack2OriginBandwidth(){
    if(this.selectedTypeDate=='fiveminutes'){
      var max= Math.max(...this.back2OriginBandwidthData);
      this.peakB2O ={
        bandwidth: max,
        timestamp: this.xAxis[this.back2OriginBandwidthData.indexOf(max)]
      };
    }
    var sumTraffic = this.dataBack2Origin.result.reduce((a, b) => a + parseFloat(b.totalFlow), 0);
    this.totalB2OTraffic = Math.ceil(sumTraffic / 1024 * 100) / 100; 
  }
  caculateBack2OriginRequest(){
    this.totalB20NumberRequest = this.dataBack2Origin.result.reduce((a, b) => a + parseFloat(b.totalRequest), 0);
    this.peakB20NumberRequest = Math.max(...this.dataBack2Origin.result.map(x=>parseInt(x.peakRequest)));
  }
  
  getDataBack2Origin(){
    if(this.currentTab=='bandwidth'){
      this.apiCallProcessing[2]=true;
    }else{
      this.apiRequestCallProcessing[1]=true;
    }
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '5m';
    }
    this.isSpinning = true;
    this.wafService.getBacktoOriginTrafficAndRequest({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:dataInterval,domain:this.domains,groupBy:[],backsrcOnly:null}).subscribe({
      next: (res) => {
        if(this.currentTab=='bandwidth'){
          this.apiCallProcessing[2]=false;
        }else{
          this.apiRequestCallProcessing[1]=false;
        }
        this.offSpining();
        this.dataBack2Origin = res;
        if(this.currentTab=='bandwidth'){
          this.fillBack2OriginBanwidthData();
          this.caculateBack2OriginBandwidth()
        }else{
          this.fillBack2OriginRequestData();
          this.caculateBack2OriginRequest();
        }
        
        this.draw();
        this.createDailyTableData();
      },
      error: (error) => {
        if(this.currentTab=='bandwidth'){
          this.apiCallProcessing[2]=false;
        }else{
          this.apiRequestCallProcessing[1]=false;
        }
        this.offSpining();
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
    this.isSpinning = true;
    this.wafService.getBandWidthSaving({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:dataInterval,domain:this.domains}).subscribe({
      next: (res) => {
        this.dataBandwidthSaving = res;
        this.apiCallProcessing[1]=false;
        this.offSpining();
        this.fillBandwidthSavingData();
        this.caculateBandwidthSaving();
        this.draw();
        this.createDailyTableData();
      },
      error: (error) => {
        this.apiCallProcessing[1]=false;
        this.offSpining();
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
  fillRequestNumber(){
    var temp = [];
    var requestNumberDatas = this.dataRequestNumber.result[0].flowRequestData;
    requestNumberDatas.forEach(x=>x.timestamp+=':00');
    

    for(var i=0; i<this.xAxis.length; i++){
      var timestamp = this.xAxis[i];
      var index = requestNumberDatas.findIndex(x=>x.timestamp==timestamp);
      if(index==-1){
        temp[i]=null;
      }else{
        temp[i]= parseInt(requestNumberDatas[index].request);
      }
    }
    this.requestNumberData = temp;
  }
  caculateRequestNumber(){
    this.totalEdgeNumberRequest = parseFloat(this.dataRequestNumber.result[0].totalRequest);
    this.peakEdgeNumberRequest = parseFloat(this.dataRequestNumber.result[0].peakRequest);
  }
  getEdgeRequestNumber(){
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '1h';
    }
    this.apiRequestCallProcessing[0]=true;
    this.isSpinning = true;
    this.wafService.queryTrafficRequestInTotalAndPeakValue({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,groupBy:[],dataPadding:null}).subscribe({
      next: (res) => {
        this.dataRequestNumber = res;
        this.apiRequestCallProcessing[0]=false;
        this.offSpining();
        this.fillRequestNumber();
        this.caculateRequestNumber();
        this.draw();
        this.createDailyTableData();
      },
      error: (error) => {
        this.apiRequestCallProcessing[0]=false;
        this.offSpining();
        console.log(error);
      }
    })
  }
  fillRequestHitRatio(){
    var temp = [];
    var requestHitRatioDatas = this.dataRequestHitRatio.data[0].hitRatioDatas;
    if(this.selectedTypeDate =='fiveminutes'){
      requestHitRatioDatas.forEach(x=>x.timestamp+=':00');
    }else{
      requestHitRatioDatas.forEach(x=>x.timestamp+=':00:00');
    }
    
    for(var i=0; i<this.xAxis.length; i++){
      var timestamp = this.xAxis[i];
      var index = requestHitRatioDatas.findIndex(x=>x.timestamp==timestamp);
      if(index==-1){
        temp[i]=null;
      }else{
        temp[i]= parseFloat(requestHitRatioDatas[index].hitRatio)*100;
      }
    }
    this.requestHitRatioData = temp;
  }
  caculateRequestHitRatio(){
    this.averageHitRatio = this.dataRequestHitRatio.data[0].totalAvg * 100;
    this.peakHitRatio = Math.max(...this.dataRequestHitRatio.data[0].hitRatioDatas.map(x=>parseFloat(x.hitRatio))) * 100;
  }
  getRequestHitRatio(){
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '1h';
    }
    this.apiRequestCallProcessing[2]=true;
    this.offSpining();
    this.wafService.queryRequestHitRatio({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,dataInterval:dataInterval}).subscribe({
      next: (res) => {
        this.dataRequestHitRatio = res;
        this.apiRequestCallProcessing[2]=false;
        this.offSpining();
        this.fillRequestHitRatio();
        this.caculateRequestHitRatio();
        this.draw();
        this.createDailyTableData();
      },
      error: (error) => {
        this.apiRequestCallProcessing[2]=false;
        this.offSpining();
        console.log(error);
      }
    })
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
    
    if(this.currentTab=='bandwidth'){
      this.getDataBandwidth();
      this.getDataTraffic();
      this.getDataBack2Origin();// for bandwidth
      this.getBandwidthSaving();

      this.getTop10BandwidthSaving();
    }else{
      this.getDataBack2Origin();// for request
      this.getEdgeRequestNumber();
      this.getRequestHitRatio();

      this.getTop10HitRatio();
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

    if(this.currentTab=='bandwidth'){
      this.getDataBandwidth();
      this.getDataTraffic();
      this.getDataBack2Origin();// for bandwidth
      this.getBandwidthSaving();

      this.getTop10BandwidthSaving();
    }else{
      this.getDataBack2Origin();// for request
      this.getEdgeRequestNumber();
      this.getRequestHitRatio();
      this.getTop10HitRatio();
    }
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
    if(tabName=="bandwidth"){
      this.getDataBandwidth();
      this.getDataTraffic();
      this.getDataBack2Origin();// for bandwidth
      this.getBandwidthSaving();

      this.getTop10BandwidthSaving();
    }
    if(tabName=="requests"){
      this.getEdgeRequestNumber();
      this.getDataBack2Origin();// for request
      this.getRequestHitRatio();
      this.getTop10HitRatio();
    }
    this.selectedTypeRequest = "EDGE";
  }
  changeTypeRequest(){
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
  groupByDateAndGetMax(x: string[], y: number[]): Array<{ dateTime: string, max: number, total: number }> {
    const dateMaxMap: { [key: string]: { dateTime: string, max: number, total: number } } = {};

    for (let i = 0; i < x.length; i++) {
        const dateTime = x[i];
        const date = dateTime.split(' ')[0]; // Lấy phần ngày 'YYYY-MM-DD'
        const value = y[i];
      
        if (!dateMaxMap[date]) {
            dateMaxMap[date] = { dateTime: dateTime, max: value, total: value };
        } else {
            dateMaxMap[date].total += value;
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
        total: dateMaxMap[date].total
    }));

    return resultArray;
  }

  getTop10BandwidthSaving(){
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '1h';
    }
    const requests = this.domains.map(domain => {
      return this.wafService.getBandWidthSaving({
        dateFrom: this.fromDate,
        dateTo: this.toDate,
        dataInterval: dataInterval,
        domain: [domain]
      }).pipe(
        catchError(error => {
          console.log(`Error fetching data for domain ${domain}:`, error);
          return of(null); // Hoặc giá trị mặc định nào đó
        })
      );
    });
  
    forkJoin(requests).subscribe({
      next: (results) => {
        var table = [];
        results.forEach((result, index) => {
          if (result && result.data &&  result.data.length > 0) { 
            console.log(`Data for domain ${this.domains[index]}:`, result);
            var rs:QueryRequesBandwidthtSavingRatioResponse = result;
            var maxPeak = Math.max(...rs.data[0].savingBandwidthDatas.map(x=>parseFloat(x.savingBandwidth))) * 100;
            var average = rs.data[0].totalAvg * 100;
            table.push({domain:this.domains[index], peak:maxPeak, average:average})
          } else {
            console.log(`No data for domain ${this.domains[index]}`);
          }
        });
        this.top10SavingTable = table.sort((a, b) => b.peak - a.peak);
      },
      error: (error) => {
        console.log('Overall error:', error);
      }
    });
  }

  getTop10HitRatio(){
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '1h';
    }
    const requests = this.domains.map(domain => {
      return this.wafService.queryRequestHitRatio({
        dateFrom: this.fromDate,
        dateTo: this.toDate,
        dataInterval: dataInterval,
        domain: [domain]
      }).pipe(
        catchError(error => {
          console.log(`Error fetching data for domain ${domain}:`, error);
          return of(null); // Hoặc giá trị mặc định nào đó
        })
      );
    });
  
    forkJoin(requests).subscribe({
      next: (results) => {
        var table = [];
        results.forEach((result, index) => {
          if (result && result.data &&  result.data.length > 0) { 
            console.log(`Data for domain ${this.domains[index]}:`, result);
            var rs:QueryRequestHitRatioResponse = result;
            var maxPeak = Math.max(...rs.data[0].hitRatioDatas.map(x=>parseFloat(x.hitRatio))) * 100;
            var average = rs.data[0].totalAvg * 100;
            table.push({domain:this.domains[index], peak:maxPeak, average:average})
          } else {
            console.log(`No data for domain ${this.domains[index]}`);
          }
        });
        this.top10HitRatioTable = table.sort((a, b) => b.peak - a.peak);
      },
      error: (error) => {
        console.log('Overall error:', error);
      }
    });
  }
}