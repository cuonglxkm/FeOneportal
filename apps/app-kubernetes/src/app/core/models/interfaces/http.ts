export interface HttpCustomConfig {
    needSuccessInfo?: boolean; // Do you need a 'Operation Successful' prompt?
    showLoading?: boolean; // Do you need loading?
    otherUrl?: boolean; // Is it a third-party API?
  }
  
  export interface ActionResult<T> {
    code: number;
    msg: string;
    data: T;
  }
  