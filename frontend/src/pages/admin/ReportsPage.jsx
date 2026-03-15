import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { getToken } from '../../services/auth';

function ReportsPage() {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [occupancyData, setOccupancyData] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [activeTab, setActiveTab] = useState('occupancy');

    const API_URL = 'http://localhost:3000/api/reports';
    const authHeaders = () => ({
        headers: { Authorization: `Bearer ${getToken()}` }
    });

    const handleGenerateOccupancy = async () => {
        if (!startDate || !endDate) {
            setError('Debe seleccionar fechas de inicio y fin');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `${API_URL}/occupancy?startDate=${startDate}&endDate=${endDate}`,
                authHeaders()
            );
            setOccupancyData(response.data);
            setRevenueData(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al generar reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRevenue = async () => {
        if (!startDate || !endDate) {
            setError('Debe seleccionar fechas de inicio y fin');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `${API_URL}/revenue?startDate=${startDate}&endDate=${endDate}`,
                authHeaders()
            );
            setRevenueData(response.data);
            setOccupancyData(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al generar reporte');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <Container className="mt-5">
                <Alert variant="danger">No tienes permisos para acceder a esta página.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2 style={{ color: '#8B4513' }} className="mb-4">Reportes</h2>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha inicio</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end gap-2">
                            <Button
                                variant="primary"
                                style={{ backgroundColor: '#8B4513' }}
                                onClick={handleGenerateOccupancy}
                                disabled={loading}
                            >
                                Ocupación
                            </Button>
                            <Button
                                variant="success"
                                onClick={handleGenerateRevenue}
                                disabled={loading}
                            >
                                Ingresos
                            </Button>
                        </Col>
                    </Row>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Card.Body>
            </Card>

            {loading && (
                <div className="text-center">
                    <Spinner animation="border" style={{ color: '#8B4513' }} />
                    <p>Generando reporte...</p>
                </div>
            )}

            {occupancyData && !loading && (
                <Card>
                    <Card.Body>
                        <h4>Reporte de Ocupación</h4>
                        <p>Período: {new Date(occupancyData.period.start).toLocaleDateString()} - {new Date(occupancyData.period.end).toLocaleDateString()}</p>

                        <Row className="mb-4">
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Ocupación promedio</h6>
                                        <h3 style={{ color: '#8B4513' }}>{occupancyData.summary.averageOccupancy}%</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Máxima ocupación</h6>
                                        <h3 style={{ color: '#8B4513' }}>{occupancyData.summary.maxOccupancy}%</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Mínima ocupación</h6>
                                        <h3 style={{ color: '#8B4513' }}>{occupancyData.summary.minOccupancy}%</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Total reservas</h6>
                                        <h3 style={{ color: '#8B4513' }}>{occupancyData.summary.totalBookings}</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <h5 className="mb-3">Detalle por día</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Ocupadas</th>
                                    <th>Disponibles</th>
                                    <th>Tasa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {occupancyData.daily.map((day, index) => (
                                    <tr key={index}>
                                        <td>{new Date(day.date).toLocaleDateString()}</td>
                                        <td>{day.occupied}</td>
                                        <td>{day.available}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    style={{
                                                        width: '100px',
                                                        height: '10px',
                                                        backgroundColor: '#e9ecef',
                                                        borderRadius: '5px',
                                                        marginRight: '10px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${day.occupancyRate}%`,
                                                            height: '100%',
                                                            backgroundColor: day.occupancyRate > 70 ? '#28a745' : day.occupancyRate > 40 ? '#ffc107' : '#dc3545',
                                                            borderRadius: '5px'
                                                        }}
                                                    />
                                                </div>
                                                {day.occupancyRate}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {revenueData && !loading && (
                <Card>
                    <Card.Body>
                        <h4>Reporte de Ingresos</h4>
                        <p>Período: {new Date(revenueData.period.start).toLocaleDateString()} - {new Date(revenueData.period.end).toLocaleDateString()}</p>

                        <Row className="mb-4">
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Total ingresos</h6>
                                        <h3 style={{ color: '#8B4513' }}>${revenueData.summary.totalRevenue?.toLocaleString()}</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Subtotal</h6>
                                        <h3>${revenueData.summary.totalSubtotal?.toLocaleString()}</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>IVA (19%)</h6>
                                        <h3>${revenueData.summary.totalTax?.toLocaleString()}</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Facturas</h6>
                                        <h3 style={{ color: '#8B4513' }}>{revenueData.summary.totalInvoices}</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <h5 className="mb-3">Ingresos por día</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Facturas</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.daily.map((day, index) => (
                                    <tr key={index}>
                                        <td>{new Date(day.date).toLocaleDateString()}</td>
                                        <td>{day.count}</td>
                                        <td>${day.total?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}

export default ReportsPage;
