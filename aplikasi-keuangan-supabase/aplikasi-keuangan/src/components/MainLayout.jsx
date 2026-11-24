import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../services/authService";

export default function MainLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Gagal keluar aplikasi.");
    }
  };

  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" expand="lg" className="mb-4">
        <Container>
          {/* Menggunakan as={Link} agar navigasi tidak memuat ulang halaman (reload) */}
          <Navbar.Brand as={Link} to="/">
            Sistem Keuangan
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Dasbor
              </Nav.Link>
              <Nav.Link as={Link} to="/kategori">
                Kategori
              </Nav.Link>
              <Nav.Link as={Link} to="/transaksi">
                Transaksi
              </Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={handleLogout} size="sm">
              Keluar
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Area konten dinamis */}
      <Container>{children}</Container>
    </>
  );
}
