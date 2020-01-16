import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import Colors from "../constants/Colors";
import ENV from "../env";

const MapScreen = props => {
  const initialLocation = props.navigation.getParam("initialLocation");
  const readonly = props.navigation.getParam("readonly");

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const mapRegion = {
    latitude: selectedLocation ? selectedLocation.lat : 13.6829333,
    longitude: selectedLocation ? selectedLocation.lng : -89.2365912,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008
  };

  const selectLocationHandler = event => {
    console.log(event);
    if (readonly) {
      return;
    }
    setSelectedLocation({
      lat: event.nativeEvent.coordinate.latitude,
      lng: event.nativeEvent.coordinate.longitude
    });
  };

  const savePickedLocationHandler = useCallback(() => {
    if (!selectedLocation) {
      // could show an alert
      return;
    }
    props.navigation.navigate("NewPlace", { pickedLocation: selectedLocation });
  }, [selectedLocation]);

  useEffect(() => {
    props.navigation.setParams({ saveLocation: savePickedLocationHandler });
  }, [savePickedLocationHandler]);

  let markerCoordinates;

  if (selectedLocation) {
    markerCoordinates = {
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng
    };
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        onPress={selectLocationHandler}
      >
        {markerCoordinates && (
          <Marker
            title="Picked Location"
            coordinate={markerCoordinates}
          ></Marker>
        )}
      </MapView>
      {!readonly && (
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search"
            minLength={1}
            autoFocus={false}
            returnKeyType={"search"}
            fetchDetails={true}
            query={{
              //available options: https://developers.google.com/places/web-service/autocomplete
              key: `${ENV.googleApiKey}`,
              language: "en", // language of the results
              components: "country:sv"
              // default: 'geocode'
            }}
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              console.log(details);
              setSelectedLocation(details.geometry.location);
            }}
            styles={{
              textInputContainer: {
                width: "100%"
              },
              description: {
                fontWeight: "bold"
              },
              predefinedPlacesDescription: {
                color: "#1faadb"
              },
              listView: {
                backgroundColor: "white"
              }
            }}
            currentLocation={false}
          />
        </View>
      )}
    </View>
  );
};

MapScreen.navigationOptions = navData => {
  const saveFn = navData.navigation.getParam("saveLocation");
  const readonly = navData.navigation.getParam("readonly");
  if (readonly) {
    return {};
  }
  return {
    headerRight: () => (
      <TouchableOpacity style={styles.headerButton} onPress={saveFn}>
        <Text style={styles.headerButtonText}>Save</Text>
      </TouchableOpacity>
    )
  };
};

const styles = StyleSheet.create({
  container: {
    height: "100%"
  },
  map: {
    flex: 1
  },
  searchContainer: {
    position: "absolute",
    width: "100%"
  },
  headerButton: {
    marginHorizontal: 20
  },
  headerButtonText: {
    fontSize: 16,
    color: Platform.OS === "android" ? "white" : Colors.primary
  }
});

export default MapScreen;
