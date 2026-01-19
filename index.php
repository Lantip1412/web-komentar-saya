<?php
// 1. Konfigurasi Database
$host = "localhost";
$user = "root";
$pass = "4212"; // GANTI dengan password database yang Anda buat tadi
$db   = "kampus";

// 2. Mencoba Terhubung
$koneksi = mysqli_connect($host, $user, $pass, $db);

// Cek apakah koneksi berhasil?
if (!$koneksi) {
  die("Koneksi Gagal: " . mysqli_connect_error());
}
echo "<h3>Status: Koneksi ke Database Berhasil!</h3>";
echo "<hr>";

// 3. Menjalankan Query (Sama seperti di DBeaver)
$query  = "SELECT * FROM mahasiswa";
$result = mysqli_query($koneksi, $query);

// 4. Menampilkan Data (Looping)
echo "<ul>";
while ($baris = mysqli_fetch_assoc($result)) {
  // $baris adalah array yang berisi data: id, nama, jurusan
  echo "<li>";
  echo "Nama: <b>" . $baris['nama'] . "</b> - ";
  echo "Jurusan: " . $baris['jurusan'];
  echo "</li>";
}
echo "</ul>";
