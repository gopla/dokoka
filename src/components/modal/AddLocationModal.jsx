import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getGeocodeFromLink } from '../../utils/helper'
import { ref, set, update } from 'firebase/database'
import { database, storage, useFirebase } from '../../utils/firebase'
import { getDownloadURL, ref as sRef, uploadBytes } from "firebase/storage";
import Swal from 'sweetalert2'

const AddLocationModal = ({ open, handleClose, locationId }) => {
  const locations_ref = ref(database, `locations/${locationId}`)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    geocode: [],
    googleMapsLink: '',
    image: '',
  })

  const [image, setImage] = useState(null)
  const [loadingImage, setLoadingImage] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      geocode: [],
      googleMapsLink: '',
      image: '',
    })
    setImage(null)
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
      image: formData.image,
    })

    resetForm()
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Location added successfully',
    })
    handleClose()
  }

  const uploadImage = async (e) => {
    setDisabled(true)
    setLoadingImage(true)
    const file = e.target.files[0]
    const storageRef = sRef(storage, `images/${locationId}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    if (url) {
      setImage(url)
      setFormData({ ...formData, image: url })
      setLoadingImage(false)
      setDisabled(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New</DialogTitle>

      <DialogContent>
        <Stack direction={'row'}>
          <TextField
            label="Google Maps Link"
            margin="dense"
            autoFocus
            fullWidth
            name="googleMapsLink"
            value={formData.googleMapsLink ?? ''}
            onChange={handleChange}
          />
        </Stack>

        <Stack direction={'row'}>
          <TextField
            label="Name"
            margin="dense"
            fullWidth
            name="name"
            value={formData.name ?? ''}
            onChange={handleChange}
          />
        </Stack>

        <Stack direction={'row'}>
          <TextField
            label="Description"
            margin="dense"
            fullWidth
            multiline
            rows={3}
            name="description"
            value={formData.description ?? ''}
            onChange={handleChange}
          />
        </Stack>

        <Stack mt={1} p={'2px'} gap={2}>
          Image
          <Box
            component={'img'}
            src={image}
            sx={{
              width: 150,
              height: 150,
            }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{
              width: '30%',
            }}
          >
            {loadingImage ? <CircularProgress color='inherit' size={20} /> : 'Upload'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                uploadImage(e)
              }}
            />
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'space-evenly',
        }}
      >
        <Button onClick={handleClose} disabled={disabled}>Cancel</Button>

        <Button onClick={handleAdd} disabled={disabled}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddLocationModal
