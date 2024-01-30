import { Component, Input, OnInit } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { KafkaCredentialsService } from '../../../services/kafka-credentials.service';
import { KafkaCredential } from '../../../core/models/kafka-credential.model';
import { camelizeKeys } from 'humps';

@Component({
  selector: 'one-portal-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css'],
})
export class CredentialsComponent implements OnInit {
  @Input() serviceOrderCode: string;

  // 0: list, 1: create
  tabStatus: number;

  stringSearch: string;
  page: number;
  size: number;
  total: number;
  credentials: KafkaCredential[];

  constructor(private kafkaCredentialService: KafkaCredentialsService) {
    this.tabStatus = 0;
    
    this.stringSearch = '';
    this.page = 1;
    this.size = 10;
    this.total = 0;
  }

  ngOnInit(): void {
    this.getCredentials();
  }

  updateForm(data: any) {
    //
  }
  forgotPass(data: any) {
    //
  }
  deleteUser(data: any) {
    //
  }

  changePage($event) {
    this.page = $event;
    this.getCredentials();
    
  }

  changeSize($event) {
    this.size = $event;
    this.getCredentials();
  }

  changeTabStatus(tab: number) {
    this.tabStatus = tab;
  }

  getCredentials() {
    this.kafkaCredentialService
      .getCredentials(
        this.stringSearch,
        this.serviceOrderCode,
        this.page,
        this.size
      )
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.total = data.totals;
        this.size = data.size;
        this.credentials = camelizeKeys(data.results);
      });
  }
}
