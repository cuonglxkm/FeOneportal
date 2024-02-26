import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { KafkaTopic } from 'apps/app-kafka/src/app/core/models/kafka-topic.model';
import { FilterOptionModel } from 'apps/app-kafka/src/app/core/models/monitoring-data.model';
import { AclKafkaService } from 'apps/app-kafka/src/app/services/acl-kafka.service';
import { ConsumerGroupKafkaService } from 'apps/app-kafka/src/app/services/consumer-group-kafka.service';
import { KafkaService } from 'apps/app-kafka/src/app/services/kafka.service';
import { SharedService } from 'apps/app-kafka/src/app/services/shared.service';
import { camelizeKeys } from 'humps';

@Component({
  selector: 'one-portal-monitoring-filter',
  templateUrl: './monitoring-filter.component.html',
  styleUrls: ['./monitoring-filter.component.css'],
})
export class MonitoringFilterComponent implements OnInit {
  @Input() serviceOrderCode: string;

  listRangeTime = [
    { label: "30s/lần", value: 30 },
    { label: "1 phút/lần", value: 60 },
    { label: "5 phút/lần", value: 300 },
    { label: "30 phút/lần", value: 1800 }
  ];
  listOfMetricsTopic = [
    { label: "Size", value: "size" },
    { label: "Bytes In", value: "byte_in" },
    { label: "Bytes Out", value: "byte_out" },
    { label: "Message In", value: "msg_in" },
    { label: "Tổng số message", value: "total_msg" },
    { label: "Phân bổ message trên partition", value: "msg_per_partition" }
  ];

  listOfMetricsConsumerGroup = [
    { label: "Message Consumer", value: "msg_cg" },
    { label: "Lag của Consumer Group", value: "lag_cg" },
  ];

  listOfResourceData: any[];
  listOfResourceTmp: any[];

  resourceType: string;
  intervalSelected: number;
  labelSelectList: string;
  setOfResources = new Set<string>();
  listOfLabelResource: string[];
  displayLabelResource: string;
  resourceKeyword: string;
  currentMetrics: string;

  setOfMetrics = new Set<string>();
  listOfLabelMetrics: string[];
  displayLabelMetrics: string;

  pageIndex = 1;
  pageSize = 1000;
  lenResource: number;

  interval: any;
  dataLoaded = false;

  constructor(
    // private topicService: TopicKafkaService,
    private kafkaService: KafkaService,
    private consumerGroupService: ConsumerGroupKafkaService,
    private aclService: AclKafkaService,
    private shareService: SharedService,
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.resourceType = "topic";
    this.intervalSelected = 300;
    this.lenResource = 0;
    this.labelSelectList = "Topics";
    this.listOfResourceTmp = [];
    this.listOfLabelResource = [];
    this.displayLabelResource = 'Chọn danh sách topic';
    this.resourceKeyword = "";
    this.currentMetrics = "";
    this.listOfLabelMetrics = [];
    this.displayLabelMetrics = "";

    this.updateCheckedMetrics(this.listOfMetricsTopic[0]);
    this.getListTopic();
  }

  getListTopic() {
    this.aclService.getListTopic(this.pageIndex, this.pageSize, "", this.serviceOrderCode)
      .subscribe((r) => {
        if (r && r.code == 200) {
          const resourceData = camelizeKeys(r.data.results) as KafkaTopic[];
          this.listOfResourceData = resourceData.map(item => item.topicName);
          this.listOfResourceTmp = this.listOfResourceData;
          if (this.listOfResourceData.length > 0) {
            this.updateCheckedResource(this.listOfResourceData[0]);
            this.onChangeInput();
          }
          this.dataLoaded = true;
        }
      });
  }

  getListConsumerGroup() {
    this.consumerGroupService.getListConsumerGroup(this.pageIndex, this.pageSize, "", this.serviceOrderCode)
      .subscribe((r) => {
        if (r && r.code == 200) {
          this.listOfResourceData = r.data.results.map(item => item.cgName);
          this.listOfResourceTmp = this.listOfResourceData;
          if (this.listOfResourceData.length > 0) {
            this.onChangeInput();
          }
        }
      });
  }

