import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Button, Stack } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import { Icon, divIcon, point } from 'leaflet'
import assets from '../../assets'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { DeleteForever } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { ref, set, update } from 'firebase/database'
import { database, useFirebase } from '../../utils/firebase'

const MapComponent = () => {
  const [markers, setMarkers] = useState([])
  const [locations, locations_ref] = useOutletContext()

  const locationsData = locations ? Object.values(locations) : []

  useEffect(() => {
    setMarkers([])

    locationsData?.map((location) => {
      setMarkers((prev) => [
        ...prev,
        {
          geocode: location.geocode,
          id: location.id,
          popUp: (
            <div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
              <a href={location.googleMapsLink} target="_blank">
                Open in Google Maps
              </a>
            </div>
          ),
        },
      ])
    })
  }, [locations])

  const customIcon = new Icon({
    iconUrl: assets.images.marker,
    iconSize: [38, 38],
  })

  const createClusterCustomIcon = function (cluster) {
    return new divIcon({
      html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
      className: 'custom-marker-cluster',
      iconSize: point(33, 33, true),
    })
  }

  const handleDeleteMarker = (marker) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this location!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it!',
    })
      .then(async (result) => {
        if (result.isConfirmed) {
          await deleteMarkerFromDatabase(marker)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const deleteMarkerFromDatabase = async (marker) => {
    const newLocations = locationsData.filter(
      (location) => location.id !== marker.id,
    )
    const locationsRef = ref(database, `locations/${marker.id}`)
    await set(locationsRef, null)

    Swal.fire({
      title: 'Deleted!',
      text: 'Your location has been deleted.',
      icon: 'success',
      confirmButtonText: 'Ok',
    })
  }

  return (
    <Stack
      p={3}
      sx={{
        alignItems: 'center',
      }}
    >
      <MapContainer center={[-7.983908, 112.621391]} zoom={12}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.geocode} icon={customIcon}>
              <Popup>
                <Stack>
                  {marker.popUp}
                  <Stack
                    direction={'row'}
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      padding: 1,
                    }}
                  >
                    <DeleteForever
                      sx={{
                        cursor: 'pointer',
                        color: 'red',
                      }}
                      onClick={() => handleDeleteMarker(marker)}
                    />
                  </Stack>
                </Stack>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </Stack>
  )
}

export default MapComponent
