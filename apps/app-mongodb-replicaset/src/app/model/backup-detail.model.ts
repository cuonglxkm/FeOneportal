export interface BackupDetail {
  id: number;
  schedule_name: string;
  backup_type:number;
  created_date: Date;
  period_schedule: number;
  auto_manual_schedule: number;
  status_id: number;
  next_run_time: Date;
  keep_number: number;
  backup_expiry: number;
  username: string;
  passwords: string;
  hour_minutes: number;
  daily_hour: number;
  daily_minutes: number;
  weekly_day: string;
  weekly_hour: number;
  weekly_minutes: number;
  monthly_type: number;
  monthly_hour: number;
  monthly_minute: number;
  monthly_day: number;
  updated_date: Date;
  updated_user_id: number;
  created_user_id: number;
  created_user_name: string;
}