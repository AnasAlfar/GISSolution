using GISAPI.DTOs;
using GISAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Device.Location;

[ApiController]
[Route("api/[controller]")]
public class PointsController : ControllerBase
{
    private static readonly List<GeoPoint> _points = new();
    private readonly GeoValidationService _geoValidator;

    public PointsController(GeoValidationService geoValidator)
    {
        _geoValidator = geoValidator;
    }

    [HttpGet]
    public ActionResult<IEnumerable<GeoPoint>> Get()
    {
        return Ok(_points);
    }

    [HttpPost]
    public ActionResult<GeoPoint> Post([FromBody] GeoPoint point)
    {
        if (point == null || string.IsNullOrWhiteSpace(point.Name))
            return BadRequest("Invalid data");

        if (!_geoValidator.IsWithinRadius(point.Lat, point.Lng, out double distance))
        {
            return BadRequest($"Point is {(distance / 1000):F2} km from Dubai. Allowed distance be within 10 km.");
        }

        _points.Add(point);
        return CreatedAtAction(nameof(Get), point);
    }

}


