import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { Coordinates } from "../types/coordinates"

export const useStore = create(
    combine({ coordinates: null as Coordinates}, 
        (set) => ({
            setCoordinates: (currentCoords: Coordinates) => {
                set({ coordinates: currentCoords });
                console.log("New Coordinates via useStore:", currentCoords);
            },
        })
    )
);