  onChangeInput() {
    const listOfSelectedMetrics = Array.from(this.setOfMetrics);

    if (listOfSelectedMetrics) {

      const resources = Array.from(this.setOfResources);
      const metrics = Array.from(this.setOfMetrics);
      const intervalTime: number = this.intervalSelected * 1000;

      const filterOption = new FilterOptionModel();
      filterOption.interval = intervalTime;
      filterOption.metrics = metrics;
      filterOption.resourceType = this.resourceType;
      filterOption.resources = resources;

      if (resources.length > 0) {
        this.shareService.filterOption.next(filterOption);
      }

      // this.interval = setInterval(() => {
      //   this.listOfResourceChartData = [];
      //   for (let metric of listOfSelectedMetrics) {
      //     this.getMonitoringData(resources, metric, this.intervalSelected, this.resourceType, this.serviceOrderCode);
      //   }
      // }, intervalTime);
    }
  }

  // ======================== resource ========================

  onSearchResource() {
    this.listOfResourceData = this.listOfResourceTmp.filter((item: string) => item.includes(this.resourceKeyword));
  }

  onChangeResource() {
    this.listOfResourceData = [];
    this.listOfLabelResource = [];
    this.setOfResources.clear();
    this.lenResource = 0;

    // reset metric selected  
    this.listOfLabelMetrics = [];
    this.setOfMetrics.clear();
    this.generateLabelMetrics();

    if (this.resourceType == "topic") {
      this.labelSelectList = "Topics";
      this.displayLabelResource = "Chọn danh sách topic";
      this.getListTopic();
    } else {
      this.labelSelectList = "Consumer Groups"
      this.displayLabelResource = "Chọn danh sách consumer group";
      this.getListConsumerGroup();
    }
    this.renderer.addClass(this.el.nativeElement.querySelector('#btn-resource'), 'btn-error');
    this.renderer.addClass(this.el.nativeElement.querySelector('#btn-metric'), 'btn-error');

  }

  onCheckResource(resource: string) {
    const tmp = Array.from(this.setOfResources);
    if (tmp.includes(resource)) return false;
    return true;
  }

  updateCheckedResource(resourceName: string) {
    // check exist
    if (this.setOfResources.has(resourceName)) {
      this.setOfResources.delete(resourceName);
      this.listOfLabelResource = this.listOfLabelResource.filter(label => label != resourceName);
    } else {
      this.setOfResources.add(resourceName);
      this.listOfLabelResource.push(resourceName);
    }
    const buttonResource = this.el.nativeElement.querySelector('#btn-resource');

    if (buttonResource) {
      if (this.listOfLabelResource.length == 0) {
        this.renderer.addClass(buttonResource, 'btn-error');
      } else {
        this.renderer.removeClass(buttonResource, 'btn-error');
      }
    }

    // get len
    this.lenResource = this.setOfResources.size;

    // generate label
    this.generateLabelResource();
  }

  generateLabelResource() {
    this.displayLabelResource = '';
    if (this.setOfResources.size == 0) {
      this.resourceType == 'topic' ? this.displayLabelResource = 'Chọn danh sách topic'
        : this.displayLabelResource = 'Chọn danh sách consumer group';
    } else {
      for (const entry of this.setOfResources) {
        const tmp = this.listOfResourceTmp.find(item => item == entry);
        this.displayLabelResource += tmp + ', ';
      }
    }
  }

  // =========================================================

  // ======================== metrics ========================

  updateCheckedMetrics(metric: any) {
    // check exist
    if (this.setOfMetrics.has(metric.value)) {
      this.setOfMetrics.delete(metric.value);
      this.listOfLabelMetrics = this.listOfLabelMetrics.filter(item => item != metric.label);
    } else {
      this.setOfMetrics.add(metric.value);
      this.listOfLabelMetrics.push(metric.label);
    }

    const buttonMetric = this.el.nativeElement.querySelector('#btn-metric');

    if (buttonMetric) {
      if (this.listOfLabelMetrics.length == 0) {
        this.renderer.addClass(buttonMetric, 'btn-error');
      } else {
        this.renderer.removeClass(buttonMetric, 'btn-error');
      }
    }

    // generate label
    this.generateLabelMetrics();
  }

  generateLabelMetrics() {
    this.displayLabelMetrics = '';
    if (this.setOfMetrics.size == 0) {
      this.displayLabelMetrics = 'Chọn danh sách metrics';
    } else {
      let resourceMetrics: { label: string, value: string }[];
      this.resourceType == 'topic' ? resourceMetrics = this.listOfMetricsTopic : resourceMetrics = this.listOfMetricsConsumerGroup;
      for (const entry of this.setOfMetrics) {
        const tmp = resourceMetrics.find(item => item.value == entry);
        this.displayLabelMetrics += tmp.label + ', ';
      }
    }
  }
}
