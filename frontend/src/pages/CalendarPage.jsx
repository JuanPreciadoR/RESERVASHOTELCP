//Pagina de calendario
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getToken } from '../services/auth';

function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:3000/api/calendar';
  const authHeaders = () => ({
    headers: { Authorization: Bearer  }
  });

  const loadEvents = async (start, end) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/events?start=${start.toISOString()}&end=${end.toISOString()}`,
        authHeaders()
      );
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info) => {
    alert(`Fecha seleccionada: ${info.dateStr}`);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    alert(`
      Reserva #${event.id} 
      Habitación:  ${event.extendProps.roomType}
      Huésped:  ${event.extendProps.guestName}
      Estado: ${event.extendProps.status}
      Huéspedes: ${event.extendProps.guests}
      Total: $${event.extendedProps.totalPrice?.toLocaleString()} COP
    `);
  };

  // Verificar permisos (solo recepcionistas y admin)
  if (!['receptionist', 'admin'].includes(user?.role)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">No tienes permisos para acceder al calendario.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" fluid>
      <h2 style={{ color: '#8B4513' }} className="mb-4">Calendario de Reservas</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <div className="mb-3">
            <div className="d-flex gap-3">
              <div><span style={{ backgroundColor: '#28a745', padding: '0 10px', color: 'white' }}>Confirmada</span></div>
              <div><span style={{ backgroundColor: '#ffc107', padding: '0 10px', color: 'white' }}>Check-in</span></div>
              <div><span style={{ backgroundColor: '#6c757d', padding: '0 10px', color: 'white' }}>Check-out</span></div>
              <div><span style={{ backgroundColor: '#dc3545', padding: '0 10px', color: 'white' }}>Cancelada</span></div>
              <div><span style={{ backgroundColor: '#17a2b8', padding: '0 10px', color: 'white' }}>Pendiente</span></div>
            </div>
          </div>
          
          {loading && <div className="text-center"><Spinner animation="border" style={{ color: '#8B4513' }} /></div>}
          
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            datesSet={(dateInfo) => {
              loadEvents(dateInfo.start, dateInfo.end);
            }}
            locale="es"
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CalendarPage;