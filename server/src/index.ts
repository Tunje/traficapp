import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleMapsData } from "./types";

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

app.get("/api/station-location", async (req: express.Request, res: express.Response): Promise<void> => {
    const latitude = req.query.latitude as string | undefined;
    const longitude = req.query.longitude as string | undefined;
    if (!latitude || !longitude) {
        res.status(400).json({ error: "Need valid coordinates with latitude and longitude."});
        return;
    }
    try {
        const API_KEY = process.env.RESROBOT_API_KEY;
        const departuresResponse = await fetch(
            `https://api.resrobot.se/v2.1/location.nearbystops?originCoordLat=${latitude}&originCoordLong=${longitude}&format=json&accessId=${API_KEY}`
          );
  
          if (!departuresResponse.ok) {
            throw new Error("Fel vid hämtning av data");
          }
  
          const departureData: any = await departuresResponse.json();
          const stations = departureData.stopLocationOrCoordLocation || [];
          if (stations.length > 0) {
            const nearestStation = stations[0].StopLocation.extId;
            res.json(nearestStation);
            return;
    }} catch (error) {
        console.error("Error fetching:", error);
        res.status(500).json({ error: "Internal server error" }); 
    }
})

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
  
          const departureInfoData: any = await departuresResponse.json();
          if (departureInfoData) {
            res.json(departureInfoData.Departure);
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