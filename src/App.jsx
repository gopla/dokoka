import { Stack } from '@mui/material'
import Navbar from './components/common/Navbar'
import MapComponent from './components/maps/MapComponent'
import { Route, Routes } from 'react-router-dom'
import { Suspense } from 'react'
import SuspenseFallback from './components/common/SuspenseFallback'
import AppContext from './context/AppContext'

const App = () => {
	return (
		<Suspense fallback={<SuspenseFallback />}>
			<Stack display={'flex'} width='100vw'>
				<Navbar />
				<Stack>
					<Routes>
						<Route path='/' element={<AppContext />}>
							<Route index element={<MapComponent />} />
						</Route>
					</Routes>
				</Stack>
			</Stack>
		</Suspense>
	)
}

export default App
