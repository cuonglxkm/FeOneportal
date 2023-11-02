import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { ExampleService } from '@services/example/example.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-session-timeout',
  templateUrl: './session-timeout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionTimeoutComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Timeout',
    breadcrumb: ['Home', 'Features', 'Timeout'],
    desc: 'Example of user login expiration. If redis times out, the login box will pop up again. If the login is successful, the original interface will be resent. If the ' + ' login fails, it will jump to the login page. '
  };

  constructor(private dataService: ExampleService) {}

  go(): void {
    this.dataService.sessionTimeOut().subscribe();
  }

  ngOnInit(): void {}
}
