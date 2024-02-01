import { Component } from '@angular/core';

@Component({
  selector: 'one-portal-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent {
  selectedIndex = 2;
  serviceOrderCode: string = 'kafka-s1hnuicj7u7g';

}
