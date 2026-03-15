'use client'
export default function Error({ error, reset }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>¡Algo salió mal en Casa Herenia y Pedro!</h2>
      <p style={{ color: 'red' }}>{error.message}</p>
      <button onClick={() => reset()}>Reintentar</button>
    </div>
  )
}