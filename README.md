# GIS Points App 

This is a full-stack web application that allows users to add and visualize geographic points on a map centered around Dubai. It uses ArcGIS Maps SDK for JavaScript (Frontend) and ASP.NET Core Web API (Backend).

Points are only accepted if they are within a **10 km air-radius** of the Dubai center. The map shows driving distance from the center in a popup.

---
### 🔧 Backend (ASP.NET Core 8.0)
- ASP.NET Core Web API
- `System.Device.Location` for air distance validation
- ArcGIS Geometry Server (optional, for air distance matching)
- C#
- In-memory storage (via static list)
---
### 🗺️ Frontend
- HTML + Bootstrap 5
- Vanilla JavaScript
- ArcGIS Maps SDK for JavaScript (v4.28)
- ArcGIS Directions REST API (for road distance)

---

## 🚀 How to Run the Application

### Prerequisites
- [.NET SDK 8.0](https://dotnet.microsoft.com/download)
- Visual Studio 2022+ or VS Code
- ArcGIS Developer account (free trial)
- Replace your API key (see below)

### 1. Clone the Repo

```bash
git clone https://github.com/AnasAlfar/GISSolution.git
cd GISSolution

2. Replace ArcGIS API Key
In wwwroot/gis/map.js, find this line:

```js
const apiKey = "YOUR_API_KEY_HERE";

```

3. Replace API url inside GisWeb with your local host port
In wwwroot/gis/map.js, find this line:

```js
const API_BASE_URL = 'https://localhost:7225';
```
Then run the project or click on F5 it's open two windows (Api+Frontend). 

📡 API Endpoints
➕ POST /api/points
Add a new geographic point.
Request Body:
```json
{
  "name": "My Location",
  "lat": 25.1923,
  "lng": 55.2312
}
```
- ✅ Returns 201 Created if valid and within 10 km air radius

- ❌ Returns 400 Bad Request if too far or invalid

📥 GET /api/points
Returns all stored points.
Response:
```json

[
  {
    "name": "My Location",
    "lat": 25.1923,
    "lng": 55.2312
  }
]
```

⚠ Known Issues or Limitations
- Points are only stored in-memory (not saved to database)
- Data is lost when the app restarts
- Road distance is used only for display, not for validation

🙋‍♂️ Author
Developed by [Anas Alfar] — GIS-enabled backend developer with ASP.NET Core
