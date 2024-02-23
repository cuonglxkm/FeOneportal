export interface AccessLog {
  userAction: string;
  operation: string;
  resource: string;
  resourceType: string;
  note: string;
  opTime: number;
}

export interface FetchAccessLogs {
  userAction: string;
  resource: string;
  resourceType: string;
  operation: string;
  fromDate: number;
  toDate: number;
  serviceOrderCode: string;
  page: number;
  size: number;
}
