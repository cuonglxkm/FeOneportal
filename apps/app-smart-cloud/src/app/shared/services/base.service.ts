import {Injectable} from '@angular/core';
import {environment} from "@env/environment";


export abstract class BaseService {
  protected baseUrl: string;

  protected constructor() {
    this.baseUrl = environment.baseUrl;
  }
}
