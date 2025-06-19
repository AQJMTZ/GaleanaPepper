import React, { useState } from 'react'

const PesaForm = () => {
	const [folio, setFolio] = useState('')
	const [tipoChile, setTipoChile] = useState('')
	const [peso, setPeso] = useState('')
	const [horaLlegada, setHoraLlegada] = useState('')

	const handleSubmit = (e) => {
		e.preventDefault()
		console.log({ folio, tipoChile, peso, horaLlegada })
	}

	return (
		<main className='container h-screen grid place-items-center mx-auto'>
			<form
				onSubmit={handleSubmit}
				className='flex flex-col gap-5 items-center border border-slate-700 rounded-md w-full max-w-md px-8 py-10 '
			>
				<h1 className='text-2xl font-bold text-center'>Registro de Pesaje</h1>

				<div className='space-y-3 w-full'>
					<div className='flex flex-col gap-2'>
						<label htmlFor='folio' className='text-sm font-semibold'>
							Folio:
						</label>
						<input
							id='folio'
							type='text'
							placeholder='Ej: 000123'
							className='border rounded-sm px-2 py-3 text-sm'
							value={folio}
							onChange={(e) => setFolio(e.target.value)}
						/>
					</div>

					<div className='flex flex-col gap-2'>
						<label htmlFor='tipo' className='text-sm font-semibold'>
							Tipo de Chile:
						</label>
						<input
							id='tipo'
							type='text'
							placeholder='Ej: Jalapeño'
							className='border rounded-sm px-2 py-3 text-sm'
							value={tipoChile}
							onChange={(e) => setTipoChile(e.target.value)}
						/>
					</div>

					<div className='flex flex-col gap-2'>
						<label htmlFor='peso' className='text-sm font-semibold'>
							Peso (kg):
						</label>
						<input
							id='peso'
							type='number'
							placeholder='Ej: 1500'
							className='border rounded-sm px-2 py-3 text-sm'
							value={peso}
							onChange={(e) => setPeso(e.target.value)}
						/>
					</div>

					<div className='flex flex-col gap-2'>
						<label htmlFor='hora' className='text-sm font-semibold'>
							Hora de Llegada:
						</label>
						<input
							id='hora'
							type='time'
							className='border rounded-sm px-2 py-3 text-sm'
							value={horaLlegada}
							onChange={(e) => setHoraLlegada(e.target.value)}
						/>
					</div>
				</div>

				<div className='w-full'>
					<button
						type='submit'
						className='bg-stone-800 text-white py-3 rounded-md w-full font-medium'
					>
						Registrar Pesaje
					</button>
				</div>
			</form>
		</main>
	)
}

export default PesaForm
