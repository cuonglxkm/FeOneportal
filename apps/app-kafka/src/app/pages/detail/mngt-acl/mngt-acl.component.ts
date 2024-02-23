import { Component, OnInit } from '@angular/core';
import { KafkaCredential } from '../../../core/models/kafka-credential.model';
import { KafkaCredentialsService } from '../../../services/kafka-credentials.service';
import { filter, map } from 'rxjs';
import { camelizeKeys } from 'humps';

@Component({
  selector: 'one-portal-mngt-acl',
  templateUrl: './mngt-acl.component.html',
  styleUrls: ['./mngt-acl.component.css'],
})
export class MngtAclComponent implements OnInit {
  listOfPrincipals: KafkaCredential[];
  serviceOrderCode = 'kafka-s1hnuicj7u7g';

  constructor(
    private credentialService: KafkaCredentialsService,
  ) {
    
  }

  ngOnInit() {
    this.getCredentials();
  }

  getCredentials() {
    this.credentialService
      .getCredentials('', this.serviceOrderCode, 1, 9999)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.listOfPrincipals = camelizeKeys(data.results) as KafkaCredential[];
      });
  }
}
