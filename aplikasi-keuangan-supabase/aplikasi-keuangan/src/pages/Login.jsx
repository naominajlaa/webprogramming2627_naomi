import { Button, Container } from "react-bootstrap";
import { signInWithGoogle } from "../services/authService";

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Detail error login:", error);
      alert("Gagal melakukan login.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h2 className="mb-3">Sistem Manajemen Keuangan</h2>
        <p className="text-muted mb-4">
          Silakan login untuk mulai mencatat transaksi Anda.
        </p>
        <Button variant="primary" size="lg" onClick={handleLogin}>
          Login dengan Google
        </Button>
      </div>
    </Container>
  );
}
