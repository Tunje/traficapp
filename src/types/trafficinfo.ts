export interface SituationApiData {
    PublicationTime: string;
    ModifiedTime: string;
    Deviation: DeviationApiData[];
}

export interface IncidentData {
    Publication: string;
    Modified: string;
    Deviation: IncidentDeviationData[];
}

export interface DeviationApiData {
    Id: string;
    IconId: string;
    Message: string;
    MessageCode: string;
    NumberOfLanesRestricted?: number;
    Geometry: {
      WGS84: string;
    };
    SeverityCode: number;
    SeverityText: string;
    LocationDescriptor: string;
    TrafficRestrictionType?: string;
    EndTime: string;
  }

export interface IncidentDeviationData {
        DeviationId: string;
        Icon: string;
        Message: string;
        MessageCode: string;
        RestrictedLanes?: number;
        RestrictionType?: string;
        Geometry: string | null;
        SeverityCode: number;
        Severity: string;
        LocationDescription: string;
        EndTime: string;
}

export interface SignageItem {
    key: string;
    popupLabel: string;
    popupMessage: string;
    severityCode: number;
    EndDate: string;
    mapCoordinates: [number, number];
    icons: { iconUrl: string; popupLabel: string }[];
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