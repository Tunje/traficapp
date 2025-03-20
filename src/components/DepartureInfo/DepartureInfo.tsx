//Sudipta's departures component will go here.
import React, { useState } from 'react';

import { useEffect} from "react";

const [DepartureData, setDepartureData] = useState(null);

const DepartureInfo = () => {
  const data = [
    { from: "New York", to: "Los Angeles", platform: 3, type: "Train", time: "10:30 AM" },
    { from: "Chicago", to: "Houston", platform: 5, type: "Bus", time: "11:00 AM" },
    { from: "San Francisco", to: "Seattle", platform: 2, type: "Flight", time: "1:15 PM" },
    { from: "Boston", to: "Miami", platform: 4, type: "Train", time: "3:45 PM" }
  ];

  const API_KEY= "9ddd8ace-4853-44ee-955e-4a1c4bda39f3";
  const API_URL="";
  const lat= 56.0465;
  const lon= 12.6945;
  const input= "Hjo";

  useEffect(() => {
      const fetchDepartureData = async () => {
        try {
           
          const currentResponse = await fetch(
            `https://api.resrobot.se/v2.1/location.name?input=${input}&format=json&accessId=${API_KEY}`
          );
  
          if (!currentResponse.ok) {
            throw new Error("Failed to fetch Departure data");
          }
  
          const currentData = await currentResponse.json();
          console.log(currentData);
  
          //setDepartureData({
           // stop: currentResponse.stopLocationOrCoordLocation[0].StopLocation.id,
           // departure: response.Departure[0],
           // arival: Response.Arrival,
          //  });
        } catch (err) {
          
          console.error("Weather fetch error:", err);
        }
      };
  
          
           
          });
      




  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Transport Departure</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">From</th>
            <th className="border border-gray-300 px-4 py-2">To</th>
            <th className="border border-gray-300 px-4 py-2">Platform</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
            <th className="border border-gray-300 px-4 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="text-center border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{item.from}</td>
              <td className="border border-gray-300 px-4 py-2">{item.to}</td>
              <td className="border border-gray-300 px-4 py-2">{item.platform}</td>
              <td className="border border-gray-300 px-4 py-2">{item.type}</td>
              <td className="border border-gray-300 px-4 py-2">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepartureInfo;


