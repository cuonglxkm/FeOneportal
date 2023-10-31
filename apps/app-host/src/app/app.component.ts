import { Component } from '@angular/core';

@Component({
  selector: 'one-portal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'app-host';
  isCollapsed = false;
}
