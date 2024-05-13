export class BackupList {
  id: number;
  schedule_name: string;
  backup_name: string;
  backup_size: string;
  created_date: string;
  type: string;
  status: string;
  created_name: string;
  start_time: Date;
  end_time: Date;
  status_flag: boolean;
  next_run_time: Date;
  constructor(){
    
  }
}
