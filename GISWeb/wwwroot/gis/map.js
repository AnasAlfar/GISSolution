var dojoConfig = {
    async: true,
    packages: []
};

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/Graphic",
    "esri/geometry/geometryEngine",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/SpatialReference"
], function (
    Map, MapView, Point, Circle, Graphic, geometryEngine, GraphicsLayer,
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, webMercatorUtils, SpatialReference
) {

    const API_BASE_URL = 'https://localhost:7225';

    const map = new Map({
        basemap: "streets-vector"
    });

    const view = new MapView({
        container: "mapView",
        map: map,
        center: [55.296249, 25.276987],
        zoom: 12,
        spatialReference: SpatialReference.WebMercator
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    const dubaiCenterWGS84 = new Point({
        longitude: 55.296249,
        latitude: 25.276987,
        spatialReference: SpatialReference.WGS84
    });

    const dubaiCenterWebMercator = webMercatorUtils.geographicToWebMercator(dubaiCenterWGS84);

    const circle = new Circle({
        center: dubaiCenterWebMercator,
        radius: 10000,
        radiusUnit: "meters",
        spatialReference: SpatialReference.WebMercator
    });

    const circleGraphic = new Graphic({
        geometry: circle,
        symbol: new SimpleFillSymbol({
            color: [150, 150, 255, 0.2],
            outline: new SimpleLineSymbol({
                color: [0, 0, 255],
                width: 2
            })
        })
    });

    graphicsLayer.add(circleGraphic);
    // check if map load or not
    view.when(() => {
        console.log("Map is loaded");
        loadPoints();
    });

    document.getElementById("pointForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const lat = parseFloat(document.getElementById("latitude").value);
        const lng = parseFloat(document.getElementById("longitude").value);

        const pointWGS84 = new Point({
            longitude: lng,
            latitude: lat,
            spatialReference: SpatialReference.WGS84
        });

        const pointWebMercator = webMercatorUtils.geographicToWebMercator(pointWGS84);

        const distance = geometryEngine.distance(
            dubaiCenterWebMercator,
            pointWebMercator,
            "meters"
        );

        if (distance > 10000) {
            alert("Point must be within 10km radius of Dubai center");
            return;
        }

        fetch(`${API_BASE_URL}/api/points`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                lat: lat,
                lng: lng
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to save point");
                return response.json();
            })
            .then(savedPoint => {
                addPointToMap(savedPoint);
                document.getElementById("pointForm").reset();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error saving point: " + error.message);
            });
    });

    function loadPoints() {
        fetch(`${API_BASE_URL}/api/points`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                if (response.status === 204) return [];
                return response.json();
            })
            .then(points => {
                if (points && points.length) {
                    points.forEach(point => addPointToMap(point));
                }
            })
            .catch(error => console.error("Error loading points:", error));
    }

    // show point on map
    function addPointToMap(pointData) {
        const from = [55.296249, 25.276987]; // Dubai location
        const to = [pointData.lng, pointData.lat];

        const markerSymbol = new SimpleMarkerSymbol({
            color: [226, 119, 40],
            outline: new SimpleLineSymbol({ color: [255, 255, 255], width: 1 }),
            size: 8
        });

        // ArcGis Route Api to get actual distence between Dubai center and the point (not air route) 
        const routeUrl = "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve";
        const apiKey = "YOUR_API_KEY_HERE";

        const stops = `${from[0]},${from[1]};${to[0]},${to[1]}`;
        const params = new URLSearchParams({
            f: "json",
            token: apiKey,
            stops: stops,
            returnDirections: false,
            returnRoutes: true
        });

        fetch(`${routeUrl}?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                const km = data.routes.features[0].attributes.Total_Kilometers;
                const distText = `${km.toFixed(2)} km (road)`;

                const pointWGS84 = new Point({
                    longitude: pointData.lng,
                    latitude: pointData.lat,
                    spatialReference: SpatialReference.WGS84
                });

                const pointWebMercator = webMercatorUtils.geographicToWebMercator(pointWGS84);

                const pointGraphic = new Graphic({
                    geometry: pointWebMercator,
                    symbol: markerSymbol,
                    attributes: {
                        name: pointData.name,
                        distance: distText
                    },
                    popupTemplate: {
                        title: "{name}",
                        content: "Driving distance from center: {distance}"
                    }
                });

                graphicsLayer.add(pointGraphic);
            })
            .catch(err => {
                console.error("Routing failed", err);
                alert("Failed to calculate driving distance.");
            });
    }

});