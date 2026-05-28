import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Navbar from '../components/common/Navbar/Navbar'
import Footer from '../components/common/Footer/Footer'
import HomePage from '../pages/Home/HomePage'
import MovieDetailPage from '../pages/MovieDetail/MovieDetailPage'
import SeatSelectionPage from '../pages/SeatSelection/SeatSelectionPage'
import ConfirmationPage from '../pages/Confirmation/ConfirmationPage'
import LoginPage from '../pages/Auth/LoginPage'
import RegisterPage from '../pages/Auth/RegisterPage'
import OtpVerifyPage from '../pages/Auth/OtpVerifyPage'
import ProfilePage from '../pages/Profile/ProfilePage'
import AdminPage from '../pages/Admin/AdminPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-[calc(100vh-var(--navbar-height)-200px)]">
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetailPage />} />
          <Route path={ROUTES.SEAT_SELECTION} element={<SeatSelectionPage />} />
          <Route path={ROUTES.CONFIRMATION} element={<ConfirmationPage />} />
          <Route path={ROUTES.BOOKING_CONFIRM} element={<ConfirmationPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.OTP_VERIFY} element={<OtpVerifyPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.ADMIN} element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
