import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WafService } from 'src/app/shared/services/waf.service';
import { QueryBacktoOriginTrafficAndRequestResponse, QueryBandwidthForMultiDomainResponse2, QueryRequesBandwidthtSavingRatioResponse, QueryRequestHitRatioResponse, QueryTrafficForMultiDomainResponse, QueryTrafficRequestInTotalAndPeakValueResponse } from '../../waf.model';
import { differenceInCalendarDays, setHours, format  } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { el } from 'date-fns/locale';
import { catchError, forkJoin, of } from 'rxjs';
import * as e from 'express';
import { saveAs } from 'file-saver';
import { XlsxService } from '@delon/abc/xlsx';
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
  totalEdgeTraffic: number = 0;
  totalB2OTraffic: number = 0;
  totalEdgeNumberRequest: number = 0;
  peakEdgeNumberRequest: number = 0;
  totalB20NumberRequest: number = 0;
  peakB20NumberRequest: number = 0;
  dataBandwidthSaving: QueryRequesBandwidthtSavingRatioResponse;
  averageBandwidthSaving: number = 0;
  averageHitRatio: number = 0;
  peakHitRatio: number = 0;
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
    private notification: NzNotificationService,
    private xlsx: XlsxService) {
    
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
        this.selectDomainOptions = res.map(x=>({label:x.domain,value:x.id}));
        this.selectedDomain = res.map(x=>x.id);
        this.domains = res.map(x=>x.domain);
        this.isValid=this.selectedDomain.length>0;
        if(!this.isValid){
          this.notification.warning('',"Không có dữ liệu!");
          return;
        }
        this.getDataBandwidth();
        this.getDataTraffic();
        this.getDataBack2Origin();
        this.getBandwidthSaving();
        //daily table
        this.createDailyTableData();
        this.getTop10BandwidthSaving();
      },
      error: (error) => {
				this.notification.error('', "Lấy dữ liệu thất bại");
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

  caculateDailyTableBandwidthEdge(data: QueryTrafficRequestInTotalAndPeakValueResponse){
    if(data.result.length==0){
      this.peakEdgeTable=[];
      this.renderPeakTable();
      return;
    }
    var timestamps = data.result[0].flowRequestData.map(x=>x.timestamp+":00");
    var bandwidths = data.result[0].flowRequestData.map(x=>parseFloat(x.bandwidth));
    var flows = data.result[0].flowRequestData.map(x=>parseFloat(x.flow));
    var maxEdges= this.groupByDateAndGetMax2(timestamps,bandwidths,flows);
    this.peakEdgeTable=maxEdges.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      bandwidth:x.max,
      total: Math.ceil(x.total / 1024 * 100) / 100
    })).reverse();
    if(this.peakEdgeTable[0].date == format(this.toDate, 'yyyy-MM-dd')){
      this.peakEdgeTable.shift();
    }
    this.renderPeakTable();
  }
  caculateDailyTableBandwidthB2O(data: QueryBacktoOriginTrafficAndRequestResponse){
    if(data.result.length==0){
      this.peakB2OTable=[];
      this.renderPeakTable();
      return;
    }
    var timestamps = data.result.map(x=>x.flowRequestOriginData[0].timestamp+":00");
    var bandwidths = data.result.map(x=>parseFloat(x.flowRequestOriginData[0].bandwidth));
    var flows = data.result.map(x=>parseFloat(x.flowRequestOriginData[0].flow));
    var b2os= this.groupByDateAndGetMax2(timestamps,bandwidths,flows);
    this.peakB2OTable=b2os.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      bandwidth:x.max,
      total: Math.ceil(x.total / 1024 * 100) / 100
    })).reverse();
    if(this.peakB2OTable[0].date == format(this.toDate, 'yyyy-MM-dd')){
      this.peakB2OTable.shift();
    }
    this.renderPeakTable();
  }
  caculateDailyTableBandwidthSaving(data: QueryRequesBandwidthtSavingRatioResponse){
    if(data.data.length==0){
      this.peakSavingTable=[];
      this.renderPeakTable();
      return;
    }
    var timestamps = data.data[0].savingBandwidthDatas.map(x=>x.timestamp+(this.selectedTypeDate=='fiveminutes'?':00':':00:00'));
    var savingBandwidtds = data.data[0].savingBandwidthDatas.map(x=>parseFloat(x.savingBandwidth));
    var b2os= this.groupByDateAndGetMax(timestamps,savingBandwidtds);
    this.peakSavingTable=b2os.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      peak:x.max*100,
      average:0
    })).reverse();

    if(this.peakSavingTable[0].date == format(this.toDate, 'yyyy-MM-dd')){
      this.peakSavingTable.shift();
    }

    if(this.selectedTypeDate=='fiveminutes'){
      this.peakSavingTable[0].average = data.data[0].totalAvg*100;
      this.renderPeakTable();
    }else{
      this.wafService.getBandWidthSaving({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:'1d',domain:this.domains}).subscribe({
        next: (res) => {
          this.peakSavingTable.forEach(x=>{
            var bandwidth = res.data[0].savingBandwidthDatas.find(y=>y.timestamp.split(' ')[0]==x.date);
            x.average = bandwidth ? parseFloat(bandwidth.savingBandwidth)*100 : 0;
          });
          this.renderPeakTable();
        },
        error: (error) => {
          this.notification.error('', "Lấy dữ liệu thất bại");
				  console.log(error);
        }
      })
    } 
    
    
  }
  caculateDailyTableRequestHitRatio(data: QueryRequestHitRatioResponse){
    if(data.data.length==0){
      this.totalHitRatioTable=[];
      this.renderPeakTable();
      return;
    }
    var timestamps = data.data[0].hitRatioDatas.map(x=>x.timestamp+(this.selectedTypeDate=='fiveminutes'?':00':':00:00'));
    var hitRatios = data.data[0].hitRatioDatas.map(x=>parseFloat(x.hitRatio));
    var HRs= this.groupByDateAndGetMax(timestamps,hitRatios);
    this.totalHitRatioTable=HRs.map(x=>({
      date:x.dateTime.split(' ')[0],
      time:x.dateTime.split(' ')[1],
      peak:x.max*100,
      average: 0
    })).reverse();
    
    if(this.totalHitRatioTable[0].date == format(this.toDate, 'yyyy-MM-dd')){
      this.totalHitRatioTable.shift();
    }
    if(this.selectedTypeDate=='fiveminutes'){
      this.totalHitRatioTable[0].average = data.data[0].totalAvg<0 ? 0 : data.data[0].totalAvg*100;
      this.renderPeakTable();
    }
    else{
      this.wafService.queryRequestHitRatio({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,dataInterval:'1d'}).subscribe({
        next: (res) => {
          this.totalHitRatioTable.forEach(x=>{
            var bandwidth = res.data[0].hitRatioDatas.find(y=>y.timestamp.split(' ')[0]==x.date);
            x.average = bandwidth ? parseFloat(bandwidth.hitRatio)*100 : 0;
          });
          this.renderPeakTable();
        },
        error: (error) => {
          this.notification.error('', "Lấy dữ liệu thất bại");
				  console.log(error);
        }
      })
    } 
  }
  createDailyTableData(){
    if(this.currentTab=='bandwidth'){
      if(this.selectedTypeRequest =="EDGE"){
        this.wafService.queryTrafficRequestInTotalAndPeakValue({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,groupBy:null,dataPadding:null}).subscribe({
          next: (res) => {
            this.caculateDailyTableBandwidthEdge(res);
          },
          error: (error) => {
            this.notification.error('', "Lấy dữ liệu thất bại");
				console.log(error);
          }
        })
      }

      if(this.selectedTypeRequest =="B2O"){
        this.wafService.getBacktoOriginTrafficAndRequest({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:'5m',domain:this.domains,groupBy:[],backsrcOnly:null}).subscribe({
          next: (res) => {
            this.caculateDailyTableBandwidthB2O(res);
          },
          error: (error) => {
            this.notification.error('', "Lấy dữ liệu thất bại");
				console.log(error);
          }
        })
      }

      if(this.selectedTypeRequest =="BSR"){
        if(this.selectedTypeDate =='fiveminutes'){
          var dataInterval = '5m';
        }else{
          var dataInterval = '1h';
        }
        this.wafService.getBandWidthSaving({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:dataInterval,domain:this.domains}).subscribe({
          next: (res) => {
            this.caculateDailyTableBandwidthSaving(res);
          },
          error: (error) => {
            this.notification.error('', "Lấy dữ liệu thất bại");
				    console.log(error);
          }
        })
      }
    }
    else{

      if(this.requestNumberData.length==0){
        this.totalEdgeRequestTable=[];
      }else{
        var maxEdges= this.groupByDateAndGetMax(this.xAxis,this.requestNumberData);
        this.totalEdgeRequestTable=maxEdges.map(x=>({
          date:x.dateTime.split(' ')[0],
          total:x.total
        })).reverse();
        this.totalEdgeRequestTable.push({
          date:'Total',
          total: this.totalEdgeRequestTable.reduce((a, b) => a + b.total, 0)
        })
      }
      
      if(!this.back2OriginRequestData || this.back2OriginRequestData.length==0){
        this.totalB2ORequestTable=[];
      }
      else{
        var maxB2O= this.groupByDateAndGetMax(this.xAxis,this.back2OriginRequestData);
        this.totalB2ORequestTable=maxB2O.map(x=>({
          date:x.dateTime.split(' ')[0],
          total:x.total
        })).reverse();

        this.totalB2ORequestTable.push({
          date:'Total',
          total: this.totalB2ORequestTable.reduce((a, b) => a + b.total, 0)
        })
      }

      if(this.selectedTypeRequest =="HR"){
        if(this.selectedTypeDate =='fiveminutes'){
          var dataInterval = '5m';
        }else{
          var dataInterval = '1h';
        }
        this.wafService.queryRequestHitRatio({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,dataInterval:dataInterval}).subscribe({
          next: (res) => {
            this.caculateDailyTableRequestHitRatio(res);
          },
          error: (error) => {
            this.notification.error('', "Lấy dữ liệu thất bại");
				console.log(error);
          }
        })
      }
      
      
      this.renderPeakTable();
    }
    
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
        timestamp: max ? this.xAxis[this.bandWidthData.indexOf(max)]:null
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
    if(!this.isSpinning)
      this.isSpinning = true;
    this.apiCallProcessing[0]=true;
    this.wafService.bandwidthForMultiDomain(this.fromDate,this.toDate,this.selectedTypeDate,this.domains).subscribe({
      next: (res) => {
        this.apiCallProcessing[0]=false;
        this.offSpining();
        this.dataBandwidth = res;
        this.bandWidthData = this.dataBandwidth.bandwidthReport.map(x=>x.bandwidth);
        this.fillBandwidthData();
        this.caculateEdge()
        this.draw();
        //this.createDailyTableData();
      },
      error: (error) => {
        this.apiCallProcessing[0]=false;
        this.offSpining();
        this.notification.error('', "Lấy dữ liệu thất bại");
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
        this.notification.error('', "Lấy dữ liệu thất bại");
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
    var sum = 0;
    for(var i=0; i<this.xAxis.length; i++){
      var timestamp = this.xAxis[i];
      if(this.selectedTypeDate=='fiveminutes'){
        var index = back2OriginDatas.findIndex(x=>x.flowRequestOriginData[0].timestamp==timestamp);
        if(index==-1){
          temp[i]=null;
        }else{
          temp[i]= parseInt(back2OriginDatas[index].flowRequestOriginData[0].request);
        }
      }
      else
      {
        var current = new Date(timestamp);
        current.setHours(current.getHours() - 1);
        let formattedDate = current.getFullYear() + '-' + 
                  String(current.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(current.getDate()).padStart(2, '0') + ' ' + 
                  String(current.getHours()).padStart(2, '0');
        var index1 = back2OriginDatas.findIndex(x=>x.flowRequestOriginData[0].timestamp==timestamp);
        var totalRequest = back2OriginDatas.filter(x=>x.flowRequestOriginData[0].timestamp.startsWith(formattedDate) && !x.flowRequestOriginData[0].timestamp.endsWith(':00:00')).reduce((a, b) => a + parseInt(b.flowRequestOriginData[0].request), 0);
        temp[i]= totalRequest;
        if(index1>-1){
          temp[i]+= parseInt(back2OriginDatas[index1].flowRequestOriginData[0].request);
        }
        sum+=temp[i];
        console.log(current,sum)
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
    if(this.dataBack2Origin.result.length==0){
      this.totalB20NumberRequest = 0;
      this.peakB20NumberRequest = 0;
      return;
    }
    if(this.dataBack2Origin.result[0].flowRequestOriginData[0].timestamp == format(this.fromDate, 'yyyy-MM-dd HH:mm:ss')){
      this.dataBack2Origin.result.shift();
    }
    this.totalB20NumberRequest = this.dataBack2Origin.result.reduce((a, b) => a + parseFloat(b.flowRequestOriginData[0].request), 0);
    this.peakB20NumberRequest = Math.max(...this.back2OriginRequestData);
  }
  
  getDataBack2Origin(){
    if(!this.isSpinning)
      this.isSpinning = true;
    if(this.currentTab=='bandwidth'){
      this.apiCallProcessing[2]=true;
    }else{
      this.apiRequestCallProcessing[1]=true;
    }
    if(this.selectedTypeDate =='fiveminutes'){ //api chỉ hỗ trợ 5m
      var dataInterval = '5m';
    }else{
      var dataInterval = '5m';
    }
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
          this.createDailyTableData();
        }
        
        this.draw();
      },
      error: (error) => {
        if(this.currentTab=='bandwidth'){
          this.apiCallProcessing[2]=false;
        }else{
          this.apiRequestCallProcessing[1]=false;
        }
        this.offSpining();
        this.notification.error('', "Lấy dữ liệu thất bại");
				console.log(error);
      }
    })
  }

  caculateBandwidthSaving(){
    if(this.dataBandwidthSaving.data.length==0){
      this.averageBandwidthSaving = 0;
      this.peakSaving={
        savingBandwidth: 0,
        timestamp: null
      };
      return;
    }
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
    if(!this.isSpinning)
      this.isSpinning = true;
    this.apiCallProcessing[1]=true;
    this.wafService.getBandWidthSaving({dateFrom:this.fromDate,dateTo:this.toDate,dataInterval:dataInterval,domain:this.domains}).subscribe({
      next: (res) => {
        this.dataBandwidthSaving = res;
        this.apiCallProcessing[1]=false;
        this.offSpining();
        this.fillBandwidthSavingData();
        this.caculateBandwidthSaving();
        this.draw();
        //.createDailyTableData();
      },
      error: (error) => {
        this.apiCallProcessing[1]=false;
        this.offSpining();
        this.notification.error('', "Lấy dữ liệu thất bại");
				console.log(error);
      }
    })
  }
  fillBandwidthSavingData(){
    if(this.dataBandwidthSaving.data.length==0){
      this.bandWidthSavingData = [];
      return;
    }

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
          var savingBw = parseFloat(savingBandwidthDatas[index].savingBandwidth);
          temp[i]= savingBw<0? 0: savingBw * 100;
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
          var savingBw = parseFloat(savingBandwidthDatas[index].savingBandwidth);
          temp1[i]=  savingBw<0? 0: savingBw * 100;
        }
      }
      this.bandWidthSavingData = temp1;
    }
  }
  fillRequestNumber(){
    if(this.dataRequestNumber.result.length==0){
      this.requestNumberData = [];
      return;
    }
    var temp = [];
    var requestNumberDatas = this.dataRequestNumber.result[0].flowRequestData;
    requestNumberDatas.forEach(x=>x.timestamp+=':00');
    
    if(this.selectedTypeDate =='hourly'){
      let requestInHour = 0;
      let currentHour = requestNumberDatas[0].timestamp.split(' ')[1].split(':')[0];
      requestNumberDatas.forEach(x=>{
        requestInHour+=parseInt(x.request);
        var hour = x.timestamp.split(' ')[1].split(':')[0];
        if(currentHour!=hour){
          x.totalRequestInHour = requestInHour;
          currentHour = hour;
          requestInHour = 0;
        }
      });
    } 

    for(var i=0; i<this.xAxis.length; i++){
      var timestamp = this.xAxis[i];
      var index = requestNumberDatas.findIndex(x=>x.timestamp==timestamp);
      if(index==-1){
        temp[i]=null;
      }else{
        if(this.selectedTypeDate=='fiveminutes'){
          temp[i]= parseInt(requestNumberDatas[index].request);
        }else{
          temp[i]= requestNumberDatas[index].totalRequestInHour;
        }
      }
    }
    this.requestNumberData = temp;
  }
  caculateRequestNumber(){
    if(this.requestNumberData.length==0){
      this.totalEdgeNumberRequest = 0;
      this.peakEdgeNumberRequest = 0;
      return;
    }
    this.totalEdgeNumberRequest = parseFloat(this.dataRequestNumber.result[0].totalRequest);
    if(this.selectedTypeDate=='fiveminutes'){
      this.peakEdgeNumberRequest = parseFloat(this.dataRequestNumber.result[0].peakRequest);
    }else{
      this.peakEdgeNumberRequest = Math.max(...this.dataRequestNumber.result[0].flowRequestData.map(x=>x.totalRequestInHour?x.totalRequestInHour:null));
    }
  }
  getEdgeRequestNumber(){ 
    if(!this.isSpinning)
      this.isSpinning = true;
    this.apiRequestCallProcessing[0]=true;
    this.wafService.queryTrafficRequestInTotalAndPeakValue({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,groupBy:null,dataPadding:null}).subscribe({
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
        this.notification.error('', "Lấy dữ liệu thất bại");
				console.log(error);
      }
    })
  }
  fillRequestHitRatio(){
    if(this.dataRequestHitRatio.data.length==0){
      this.requestHitRatioData = [];
      return;
    }
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
        var savingBw = parseFloat(requestHitRatioDatas[index].hitRatio);
        temp[i]= savingBw<0? 0: savingBw*100;
      }
    }
    this.requestHitRatioData = temp;
  }
  caculateRequestHitRatio(){
    if(this.dataRequestHitRatio.data.length == 0){
      this.averageHitRatio=0;
      this.peakHitRatio=0;
      return;
    }
    this.averageHitRatio = this.dataRequestHitRatio.data[0].totalAvg <0? 0: this.dataRequestHitRatio.data[0].totalAvg * 100;
    this.peakHitRatio = Math.max(...this.dataRequestHitRatio.data[0].hitRatioDatas.map(x=>parseFloat(x.hitRatio))) * 100;
  }
  getRequestHitRatio(){
    if(this.selectedTypeDate =='fiveminutes'){
      var dataInterval = '5m';
    }else{
      var dataInterval = '1h';
    }
    if(!this.isSpinning)
      this.isSpinning = true;
    this.apiRequestCallProcessing[2]=true;
    this.wafService.queryRequestHitRatio({dateFrom:this.fromDate,dateTo:this.toDate,domain:this.domains,dataInterval:dataInterval}).subscribe({
      next: (res) => {
        this.dataRequestHitRatio = res;
        this.apiRequestCallProcessing[2]=false;
        this.offSpining();
        this.fillRequestHitRatio();
        this.caculateRequestHitRatio();
        this.draw();
        //this.createDailyTableData();
      },
      error: (error) => {
        this.apiRequestCallProcessing[2]=false;
        this.offSpining();
        this.notification.error('', "Lấy dữ liệu thất bại");
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
    var from = new Date(result[0]);
    var to = new Date(result[1]);
    from.setHours(0,0,0,0); 
    to.setHours(24,0,0,0);
    this.fromDate = from;
    this.toDate = to;
    var datediff= differenceInCalendarDays(this.toDate, this.fromDate);
    this.isDateValid =  datediff<= 31;
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
    
    this.createDailyTableData();
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
    
    this.createDailyTableData();
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
    this.selectedTypeRequest = "EDGE";
    if(!this.isValid){
      return;
    }
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
  }
  changeTypeRequest(){
    this.createDailyTableData();
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
  exportToExcel(): void {

    var titles = ['Date'];
    if(this.currentTab=='bandwidth'&& this.selectedTypeRequest!='BSR'){
      titles.push('Bandwidth Peak Time');
    }
    if(this.currentTab=='bandwidth'&& this.selectedTypeRequest!='BSR'){
      titles.push('Peak Bandwidth (Mbps)');
    }
    if(this.selectedTypeRequest=='BSR' || this.selectedTypeRequest=='HR'){
      if(this.selectedTypeRequest=='BSR'){
        titles.push('Peak Value')
      }else{
        titles.push('Peak')
      }
    }
    if(this.currentTab=='bandwidth'){
      if(this.selectedTypeRequest=='BSR'){
        titles.push('Average')
      }else{
        titles.push('Total Traffic (GB)');
      }
    }else{
      if(this.selectedTypeRequest=='HR'){
        titles.push('Average')
      }else{
        if(this.selectedTypeRequest=='EDGE'){
          titles.push('Total request')
        }else{
          titles.push('Total origin requests')  
        }
      }
    }
    var datas = this.peakTable.map(item => {
      var data = [item.date];
      if(this.currentTab=='bandwidth' && this.selectedTypeRequest!='BSR'){
        data.push(item.time);
      }
      if(this.currentTab=='bandwidth' && this.selectedTypeRequest!='BSR'){
        data.push(item.bandwidth?.toFixed(2));
      }
      if(this.selectedTypeRequest=='BSR' || this.selectedTypeRequest=='HR'){
        data.push(item.peak?.toFixed(2));
      }
      if(this.selectedTypeRequest=='BSR' || this.selectedTypeRequest=='HR'){
        data.push(item.average?.toFixed(2)+'%')
      }
      else{
        if(this.currentTab=='bandwidth'){
          data.push(item.total?.toFixed(2));
        }else{
          item.total
        }
      }
      return data;
    });
    const sheetData = [titles, ...datas];
    this.xlsx.export({
      sheets: [
        {
          data: sheetData,
          name: 'Sheet1',
        }
      ],
      filename: this.currentTab=='bandwidth'? 'Edge Bandwidth-Traffic Daily Data.xlsx':'Edge Requests Daily Data.xlsx',
    });
  }
  exportToExcelTop10(): void {

    var titles = ['Rank','Domain'];
    if(this.currentTab=='bandwidth'){
      titles.push('Peak Value (%)');
    }else{
      titles.push('Peak (%)');
    }
    titles.push('Average (%)');
    var datas=[];
    if(this.currentTab=='bandwidth'){
      datas= this.top10SavingTable.map((item,index) => {
        var data = [index+1,item.domain,item.peak?.toFixed(2)+'%',item.average?.toFixed(2)+'%'];
        return data;
      });
    }else{
      datas= this.top10HitRatioTable.map((item,index) => {
        var data = [index+1,item.domain,item.peak?.toFixed(2)+'%',item.average?.toFixed(2)+'%'];
        return data;
      });
    }
    
    const sheetData = [titles, ...datas];
    this.xlsx.export({
      sheets: [
        {
          data: sheetData,
          name: 'Sheet1',
        }
      ],
      filename: this.currentTab=='bandwidth'? 'TOP Saves BtO Bandwidth Ranking.xlsx':'TOP Hit Ratio Ranking.xlsx',
    });
  }
}