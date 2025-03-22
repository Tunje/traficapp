import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { GoogleMapsData } from "./types";

dotenv.config();
const app = express();
const PORT = process.env || 3000;

app.use(express.json());

const clientPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientPath))

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
          console.log("New coordinates from App", data.results[0]);
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


app.get("*", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(clientPath, "index.html"));
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});