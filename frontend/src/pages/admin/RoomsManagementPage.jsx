import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { getAllRoomsAdmin, updateRoom, bulkUpdateRoomsByType, getRoomStats } from '../../services/admin-rooms';

function RoomsManagementPage() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal para editar habitación individual
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [editForm, setEditForm] = useState({
        price: '',
        description: '',
        status: ''
    });

    // Modal para actualización masiva
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkType, setBulkType] = useState('estandar');
    const [bulkAction, setBulkAction] = useState('price-percentage');
    const [bulkValue, setBulkValue] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [roomsData, statsData] = await Promise.all([
                getAllRoomsAdmin(),
                getRoomStats()
            ]);
            setRooms(roomsData);
            setStats(statsData);
        } catch (err) {
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            loadData();
        }
    }, [user]);

    const handleEditClick = (room) => {
        setEditingRoom(room);
        setEditForm({
            price: room.price,
            description: room.description,
            status: room.status
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        try {
            await updateRoom(editingRoom.id, editForm);
            setSuccess('Habitación actualizada correctamente');
            setShowEditModal(false);
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Error al actualizar');
        }
    };

    const handleBulkSubmit = async () => {
        try {
            let data = {};

            if (bulkAction === 'price-percentage') {
                data = { priceIncrease: parseFloat(bulkValue) };
            } else if (bulkAction === 'price-fixed') {
                data = { newPrice: parseFloat(bulkValue) };
            } else if (bulkAction === 'status') {
                data = { status: bulkValue };
            }

            const result = await bulkUpdateRoomsByType(bulkType, data);
            setSuccess(`${result.message || 'Actualización completada'}`);
            setShowBulkModal(false);
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Error en actualización masiva');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            available: 'success',
            occupied: 'danger',
            maintenance: 'warning',
            cleaning: 'info'
        };
        const labels = {
            available: 'Disponible',
            occupied: 'Ocupada',
            maintenance: 'Mantenimiento',
            cleaning: 'Limpieza'
        };
        return <Badge bg={colors[status] || 'secondary'}>{labels[status] || status}</Badge>;
    };

    if (user?.role !== 'admin') {
        return (
            <Container className="mt-5">
                <Alert variant="danger">No tienes permisos para acceder a esta página.</Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" style={{ color: '#8B4513' }} />
                <p>Cargando habitaciones...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4" fluid>
            <h2 style={{ color: '#8B4513' }} className="mb-4">Gestión de Habitaciones</h2>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            {/* Estadísticas rápidas */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <h6>Total Habitaciones</h6>
                                <h3 style={{ color: '#8B4513' }}>{stats.total}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <h6>Disponibles</h6>
                                <h3 style={{ color: '#28a745' }}>{stats.byStatus.available}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <h6>Ocupadas</h6>
                                <h3 style={{ color: '#dc3545' }}>{stats.byStatus.occupied}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <h6>Precio Promedio</h6>
                                <h3 style={{ color: '#8B4513' }}>${stats.priceRange.avg.toLocaleString()}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Botón para actualización masiva */}
            <div className="mb-3 text-end">
                <Button
                    variant="primary"
                    style={{ backgroundColor: '#8B4513' }}
                    onClick={() => setShowBulkModal(true)}
                >
                    Actualización Masiva
                </Button>
            </div>

            {/* Tabla de habitaciones */}
            <Card>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Habitación</th>
                                <th>Tipo</th>
                                <th>Piso</th>
                                <th>Capacidad</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id}>
                                    <td>{room.id}</td>
                                    <td>{room.number}</td>
                                    <td>{room.type}</td>
                                    <td>{room.floor}</td>
                                    <td>{room.capacity}</td>
                                    <td>${room.price.toLocaleString()}</td>
                                    <td>{getStatusBadge(room.status)}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleEditClick(room)}
                                        >
                                            Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal de edición individual */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#8B4513' }}>
                        Editar Habitación #{editingRoom?.number}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Precio por noche (COP)</Form.Label>
                            <Form.Control
                                type="number"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="available">Disponible</option>
                                <option value="occupied">Ocupada</option>
                                <option value="maintenance">Mantenimiento</option>
                                <option value="cleaning">Limpieza</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: '#8B4513' }}
                        onClick={handleEditSubmit}
                    >
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de actualización masiva */}
            <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#8B4513' }}>
                        Actualización Masiva por Tipo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de habitación</Form.Label>
                            <Form.Select value={bulkType} onChange={(e) => setBulkType(e.target.value)}>
                                <option value="estandar">Estándar</option>
                                <option value="suite">Suite</option>
                                <option value="familiar">Familiar</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Acción</Form.Label>
                            <Form.Select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
                                <option value="price-percentage">Aumentar precio por %</option>
                                <option value="price-fixed">Establecer precio fijo</option>
                                <option value="status">Cambiar estado</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Valor</Form.Label>
                            {bulkAction === 'status' ? (
                                <Form.Select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
                                    <option value="available">Disponible</option>
                                    <option value="maintenance">Mantenimiento</option>
                                    <option value="cleaning">Limpieza</option>
                                </Form.Select>
                            ) : (
                                <Form.Control
                                    type="number"
                                    placeholder={bulkAction === 'price-percentage' ? 'Ej: 10 (para +10%)' : 'Nuevo precio'}
                                    value={bulkValue}
                                    onChange={(e) => setBulkValue(e.target.value)}
                                />
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: '#8B4513' }}
                        onClick={handleBulkSubmit}
                    >
                        Aplicar a todas
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default RoomsManagementPage;
