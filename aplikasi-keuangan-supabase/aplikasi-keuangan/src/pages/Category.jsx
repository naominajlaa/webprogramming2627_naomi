import { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import { supabase } from "../lib/supabaseClient";
import MainLayout from "../components/MainLayout";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "Pengeluaran" });

  // State baru untuk melacak mode Edit (jika null, berarti mode Tambah Data)
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error mengambil data:", error.message);
      } else {
        setCategories(data);
      }

      setLoading(false);
    };

    fetchCategories();
  }, [refresh]);

  // Fungsi membuka Modal untuk Tambah Data
  const handleShowAdd = () => {
    setEditId(null); // Kosongkan editId
    setFormData({ name: "", type: "Pengeluaran" }); // Kosongkan formulir
    setShowModal(true);
  };

  // Fungsi membuka Modal untuk Edit Data
  const handleShowEdit = (cat) => {
    setEditId(cat.id); // Simpan ID kategori yang akan diedit
    setFormData({ name: cat.name, type: cat.type }); // Isi formulir dengan data lama
    setShowModal(true);
  };

  // Fungsi untuk menyimpan (menangani Tambah dan Edit sekaligus)
  const handleSave = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let error;

    if (editId) {
      // Jika editId ada isinya, lakukan proses UPDATE
      const { error: updateError } = await supabase
        .from("categories")
        .update({ name: formData.name, type: formData.type })
        .eq("id", editId)
        .eq("user_id", user.id); // Lapisan keamanan tambahan
      error = updateError;
    } else {
      // Jika editId null, lakukan proses INSERT (Tambah Data)
      const { error: insertError } = await supabase
        .from("categories")
        .insert([
          { name: formData.name, type: formData.type, user_id: user.id },
        ]);
      error = insertError;
    }

    if (error) {
      alert("Gagal menyimpan kategori.");
      console.error(error);
    } else {
      setShowModal(false);
      setRefresh((prev) => prev + 1); // Segarkan tabel
    }
  };

  // Fungsi untuk Menghapus Data (Delete)
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus kategori ini?",
    );

    if (confirmDelete) {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        alert("Gagal menghapus kategori.");
        console.error(error);
      } else {
        setRefresh((prev) => prev + 1); // Segarkan tabel setelah berhasil dihapus
      }
    }
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Kelola Kategori</h3>
        {/* Ubah onClick menjadi handleShowAdd */}
        <Button variant="primary" onClick={handleShowAdd}>
          + Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kategori</th>
              <th>Tipe</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  Belum ada data kategori.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{index + 1}</td>
                  <td>{cat.name}</td>
                  <td>{cat.type}</td>
                  <td>
                    {/* Tambahkan event onClick untuk Edit dan Hapus */}
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEdit(cat)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal Formulir Kategori */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          {/* Judul modal berubah dinamis sesuai mode */}
          <Modal.Title>
            {editId ? "Edit Kategori" : "Tambah Kategori"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nama Kategori</Form.Label>
              <Form.Control
                type="text"
                placeholder="Misal: Gaji, Listrik, Makanan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipe</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="Pengeluaran">Pengeluaran</option>
                <option value="Pemasukan">Pemasukan</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainLayout>
  );
}
