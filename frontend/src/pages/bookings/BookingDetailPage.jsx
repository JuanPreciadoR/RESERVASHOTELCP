import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { getBookingById } from '../../services/bookings';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingById(id);
        console.log('Datos de reserva:', data);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Error al cargar la reserva');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id]);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      checked_in: 'primary',
      checked_out: 'secondary',
      cancelled: 'danger'
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      checked_in: 'Check-in realizado',
      checked_out: 'Finalizada',
      cancelled: 'Cancelada'
    };
    return <Badge bg={colors[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    return price.toLocaleString();
  };

  const downloadPDF = () => {
    if (!booking) return;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.setTextColor(139, 69, 19);
    doc.text('Hotel Casa Preciado', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Factura de Reserva', 20, 30);

    doc.line(20, 35, 190, 35);

    // Datos de la factura
    doc.setFontSize(10);
    if (booking.invoice) {
      doc.text(`Factura No: ${booking.invoice.id || 'N/A'}`, 20, 45);
      doc.text(`Fecha emisión: ${new Date(booking.invoice.issueDate).toLocaleDateString()}`, 20, 52);
    } else {
      doc.text('Factura No: Pendiente', 20, 45);
      doc.text('Fecha emisión: Pendiente', 20, 52);
    }

    // Datos del huésped
    doc.setFontSize(12);
    doc.setTextColor(139, 69, 19);
    doc.text('Datos del huésped', 20, 65);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Nombre: ${booking.user?.name || 'N/A'}`, 20, 75);
    doc.text(`Email: ${booking.user?.email || 'N/A'}`, 20, 82);
    doc.text(`Documento: ${booking.user?.document || 'N/A'}`, 20, 89);
    doc.text(`Teléfono: ${booking.user?.phone || 'N/A'}`, 20, 96);

    // Datos de la reserva
    doc.setFontSize(12);
    doc.setTextColor(139, 69, 19);
    doc.text('Detalle de la reserva', 20, 110);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Habitación: ${booking.room?.type} #${booking.room?.number}`, 20, 120);
    doc.text(`Piso: ${booking.room?.floor}`, 20, 127);
    doc.text(`Capacidad: ${booking.room?.capacity} personas`, 20, 134);
    doc.text(`Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`, 20, 141);
    doc.text(`Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`, 20, 148);
    doc.text(`Huéspedes: ${booking.guests}`, 20, 155);

    // Tabla de costos
    const subtotal = booking.invoice?.subtotal || booking.totalPrice || 0;
    const tax = booking.invoice?.tax || Math.round(subtotal * 0.19);
    const total = booking.invoice?.total || subtotal + tax;

    autoTable(doc, {
      startY: 165,
      head: [['Concepto', 'Valor']],
      body: [
        ['Subtotal', `$${formatPrice(subtotal)} COP`],
        ['IVA (19%)', `$${formatPrice(tax)} COP`],
        ['Total', `$${formatPrice(total)} COP`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [139, 69, 19] }
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Gracias por preferirnos', 20, doc.internal.pageSize.height - 10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }

    doc.save(`factura_${booking.id}.pdf`);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando detalles de la reserva...</p>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || 'Reserva no encontrada'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h2 style={{ color: '#8B4513' }}>Reserva #{booking.id}</h2>
                {getStatusBadge(booking.status)}
              </div>

              <Row>
                <Col md={6}>
                  <h5>Habitación</h5>
                  <p>
                    <strong>{booking.room?.type} #{booking.room?.number}</strong><br />
                    Piso {booking.room?.floor}<br />
                    Capacidad: {booking.room?.capacity} personas
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Fechas</h5>
                  <p>
                    <strong>Entrada:</strong> {new Date(booking.checkIn).toLocaleDateString()}<br />
                    <strong>Salida:</strong> {new Date(booking.checkOut).toLocaleDateString()}<br />
                    <strong>Huéspedes:</strong> {booking.guests}
                  </p>
                </Col>
              </Row>

              <hr />

              <Row>
                <Col md={6}>
                  <h5>Información del huésped</h5>
                  <p>
                    <strong>Nombre:</strong> {booking.user?.name || 'N/A'}<br />
                    <strong>Email:</strong> {booking.user?.email || 'N/A'}<br />
                    <strong>Documento:</strong> {booking.user?.document || 'N/A'}<br />
                    <strong>Teléfono:</strong> {booking.user?.phone || 'N/A'}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Facturación</h5>
                  {booking.invoice ? (
                    <div>
                      <p>
                        <strong>Subtotal:</strong> ${formatPrice(booking.invoice.subtotal)} COP<br />
                        <strong>IVA (19%):</strong> ${formatPrice(booking.invoice.tax)} COP<br />
                        <strong className="h5">Total: ${formatPrice(booking.invoice.total)} COP</strong><br />
                        <small>Factura #{booking.invoice.id}</small>
                      </p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={downloadPDF}
                      >
                        Descargar PDF
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p>
                        <strong>Subtotal:</strong> ${formatPrice(booking.totalPrice)} COP<br />
                        <strong>IVA (19%):</strong> ${formatPrice(Math.round(booking.totalPrice * 0.19))} COP<br />
                        <strong className="h5">Total: ${formatPrice(booking.totalPrice + Math.round(booking.totalPrice * 0.19))} COP</strong>
                      </p>
                      <p className="text-muted">
                        La factura oficial se generará después del check-out.
                      </p>
                    </div>
                  )}
                </Col>
              </Row>

              <div className="mt-4 text-center">
                <Button as={Link} to="/my-bookings" variant="secondary">
                  Volver a mis reservas
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default BookingDetailPage;
