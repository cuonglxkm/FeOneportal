import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProgressData } from '../model/cluster.model';

@Injectable({
  providedIn: 'root',
})
export class ShareService {

  private progressData = new Subject<ProgressData>();
  public $progressData = this.progressData.asObservable();

  emitData(data: ProgressData) {
    this.progressData.next(data);
  }

}
