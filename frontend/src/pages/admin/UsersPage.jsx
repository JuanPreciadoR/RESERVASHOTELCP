import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Alert, Spinner, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, updateUserRole } from '../../services/admin';

function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      await loadUsers(); // Recargar lista
    } catch (err) {
      setError(err.message || 'Error al actualizar rol');
    } finally {
      setUpdating(null);
    }
  };

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
        <p>Cargando usuarios...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 style={{ color: '#8B4513' }} className="mb-4">Gestión de Usuarios</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Reservas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.document || '-'}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <Badge bg={
                      u.role === 'admin' ? 'danger' :
                      u.role === 'receptionist' ? 'info' : 'secondary'
                    }>
                      {u.role}
                    </Badge>
                  </td>
                  <td>{u._count?.bookings || 0}</td>
                  <td>
                    {u.id !== user.id && ( // No permitir cambiar el propio rol
                      <Form.Select
                        size="sm"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                      >
                        <option value="guest">Huésped</option>
                        <option value="receptionist">Recepcionista</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UsersPage;