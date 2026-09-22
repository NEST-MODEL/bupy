import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/Spinner';
import { SetupNeeded } from '@/components/SetupNeeded';
import { isFirebaseConfigured } from '@/firebase/firebase';
import { PetsProvider } from '@/features/pets/PetsContext';
import Landing from '@/pages/Landing';

const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Home = lazy(() => import('@/pages/Home'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Health = lazy(() => import('@/pages/Health'));
const Help = lazy(() => import('@/pages/Help'));
const Profile = lazy(() => import('@/pages/Profile'));
const PetNew = lazy(() => import('@/pages/PetNew'));
const PetProfile = lazy(() => import('@/pages/PetProfile'));
const Terms = lazy(() => import('@/pages/Legal').then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import('@/pages/Legal').then((m) => ({ default: m.Privacy })));

export default function App() {
  if (!isFirebaseConfigured) return <SetupNeeded />;
  return (
    <HashRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<ResetPassword />} />
          </Route>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<PetsProvider><AppLayout /></PetsProvider>}>
              <Route index element={<Home />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="health" element={<Health />} />
              <Route path="help" element={<Help />} />
              <Route path="profile" element={<Profile />} />
              <Route path="pets/new" element={<PetNew />} />
              <Route path="pets/:petId" element={<PetProfile />} />
            </Route>
            <Route path="onboarding" element={<PetsProvider><Onboarding /></PetsProvider>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
