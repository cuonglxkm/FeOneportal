import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private _previousRegionId: number;
  private _isInit: boolean = false;
  private _isFirstLoad: boolean = true;

  get previousRegionId(): number {
    return this._previousRegionId;
  }

  set previousRegionId(value: number) {
    this._previousRegionId = value;
  }

  get isInit(): boolean {
    return this._isInit;
  }

  set isInit(value: boolean) {
    this._isInit = value;
  }

  get isFirstLoad(): boolean {
    return this._isFirstLoad;
  }

  set isFirstLoad(value: boolean) {
    this._isFirstLoad = value;
  }
}