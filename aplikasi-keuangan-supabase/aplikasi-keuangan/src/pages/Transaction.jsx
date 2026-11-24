import { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Spinner, Badge } from "react-bootstrap";
import { supabase } from "../lib/supabaseClient";
import MainLayout from "../components/MainLayout";
import imageCompression from "browser-image-compression";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editId, setEditId] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState("");

  const [formData, setFormData] = useState({
    tanggal: "",
    category_id: "",
    tipe: "Pengeluaran",
    jumlah: "",
    metode_pembayaran: "Cash",
    keterangan: "",
    bukti_foto_file: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: trxData, error: trxError } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false });

      if (trxError) {
        console.error("Error mengambil transaksi:", trxError.message);
      } else {
        setTransactions(trxData);
      }

      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("id, name, type")
        .order("name", { ascending: true });

      if (catError) {
        console.error("Error mengambil kategori:", catError.message);
      } else {
        setCategories(catData);
      }

      setLoading(false);
    };

    fetchData();
  }, [refresh]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const extractFileName = (url) => {
    if (!url) return null;
    return url.split("/").pop();
  };

  // --- FUNGSI BARU: GENERATE & EKSPOR LAPORAN PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // 1. Hitung Ringkasan Saldo dari data transaksi yang tampil
    let totalMasuk = 0;
    let totalKeluar = 0;
    transactions.forEach((trx) => {
      if (trx.tipe === "Pemasukan") totalMasuk += Number(trx.jumlah);
      else if (trx.tipe === "Pengeluaran") totalKeluar += Number(trx.jumlah);
    });
    const sisaSaldo = totalMasuk - totalKeluar;

    // 2. Judul & Header Dokumen
    doc.setFontSize(16);
    doc.text("Laporan Keuangan Pribadi", 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Dicetak pada: ${tanggalCetak}`, 14, 24);

    // 3. Kotak Ringkasan Finansial di bagian atas
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Total Pemasukan   : ${formatRupiah(totalMasuk)}`, 14, 34);
    doc.text(`Total Pengeluaran : ${formatRupiah(totalKeluar)}`, 14, 40);
    doc.setFont(undefined, "bold");
    doc.text(`Sisa Saldo        : ${formatRupiah(sisaSaldo)}`, 14, 46);
    doc.setFont(undefined, "normal");

    // 4. Siapkan Kolom & Baris Tabel untuk AutoTable
    const tableColumn = [
      "No",
      "Tanggal",
      "Kategori",
      "Keterangan",
      "Metode",
      "Tipe",
      "Jumlah",
    ];
    const tableRows = transactions.map((trx, index) => [
      index + 1,
      trx.tanggal,
      trx.categories?.name || "Tanpa Kategori",
      trx.keterangan || "-",
      trx.metode_pembayaran || "-",
      trx.tipe,
      formatRupiah(trx.jumlah),
    ]);

    // 5. Render Tabel Otomatis
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 54,
      theme: "grid",
      headStyles: { fillColor: [13, 110, 253] }, // Warna biru khas Bootstrap Primary
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        6: { halign: "right" }, // Rata kanan untuk kolom nominal Rupiah
      },
    });

    // 6. Unduh File PDF
    doc.save(`Laporan-Keuangan-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData({ ...formData, bukti_foto_file: null });
      setCompressionInfo("");
      return;
    }

    setCompressionInfo("Mengompresi gambar...");

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024).toFixed(0);

      setFormData({ ...formData, bukti_foto_file: compressedFile });
      setCompressionInfo(
        `Berhasil dikompresi: ${originalSize} MB ➔ ${compressedSize} KB`,
      );
    } catch (error) {
      console.error("Gagal mengompresi gambar:", error);
      setCompressionInfo("Gagal mengompresi gambar.");
    }
  };

  const handleShowAdd = () => {
    setEditId(null);
    setOldImageUrl(null);
    setCompressionInfo("");
    setFormData({
      tanggal: "",
      category_id: "",
      tipe: "Pengeluaran",
      jumlah: "",
      metode_pembayaran: "Cash",
      keterangan: "",
      bukti_foto_file: null,
    });
    setShowModal(true);
  };

  const handleShowEdit = (trx) => {
    setEditId(trx.id);
    setOldImageUrl(trx.bukti_foto);
    setCompressionInfo("");
    setFormData({
      tanggal: trx.tanggal,
      category_id: trx.category_id,
      tipe: trx.tipe,
      jumlah: trx.jumlah,
      metode_pembayaran: trx.metode_pembayaran || "Cash",
      keterangan: trx.keterangan || "",
      bukti_foto_file: null,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let finalImageUrl = editId ? oldImageUrl : null;

    if (formData.bukti_foto_file) {
      const fileToUpload = formData.bukti_foto_file;

      try {
        const fileExt = fileToUpload.name.split(".").pop() || "jpg";
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("bukti_transaksi")
          .upload(fileName, fileToUpload);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("bukti_transaksi").getPublicUrl(fileName);

        finalImageUrl = publicUrl;

        if (editId && oldImageUrl) {
          const oldFileName = extractFileName(oldImageUrl);
          if (oldFileName) {
            await supabase.storage
              .from("bukti_transaksi")
              .remove([oldFileName]);
          }
        }
      } catch (error) {
        console.error("Error upload gambar:", error);
        alert("Gagal mengunggah gambar bukti transaksi.");
        setIsSubmitting(false);
        return;
      }
    }

    let dbError;

    if (editId) {
      const { error } = await supabase
        .from("transactions")
        .update({
          category_id: formData.category_id,
          tanggal: formData.tanggal,
          tipe: formData.tipe,
          jumlah: formData.jumlah,
          metode_pembayaran: formData.metode_pembayaran,
          keterangan: formData.keterangan,
          bukti_foto: finalImageUrl,
        })
        .eq("id", editId)
        .eq("user_id", user.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          category_id: formData.category_id,
          tanggal: formData.tanggal,
          tipe: formData.tipe,
          jumlah: formData.jumlah,
          metode_pembayaran: formData.metode_pembayaran,
          keterangan: formData.keterangan,
          bukti_foto: finalImageUrl,
        },
      ]);
      dbError = error;
    }

    if (dbError) {
      alert("Gagal menyimpan transaksi.");
      console.error(dbError);
    } else {
      setShowModal(false);
      setRefresh((prev) => prev + 1);
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (trx) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus transaksi ini?",
    );
    if (!confirmDelete) return;

    if (trx.bukti_foto) {
      const fileName = extractFileName(trx.bukti_foto);
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("bukti_transaksi")
          .remove([fileName]);

        if (storageError) {
          console.error(
            "Gagal menghapus file dari storage:",
            storageError.message,
          );
        }
      }
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", trx.id);

    if (error) {
      alert("Gagal menghapus transaksi.");
      console.error(error);
    } else {
      setRefresh((prev) => prev + 1);
    }
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Kelola Transaksi</h3>
        <div>
          {/* Tombol Ekspor PDF dinonaktifkan otomatis jika belum ada data */}
          <Button
            variant="outline-danger"
            className="me-2"
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
          >
            Ekspor PDF
          </Button>
          <Button variant="primary" onClick={handleShowAdd}>
            + Catat Transaksi
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th>Metode</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Bukti</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Belum ada catatan transaksi.
                </td>
              </tr>
            ) : (
              transactions.map((trx) => (
                <tr key={trx.id}>
                  <td>{trx.tanggal}</td>
                  <td>{trx.categories?.name || "Tanpa Kategori"}</td>
                  <td>{trx.keterangan || "-"}</td>
                  <td>{trx.metode_pembayaran}</td>
                  <td>
                    <Badge bg={trx.tipe === "Pemasukan" ? "success" : "danger"}>
                      {trx.tipe}
                    </Badge>
                  </td>
                  <td className="fw-bold">{formatRupiah(trx.jumlah)}</td>
                  <td>
                    {trx.bukti_foto ? (
                      <a
                        href={trx.bukti_foto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-info btn-sm"
                      >
                        Lihat Struk
                      </a>
                    ) : (
                      <span className="text-muted small">Tidak ada</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEdit(trx)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(trx)}
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

      {/* Modal Form Transaksi */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Transaksi" : "Catat Transaksi Baru"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipe Transaksi</Form.Label>
              <Form.Select
                value={formData.tipe}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipe: e.target.value,
                    category_id: "",
                  })
                }
              >
                <option value="Pengeluaran">Pengeluaran</option>
                <option value="Pemasukan">Pemasukan</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories
                  .filter((cat) => cat.type === formData.tipe)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jumlah (Rp)</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Metode Pembayaran</Form.Label>
              <Form.Select
                value={formData.metode_pembayaran}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metode_pembayaran: e.target.value,
                  })
                }
              >
                <option value="Cash">Cash</option>
                <option value="BCA">BCA</option>
                <option value="BSI">BSI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="Lainnya">Lainnya</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Keterangan</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {editId
                  ? "Ganti Bukti Foto (Kosongkan jika tidak diubah)"
                  : "Bukti Foto (Opsional)"}
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {compressionInfo && (
                <Form.Text className="text-success fw-bold d-block mt-1">
                  {compressionInfo}
                </Form.Text>
              )}
              {editId && oldImageUrl && (
                <div className="mt-2">
                  <small className="text-muted">
                    Foto saat ini:{" "}
                    <a
                      href={oldImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat Bukti Lama
                    </a>
                  </small>
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainLayout>
  );
}
