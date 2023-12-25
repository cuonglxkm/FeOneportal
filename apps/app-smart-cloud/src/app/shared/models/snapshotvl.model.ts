import {SnapshotVolumeDto} from "../dto/snapshot-volume.dto";

export class GetListSnapshotVlModel{
  totalCount: number;
  pageSize: number;
  currentPage: number;
  previousPage: number;
  records: SnapshotVolumeDto[];
}
export class EditSnapshotVolume{
  id: number;
  name: string;
  description: string;
}

export class ScheduleSnapshotVLDTO{

}


export class CreateScheduleSnapshotDTO{
  dayOfWeek: string;
  daysOfWeek: [];
  description: string;
  intervalWeek: number;
  mode: number
  dates: number;
  duration: number;
  name: string;
  volumeId: number;
  runtime: string;
  intervalMonth: number;
  maxBaxup: number;
  snapshotPacketId: number;
  customerId: number;
  projectId: number;
  regionId: number;
}

export class SnapshotScheduleDetailDTO{
  id: number;
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
  updatedAt: string;
  status: string;
  nextRuntime: string;
  currentSnapshot: number;
  proccessId: string;
  serviceType: number;
  warningMessage: string;
  snapshotPackageId: number;
  volumeName: string
}
