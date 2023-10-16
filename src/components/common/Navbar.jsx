import { Stack, Typography, Button } from '@mui/material'
import AddLocationModal from '../modal/AddLocationModal'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'

const Navbar = () => {
  const [openLocationModal, setOpenLocationModal] = useState(false)

  const handleOpenModal = () => {
    setOpenLocationModal(true)
  }

	return (
		<Stack
			py={2}
			sx={{
				width: '100vw',
				height: '10vh',
				background: 'var(--mint-color)',
				color: 'var(--blue-color)',
				alignItems: 'center',
			}}
			direction={'row'}
			justifyContent={'space-between'}
			px={4}
		>
			<Typography
				variant='p'
				className='caveat-font'
				sx={{
					fontSize: 48,
					fontWeight: 700,
				}}
			>
				Dokoka
			</Typography>

			<Button
				variant='outlined'
				size='sm'
				sx={{
					height: 'fit-content',
				}}
        onClick={handleOpenModal}
			>
				Add New
			</Button>

      <AddLocationModal
        open={openLocationModal}
        handleClose={() => setOpenLocationModal(false)}
        locationId={uuid()}
      />
		</Stack>
	)
}

export default Navbar
