import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category"; // 1. Impor komponen Kategori
import ProtectedRoute from "./components/ProtectedRoute";
import Transaction from "./pages/Transaction";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Catatan: Gunakan _event pada console.log agar sesuai dengan parameter
      console.log("Auth Event:", _event);
      console.log("Session Data:", session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Memuat...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/*  Tambahkan Rute Kategori di sini */}
        <Route
          path="/kategori"
          element={
            <ProtectedRoute session={session}>
              <Category />
            </ProtectedRoute>
          }
        />
        {/*  Tambahkan Rute transaksi di sini */}
        <Route
          path="/transaksi"
          element={
            <ProtectedRoute session={session}>
              <Transaction />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
