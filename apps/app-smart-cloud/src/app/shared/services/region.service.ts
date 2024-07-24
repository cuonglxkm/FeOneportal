import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private _previousRegionId: number;

  get previousRegionId(): number {
    return this._previousRegionId;
  }

  set previousRegionId(value: number) {
    this._previousRegionId = value;
  }
}