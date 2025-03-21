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
        Geometry: string;
        SeverityCode: number;
        Severity: string;
        LocationDescription: string;
        EndTime: string;
}

export interface MapSignageData {
    key: string;
    iconUrl: string;
    iconSize: string[];
    popupAnchor: string[];
    popupLabel: string;
    popupMessage: string; 
    mapCoordinates: string;
}