import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FilterOptionModel } from '../core/models/monitoring-data.model';

@Injectable({ providedIn: 'root' })
export class SharedService {

  filterOption = new BehaviorSubject<FilterOptionModel>({
    resources: [],
    resourceType: 'topic',
    metrics: ['size'],
    interval: 300 * 1000
  });

}
