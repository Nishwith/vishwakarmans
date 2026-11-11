import { useState, useCallback } from "react";

export const DEFAULT_COORDINATES = {
  latitude: 17.3850,
  longitude: 78.4867,
  isFallback: true,
};

/**
 * Custom hook to request and manage user geolocation coordinates.
 * Falls back to central Hyderabad coordinates (17.3850, 78.4867) on denial or failure.
 */
export const useGeolocation = (defaultCoords = DEFAULT_COORDINATES) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getPosition = useCallback(
    (options = { enableHighAccuracy: true, timeout: 10000 }) => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !navigator.geolocation) {
          const errMsg = "Geolocation is not supported by your browser.";
          setError(errMsg);
          setCoordinates(defaultCoords);
          resolve(defaultCoords);
          return;
        }

        setLoading(true);
        setError(null);
        setPermissionDenied(false);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              isFallback: false,
            };
            setCoordinates(coords);
            setLoading(false);
            resolve(coords);
          },
          (geoError) => {
            let message = "Unable to retrieve your location.";
            let isDenied = false;

            if (geoError.code === 1) {
              message = "Location permission denied. Using default location (Hyderabad).";
              isDenied = true;
            } else if (geoError.code === 2) {
              message = "Location position unavailable. Using default location.";
            } else if (geoError.code === 3) {
              message = "Location request timed out. Using default location.";
            }

            setPermissionDenied(isDenied);
            setError(message);
            setCoordinates(defaultCoords);
            setLoading(false);
            resolve(defaultCoords);
          },
          options
        );
      });
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

