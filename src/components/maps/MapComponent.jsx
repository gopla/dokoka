import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Stack } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import { Icon, divIcon, point } from 'leaflet'
import assets from '../../assets'
import MarkerClusterGroup from 'react-leaflet-cluster'

const MapComponent = () => {
	const [markers, setMarkers] = useState([])
	const [locations] = useOutletContext()

	const locationsData = Object.values(locations) ?? []

  useEffect(() => {
    // Clear the markers array before populating it
    setMarkers([]);

    locationsData?.map((location) => {
      setMarkers((prev) => [
        ...prev,
        {
          geocode: location.geocode,
          popUp: (
            <div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
              <a href={location.googleMapsLink} target='_blank'>
                Open in Google Maps
              </a>
            </div>
          ),
        },
      ])
    });
  }, [locations]);


	const customIcon = new Icon({
		iconUrl: assets.images.marker,
		iconSize: [38, 38],
	})

  console.log(markers);

	const createClusterCustomIcon = function (cluster) {
		return new divIcon({
			html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
			className: 'custom-marker-cluster',
			iconSize: point(33, 33, true),
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
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
					{markers.map((marker, index) => (
						<Marker key={index} position={marker.geocode} icon={customIcon}>
							<Popup>{marker.popUp}</Popup>
						</Marker>
					))}
				</MarkerClusterGroup>
			</MapContainer>
		</Stack>
	)
}

export default MapComponent
