import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Stack,
	TextField,
	Button,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getGeocodeFromLink } from '../../utils/helper'
import { ref, set, update } from 'firebase/database'
import { database, useFirebase } from '../../utils/firebase'
import Swal from 'sweetalert2'

const AddLocationModal = ({ open, handleClose, locationId }) => {
	const locations_ref = ref(database, `locations/${locationId}`)

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		geocode: [],
		googleMapsLink: '',
	})

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}))
	}

	const handleAdd = () => {
		const { latitude, longitude } = getGeocodeFromLink(formData.googleMapsLink)
		if (!latitude || !longitude) {
			return Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Invalid Google Maps Link',
			})
		}

		set(locations_ref, {
			id: locationId,
			name: formData.name,
			description: formData.description,
			geocode: [latitude, longitude],
			googleMapsLink: formData.googleMapsLink,
		})

		setFormData({
			name: '',
			description: '',
			geocode: [],
			googleMapsLink: '',
		})
		Swal.fire({
			icon: 'success',
			title: 'Success',
			text: 'Location added successfully',
		})
		handleClose()
	}

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
			<DialogTitle>Add New</DialogTitle>

			<DialogContent>
				<Stack direction={'row'}>
					<TextField
						label='Google Maps Link'
						margin='dense'
						autoFocus
						fullWidth
						name='googleMapsLink'
						value={formData.googleMapsLink ?? ''}
						onChange={handleChange}
					/>
				</Stack>

				<Stack direction={'row'}>
					<TextField
						label='Name'
						margin='dense'
						fullWidth
						name='name'
						value={formData.name ?? ''}
						onChange={handleChange}
					/>
				</Stack>

				<Stack direction={'row'}>
					<TextField
						label='Description'
						margin='dense'
						fullWidth
						name='description'
						value={formData.description ?? ''}
						onChange={handleChange}
					/>
				</Stack>
			</DialogContent>

			<DialogActions
				sx={{
					justifyContent: 'space-evenly',
				}}
			>
				<Button onClick={handleClose}>Cancel</Button>

				<Button onClick={handleAdd}>Add</Button>
			</DialogActions>
		</Dialog>
	)
}

export default AddLocationModal
