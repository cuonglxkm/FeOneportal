
/*
 * Task object
 * */
export interface TaskObj {
    id: number;
    taskName: string;
    taskDesc: string;
    taskEvaluate: null;
    equipmentId: number;
    equipmentName: string;
    systemName: string;
    systemId: number;
    taskState: number;
    userName: string;
    taskStateName: string;
    taskUserId: string | string[];
    checkPeriod: string;
    createTime: number;
    updateTime: number;
    endTime: number;
    startTime: number;
    finishRate: number;
}
