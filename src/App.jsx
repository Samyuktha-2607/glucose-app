import { useState, useRef } from 'react'
import './App.css'
const SERVER_URL = 'https://10.93.14.44:8000'

function App() {
  const [riseTime, setRiseTime] = useState(0.75)
  const [notchPosition, setNotchPosition] = useState(0.25)
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(70)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const videoRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      videoRef.current.srcObject = stream
      setCameraOn(true)
    } catch (err) {
      alert('Could not access camera: ' + err.message)
    }
  }

  const handlePredict = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${SERVER_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rise_time_pct: parseFloat(riseTime),
          notch_position_pct: parseFloat(notchPosition),
          age: parseFloat(age),
          weight: parseFloat(weight),
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Could not reach the server. Is server.py running?' })
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2>Finger Scan</h2>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }} />
        <button onClick={startCamera} style={{ marginTop: '10px', padding: '10px 20px' }}>
          {cameraOn ? 'Camera On' : 'Start Camera'}
        </button>
      </div>

      <h1>Glucose Level</h1>
      <h1>Estimator</h1>
      <p>Test form — enter sample values to check the connection to the model.</p>

      <label>Rise Time %</label>
      <input type="number" step="0.01" value={riseTime} onChange={(e) => setRiseTime(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>Notch Position %</label>
      <input type="number" step="0.01" value={notchPosition} onChange={(e) => setNotchPosition(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>Age</label>
      <input type="number" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>Weight (kg)</label>
      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: '100%', marginBottom: '20px' }} />

      <button onClick={handlePredict} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Predicting...' : 'Predict'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <p><strong>Prediction:</strong> {result.prediction}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App