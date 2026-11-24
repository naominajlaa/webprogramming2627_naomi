import { useState, useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import MainLayout from "../components/MainLayout";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan ringkasan angka finansial
  const [summary, setSummary] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
  });

  // State untuk menyimpan data yang sudah dikelompokkan untuk grafik
  const [chartData, setChartData] = useState([]);

  // Palet warna menarik untuk setiap potongan Pie Chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF4560",
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Ambil semua transaksi user beserta nama kategorinya
      const { data, error } = await supabase
        .from("transactions")
        .select("tipe, jumlah, categories(name)");

      if (error) {
        console.error("Error mengambil data dasbor:", error.message);
        setLoading(false);
        return;
      }

      // 1. Hitung Total Pemasukan & Pengeluaran
      let totalMasuk = 0;
      let totalKeluar = 0;
      const kategoriMap = {}; // Objek sementara untuk mengelompokkan pengeluaran

      data.forEach((trx) => {
        const nominal = Number(trx.jumlah);

        if (trx.tipe === "Pemasukan") {
          totalMasuk += nominal;
        } else if (trx.tipe === "Pengeluaran") {
          totalKeluar += nominal;

          // 2. Kelompokkan pengeluaran berdasarkan nama kategori
          const namaKategori = trx.categories?.name || "Lainnya";
          if (kategoriMap[namaKategori]) {
            kategoriMap[namaKategori] += nominal;
          } else {
            kategoriMap[namaKategori] = nominal;
          }
        }
      });

      setSummary({
        pemasukan: totalMasuk,
        pengeluaran: totalKeluar,
        saldo: totalMasuk - totalKeluar,
      });

      // Ubah objek kategoriMap menjadi Array format Recharts: [{ name: 'Makanan', value: 500000 }]
      const formattedChartData = Object.keys(kategoriMap).map((key) => ({
        name: key,
        value: kategoriMap[key],
      }));

      setChartData(formattedChartData);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <MainLayout>
      <h3 className="mb-4">Ringkasan Keuangan</h3>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          {/* Baris 1: 3 Kartu Statistik Utama */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card bg="success" text="white" className="shadow-sm">
                <Card.Body>
                  <Card.Title>Total Pemasukan</Card.Title>
                  <h4 className="fw-bold">{formatRupiah(summary.pemasukan)}</h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card bg="danger" text="white" className="shadow-sm">
                <Card.Body>
                  <Card.Title>Total Pengeluaran</Card.Title>
                  <h4 className="fw-bold">
                    {formatRupiah(summary.pengeluaran)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card bg="primary" text="white" className="shadow-sm">
                <Card.Body>
                  <Card.Title>Sisa Saldo</Card.Title>
                  <h4 className="fw-bold">{formatRupiah(summary.saldo)}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Baris 2: Visualisasi Grafik Pengeluaran */}
          <Row>
            <Col md={8} lg={6}>
              <Card className="shadow-sm">
                <Card.Header className="fw-bold bg-white">
                  Proporsi Pengeluaran per Kategori
                </Card.Header>
                <Card.Body>
                  {chartData.length === 0 ? (
                    <p className="text-muted text-center my-5">
                      Belum ada data pengeluaran untuk ditampilkan pada grafik.
                    </p>
                  ) : (
                    <div style={{ width: "100%", height: 320 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            label
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          {/* Tooltip otomatis memformat angka saat kursor diarahkan ke grafik */}
                          <Tooltip formatter={(value) => formatRupiah(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </MainLayout>
  );
}
