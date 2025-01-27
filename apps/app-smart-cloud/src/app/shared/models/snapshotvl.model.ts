import { SnapshotVolumeDto } from '../dto/snapshot-volume.dto';

export class GetListSnapshotVlModel {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  previousPage: number;
  records: SnapshotVolumeDto[];
}

export class ScheduleSnapshotVL {
  volumeName: string;
  name: string;
  serviceId: number;
  description: string;
  mode: number;
  runtime: string;
  maxSnapshot: number;
  interval: number;
  duration: number;
  dates: number;
  daysOfWeek: string;
  createdAt: string;
  updatedAt: any;
  status: string;
  nextRuntime: string;
  currentSnapshot: any;
  proccessId: any;
  serviceType: number;
  warningMessage: any;
  snapshotPackageId: number;
  customerId: any;
  regionId: any;
  projectId: any;
  id: number;
}

export class Contract {
  id: number;
  code: string;
  createdDate: string;
  suspendDate: string;
  expiredDate: string;
}

export class CreateScheduleSnapshotDTO {
  dayOfWeek: string;
  daysOfWeek: string[];
  description: string;
  intervalWeek: number;
  mode: number;
  dates: number;
  duration: number;
  name: string;
  volumeId: number;
  runtime: any;
  intervalMonth: number;
  maxBaxup: number;
  snapshotPacketId: number;
  customerId: number;
  projectId: number;
  regionId: number;
  serviceInstanceId: any;
  maxSnapshot: number;
  snapshotType: any;
}

export class EditSnapshotVolume {
  id: number;
  name: string;
  description: string;
}

export class UpdateScheduleSnapshot {
  id: number;
  dayOfWeek: string;
  daysOfWeek: string[];
  description: string;
  intervalWeek: number;
  mode: number;
  dates: number;
  duration: number;
  name: string;
  runtime: string;
  intervalMonth: number;
  customerId: number;
  projectId: number;
  regionId: number;
}

export class FormSearchScheduleSnapshot{
  pageSize: number;
  pageNumber: number;
  regionId: number;
  projectId: number;
  name: string;
  volumeName: string;
  ssPackageId: string;
  state:any;
}
