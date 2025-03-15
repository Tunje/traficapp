export interface IncidentData {
    Publication: string;
    Modified: string;
    Deviation: IncidentDeviationData[];
}

export interface IncidentDeviationData {
        DeviationId: string;
        Icon: string;
        Message: string;
        MessageCode: string;
        RestrictedLanes?: number;
        RestrictionType?: string; 
        SeverityCode: number,
        Severity: string;
        LocationDescription: string;
        EndTime: string;
}