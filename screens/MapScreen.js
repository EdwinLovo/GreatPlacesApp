import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Button,
  Dimensions
} from "react-native";
import Modal from "react-native-modal";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import Colors from "../constants/Colors";
import ENV from "../env";

const MapScreen = props => {
  const initialLocation = props.navigation.getParam("initialLocation");
  const readonly = props.navigation.getParam("readonly");
  const [pressed, setPressed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const mapRegion = {
    latitude: selectedLocation ? selectedLocation.lat : 13.6829333,
    longitude: selectedLocation ? selectedLocation.lng : -89.2365912,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008
  };

  const selectLocationHandler = event => {
    //console.log(event);
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

  let defaultMarkersCoords = [];
  defaultMarkersCoords.push({
    coords: {
      latitude: 13.6813997,
      longitude: -89.2355658
    },
    image: require("../assets/icons/icono-casa.png"),
    title: "Home"
  });
  defaultMarkersCoords.push({
    coords: {
      latitude: 13.6826387,
      longitude: -89.2372231
    },
    image: require("../assets/icons/icono-efectivo.png"),
    title: "Bank"
  });

  return (
    <View style={styles.container}>
      <Modal
        isVisible={isModalVisible}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <View style={styles.modal}>
          <Text>Hello!</Text>
          <Button
            title="Hide modal"
            onPress={() => {
              setIsModalVisible(!isModalVisible);
            }}
          />
        </View>
      </Modal>
      <MapView
        style={styles.map}
        region={mapRegion}
        onPress={selectLocationHandler}
      >
        {markerCoordinates && (
          <Marker title="Picked Location" coordinate={markerCoordinates}>
            {/* <Image
              source={require("../assets/icons/icono-casa.png")}
              style={{ height: 35, width: 35 }}
            /> */}
          </Marker>
        )}
        {defaultMarkersCoords.map(data => {
          return (
            <Marker
              identifier={data.title}
              title={data.title}
              key={data.title}
              coordinate={data.coords}
              onPress={event => {
                console.log(event);
                setIsModalVisible(!isModalVisible);
              }}
            >
              <Image source={data.image} style={{ height: 22, width: 22 }} />
            </Marker>
          );
        })}
        {/* {defaultMarkersCoords.forEach(data => renderMarkers(data))} */}
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
              //console.log(details);
              console.log(details);
              setPressed(false);
              setSelectedLocation(details.geometry.location);
            }}
            listViewDisplayed={pressed}
            textInputProps={{
              onFocus: () => setPressed(true),
              onBlur: () => setPressed(false)
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
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width
  },
  map: {
    flex: 1
  },
  searchContainer: {
    position: "absolute",
    width: Dimensions.get("window").width * 0.9,
    paddingLeft: Dimensions.get("window").width * 0.1,
    paddingTop: 15
  },
  headerButton: {
    marginHorizontal: 20
  },
  headerButtonText: {
    fontSize: 16,
    color: Platform.OS === "android" ? "white" : Colors.primary
  },
  modal: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").height * 0.15,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-around"
  }
});

export default MapScreen;
