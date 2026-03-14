import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from './components/Navbar';

// Importar páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RoomsPage from './pages/rooms/RoomsPage';
import RoomTypePage from './pages/rooms/RoomTypePage';
import RoomDetailPage from './pages/rooms/RoomDetailPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';

// Importar páginas de admin
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';

// Importar páginas de recepcionista
import AllBookingsPage from './pages/receptionist/AllBookingsPage';
import SearchGuestsPage from './pages/receptionist/SearchGuestsPage';
import CreateBookingForGuestPage from './pages/receptionist/CreateBookingForGuestPage';

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/type/:type" element={<RoomTypePage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        
        {/* Rutas de admin */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        
        {/* Rutas de recepcionista */}
        <Route path="/receptionist/bookings" element={<AllBookingsPage />} />
        <Route path="/receptionist/search" element={<SearchGuestsPage />} />
        <Route path="/receptionist/create-booking" element={<CreateBookingForGuestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;