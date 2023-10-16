export const getGeocodeFromLink = (link) => {
	const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/
	const matches = regex.exec(link)

	if (matches) {
		const latitude = parseFloat(matches[1])
		const longitude = parseFloat(matches[2])

		return { latitude, longitude }
	} else {
		return { latitude: null, longitude: null}
	}
}
