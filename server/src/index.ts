import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import { cleanStopLocation, GoogleMapsData, rawStopLocation } from "./types";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//geocoding calls

app.get("/api/location", async (req: express.Request, res: express.Response): Promise<void> => {
    const address = req.query.address as string | undefined;

    if (!address) {
        res.status(400).json({ error: "Need an address query parameter."});
        return;
    }
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Google Maps API key.");
        }
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json() as GoogleMapsData;
        
        if (data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const shortName = data.results[0]
          res.json({ latitude: lat, longitude: lng});
          return;
        } else {
          res.status(404).json({ error: "Location not found."});
          return;
        }
    } catch (error) {
        console.error("Fel vid geokodning av adress:", error);
        res.status(500).json({ error: "Internal server error"});
    }
});

//weather calls

app.get("/api/weather", async (req: express.Request, res: express.Response): Promise<void> => {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;
    
    if (!latitude || !longitude) {
        res.status(400).json({ error: "Need valid coordinates with latitude and longitude."});
        return;
    }
    try {
        const API_KEY = process.env.WEATHER_API_KEY;
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
  
          if (!currentResponse.ok) {
            throw new Error("Fel vid hämtning av väderdata");
          }
  
          const currentData = await currentResponse.json();
          res.json(currentData);
    } catch (error) {
        
    }
})

app.get("/api/forecast", async (req: express.Request, res: express.Response): Promise<void> => {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;
    
    if (!latitude || !longitude) {
        res.status(400).json({ error: "Need valid coordinates with latitude and longitude."});
        return;
    }
    try {
        const API_KEY = process.env.WEATHER_API_KEY;
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
  
          if (!forecastResponse.ok) {
            throw new Error("Fel vid hämtning av väderdata");
          }
  
          const forecastData = await forecastResponse.json();
          res.json(forecastData);
    } catch (error) {
        console.error("Väder hämtning fel:", error);
    }
})

// departure calls

app.get("/api/departure-info", async (req: express.Request, res: express.Response): Promise<void> => {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;

    if (!latitude || !longitude) {
        res.status(400).json({ error: "Need valid coordinates with latitude and longitude."});
        return;
    }
    try {
        const API_KEY = process.env.RESROBOT_API_KEY;
        const stationsResponse = await fetch(
            `https://api.resrobot.se/v2.1/location.nearbystops?originCoordLat=${latitude}&originCoordLong=${longitude}&format=json&accessId=${API_KEY}`
          );
  
          if (!stationsResponse.ok) {
            throw new Error("Fel vid hämtning av data");
          }
  
          const stationData: any = await stationsResponse.json();
          const stations = stationData.stopLocationOrCoordLocation || [];
          if (stations.length > 0) {
            //Grab array of all stationIDs
            const stationsArray = stations.map(({ StopLocation }: rawStopLocation): cleanStopLocation => ({
                stationId: StopLocation.extId,
                stationName: StopLocation.name,
            }));

            let departures: any = null;
            let triedIndexes: number[] = [];
            let goodStationName: string = "";
            
            console.log("STATIONS", stationsArray);
            //If the API call returns an object with no "Departure" object, try the next object's station ID in the stationsArray.
            
            for (let index = 0; index < stationsArray.length; index++) {
                const station = stationsArray[index];
                console.log(`Trying station ${station.stationName}`);
                
                const departuresResponse = await fetch(
                    `https://api.resrobot.se/v2.1/departureBoard?id=${station.stationId}&format=json&accessId=${API_KEY}`
                );
                if (!departuresResponse.ok) {
                    continue;
                }
                const departuresData: any = await departuresResponse.json();
                if (departuresData.Departure && departuresData.Departure.length > 0) {
                    departures = departuresData.Departure;
                    departures.StationName = station.stationName;
                    break;
                }
                triedIndexes.push(index);
            }
                if (departures) {
                        console.log(departures);
                    res.json(departures)
                }
                }
            }
            catch (error) {
                console.error("Error fetching:", error);
                res.status(500).json({ error: "Internal server error" }); 
            }
        });

app.get("/api/departure-info", async (req: express.Request, res: express.Response): Promise<void> => {
    const stationId = req.query.stationId;
    if (!stationId) {
        res.status(400).json({ error: "Need a valid station ID."});
        return;
    }
    try {
        const API_KEY = process.env.RESROBOT_API_KEY;
        const departuresResponse = await fetch(
          `https://api.resrobot.se/v2.1/departureBoard?id=${stationId}&format=json&accessId=${API_KEY}`
          );
          if (!departuresResponse.ok) {
            throw new Error("Error fetching data");
          }
  
          const departuresData: any = await departuresResponse.json();
          if (departuresData) {
            const departures = departuresData.Departure || [];
            res.json(departures);
            return;
    }
} catch (error) {
        console.error("Data fetching error:", error);
        res.status(500).json({ error: "Internal server error" }); 
    }
})

// traffic info calls

app.get("/api/traffic", async (req: express.Request, res: express.Response): Promise<void> => {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;
    
    if (!latitude || !longitude) {
        res.status(400).json({ error: "Need valid coordinates with latitude and longitude."});
        return;
    }
    try {
        const trafikverketUrl = `https://api.trafikinfo.trafikverket.se/v2/data.json`;
        const API_KEY = process.env.TRAFIKVERKET_API_KEY;
        const requestBody = `<REQUEST>
        <LOGIN authenticationkey="${API_KEY}"/>
        <QUERY objecttype="Situation" schemaversion="1" limit="5">
            <FILTER>
                <NEAR name="Deviation.Geometry.WGS84" value="${encodeURIComponent(longitude)} ${encodeURIComponent(latitude)}"/>
            </FILTER>
        </QUERY>
        </REQUEST>`;
        const headers: Headers = new Headers();
        headers.set("Content-Type", "text/xml");
        headers.set("Accept", "application/json");
        const infoResponse = await fetch(
            `${trafikverketUrl}`,
            {
                method: "POST",
                headers: headers,
                body: requestBody
            }
        );

          const trafficData = await infoResponse.json();
          res.json(trafficData);
    } catch (error) {
        console.error("Data hämtning fel:", error);
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});