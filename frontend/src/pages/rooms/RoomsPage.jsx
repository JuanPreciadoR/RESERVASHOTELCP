import React from 'react';
import { Container } from 'react-bootstrap';
import RoomList from '../../components/RoomList';

function RoomsPage() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4" style={{ color: '#8B4513' }}>Todas las Habitaciones</h2>
      <RoomList />
    </Container>
  );
}

export default RoomsPage;