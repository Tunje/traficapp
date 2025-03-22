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
