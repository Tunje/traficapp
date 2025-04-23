export type Coordinates = {
    latitude: number,
    longitude: number
} | null;

export interface GoogleMapsData  
{ results: 
    { geometry: 
        { location: 
            { lat: number; lng: number } 
        } 
    }[]; 
};

export interface rawStopLocation {
    StopLocation: {
        productAtStop: string[],
        timezoneOffset: number,
        id: string,
        extId: string,
        name: string,
        lon: number,
        lat: number,
        weight: number,
        dist: number,
        products: number,
        minimumChangeDuration: string
    }
}

export type cleanStopLocation = {
    stationId: string,
    stationName: string,
}