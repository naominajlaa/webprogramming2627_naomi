import { useState } from 'react';
import { Alert, Form, Button, Card, InputGroup, Spinner } from 'react-bootstrap';

// Menerima props dataAwal dari komponen induk (tabel) yang berisi item terpilih
function FormEditTransaksi({ dataAwal, onUpdateSuccess, onCancel }) {
  // 1. Populasi form dengan data lama sebagai nilai awal state
  const [keterangan, setKeterangan] = useState(dataAwal.keterangan || '');
  const [kategori, setKategori] = useState(dataAwal.kategori || 'Pengeluaran');
  const [nominal, setNominal] = useState(dataAwal.nominal ?? '');

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg('');

    const dataDiperbarui = {
      keterangan,
      kategori,
      nominal: Number(nominal)
    };

    try {
      const response = await fetch(
        `http://localhost:3000/transaksi/${dataAwal.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataDiperbarui),
        }
      );
      if (!response.ok) {
        throw new Error(`Gagal memperbarui transaksi (HTTP ${response.status}).`);
      }

      const dataTerbaru = await response.json();
      onUpdateSuccess(dataTerbaru);
    } catch (error) {
      console.error('Gagal memperbarui data:', error);
      setErrorMsg('Gagal memperbarui transaksi. Silakan coba lagi.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm border-warning">
      <Card.Title className="mb-3 text-warning">Edit Transaksi</Card.Title>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Form onSubmit={handleUpdate}>
        <Form.Group className="mb-3">
          <Form.Label>Keterangan</Form.Label>
          <Form.Control
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Kategori</Form.Label>
          <Form.Select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option value="Pengeluaran">Pengeluaran</option>
            <option value="Pemasukan">Pemasukan</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nominal</Form.Label>
          <InputGroup>
            <InputGroup.Text>Rp</InputGroup.Text>
            <Form.Control
              type="number"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="warning" type="submit" disabled={isUpdating}>
            {isUpdating ? <Spinner size="sm" /> : 'Simpan Perubahan'}
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </Form>
    </Card>
  );
}

export default FormEditTransaksi;