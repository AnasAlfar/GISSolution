using System.Device.Location;

namespace GISAPI.Services
{
    public class GeoValidationService
    {
        private static readonly GeoCoordinate DubaiCenter = new GeoCoordinate(25.276987, 55.296249);
        private const double MaxAllowedDistanceMeters = 10000;

        public bool IsWithinRadius(double lat, double lng, out double distanceMeters)
        {
            var submitted = new GeoCoordinate(lat, lng);
            distanceMeters = DubaiCenter.GetDistanceTo(submitted);
            return distanceMeters <= MaxAllowedDistanceMeters;
        }
    }
}
