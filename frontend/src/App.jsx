
import RoomList from './components/RoomList';
function App() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#8B4513', textAlign: 'center' }}>Hotel Casa Preciado</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Tu refugio de lujo en la ciudad</p>
      <RoomList />
    </div>
  );
}

export default App;