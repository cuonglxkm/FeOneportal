import {Injectable} from '@angular/core';
import {environment} from "@env/environment";


export abstract class BaseService {

  ENDPOINT = {
    provisions: '/provisions',
    configurations: '/configurations',
    orders: '/orders',
    subscriptions: '/subscriptions',
    users: '/users',
    catalogs: '/catalogs',
    actionlogs: '/actionlogs',

  }
  protected baseUrl: string;

  protected constructor() {
    this.baseUrl = environment.baseUrl;
  }
}
