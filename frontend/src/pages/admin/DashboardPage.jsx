import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Table } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboard, getAllBookings, getAllUsers } from '../../services/admin';

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashData, bookingsData, usersData] = await Promise.all([
          getDashboard(),
          getAllBookings({ limit: 5 }),
          getAllUsers()
        ]);
        setDashboard(dashData);
        setRecentBookings(bookingsData.slice(0, 5));
        setUsers(usersData);
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Verificar si es admin
  if (user?.role !== 'admin') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          No tienes permisos para acceder a esta página.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'checked_in': return 'primary';
      case 'checked_out': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'warning';
    }
  };

  // Función para obtener el color del badge según el rol
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'receptionist': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Container className="mt-4">
      <h2 style={{ color: '#8B4513' }} className="mb-4">Panel de Administración</h2>

      {/* KPIs */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>Ocupación Hoy</h5>
              <h2 style={{ color: '#8B4513' }}>{dashboard?.occupancyRate || 0}%</h2>
              <small>{dashboard?.occupiedRooms || 0} / {dashboard?.totalRooms || 24} habitaciones</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>Reservas Activas</h5>
              <h2 style={{ color: '#8B4513' }}>{dashboard?.totalBookings || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>Check-ins Hoy</h5>
              <h2 style={{ color: '#8B4513' }}>{dashboard?.todayCheckIns || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>Ingresos Mes</h5>
              <h2 style={{ color: '#8B4513' }}>${dashboard?.monthlyRevenue?.toLocaleString() || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Últimas reservas */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Últimas Reservas</Card.Title>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.user?.name}</td>
                      <td>{booking.room?.type} #{booking.room?.number}</td>
                      <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Usuarios recientes */}
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Usuarios Recientes</Card.Title>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>
                        <span className={`badge bg-${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardPage;
