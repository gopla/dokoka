import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Stack } from '@mui/material'
import { useOutletContext } from 'react-router-dom'

const MapComponent = () => {
	const [markers, setMarkers] = useState([])
	const [locations] = useOutletContext()

	const locationsData = Object.values(locations) ?? []

	useEffect(() => {
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
		})
	}, [locations])

	return (
		<Stack
			p={3}
			sx={{
				alignItems: 'center',
			}}
		>
			<MapContainer center={[-7.983908, 112.621391]} zoom={10}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				{markers.map((marker, index) => (
					<Marker key={index} position={marker.geocode}>
						<Popup>{marker.popUp}</Popup>
					</Marker>
				))}
			</MapContainer>
		</Stack>
	)
}

export default MapComponent
