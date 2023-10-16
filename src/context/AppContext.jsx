import { ref } from 'firebase/database'
import { database, useFirebase } from '../utils/firebase'
import { Outlet } from 'react-router-dom'

const AppContext = () => {
	const locations_ref = ref(database, `locations`)
	const locations = useFirebase(locations_ref)

	return <Outlet context={[locations, locations_ref]} />
}

export default AppContext
