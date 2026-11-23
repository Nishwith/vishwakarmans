import { useState, useCallback } from "react";
import { getCurrentLocation, DEFAULT_COORDINATES } from "../utils/geolocation";

export { DEFAULT_COORDINATES };

/**
 * Custom hook to request and manage user geolocation coordinates.
 * Uses fast, non-hanging strategy with IP-based fallback (approximate: true).
 * Falls back to central Hyderabad coordinates on denial.
 */
export const useGeolocation = (defaultCoords = DEFAULT_COORDINATES) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getPosition = useCallback(
    async (options) => {
      setLoading(true);
      setError(null);
      setPermissionDenied(false);

      try {
        const loc = await getCurrentLocation(options);
        const coords = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          approximate: Boolean(loc.approximate),
          isFallback: Boolean(loc.isFallback),
          city: loc.city || "",
        };
        setCoordinates(coords);
        setLoading(false);
        return coords;
      } catch (err) {
        const isDenied = Boolean(err?.isDenied || err?.code === 1);
        const message = isDenied
          ? "Location permission denied. Using default location (Hyderabad)."
          : err?.message || "Unable to retrieve your location.";

        setPermissionDenied(isDenied);
        setError(message);
        setCoordinates(defaultCoords);
        setLoading(false);
        return defaultCoords;
      }
    },
    [defaultCoords]
  );

  return {
    coordinates,
    loading,
    error,
    permissionDenied,
    getPosition,
    setCoordinates,
  };
};

export default useGeolocation;
