import AppRouter from './router/AppRouter'
import { AuthProvider } from './store/AuthContext'
import { BookingProvider } from './store/BookingContext'

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppRouter />
      </BookingProvider>
    </AuthProvider>
  )
}
