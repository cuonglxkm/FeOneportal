import { Component, OnInit } from '@angular/core';
import { KafkaService } from '../../../services/kafka.service';

@Component({
  selector: 'one-portal-summary-service',
  templateUrl: './summary-service.component.html',
  styleUrls: ['./summary-service.component.css'],
})
export class SummaryServiceComponent implements OnInit{
  listOfBrokerConfigs = [1, 2, 3]

  constructor(private kafkaService: KafkaService){
  }

  handleCopy(){
    return 
  }

  ngOnInit(): void {
    
      this.getBrokerConfigOfService();

       return
  }

  getBrokerConfigOfService(){
    
    this.kafkaService.getBrokerConfigOfService('kafka-s1hnuicj7u7g').subscribe(data => {
      
      console.log(data);
    })
  }
}
