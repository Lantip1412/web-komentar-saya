// --- 1. KONFIGURASI SUPABASE ---
// Pastikan URL dan KEY ini sesuai dengan dashboard Anda
const SUPABASE_URL = 'https://grnbawakruzedgsqapvu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hHYxshwAPqB0eo68oQwI6Q_2fHCnJAW';

// Kita pakai nama 'db' supaya tidak bentrok dengan library utamanya
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. ELEMEN HTML ---
const authForm = document.getElementById('auth-form');
const mainContent = document.getElementById('main-content');
const commentsList = document.getElementById('comments-list');

// --- 3. LOGIKA APLIKASI ---

// Cek apakah user sedang login atau tidak
async function checkUser() {
  const { data: { user } } = await db.auth.getUser();

  if (user) {
    // Jika login: Tampilkan konten utama, sembunyikan form login
    authForm.classList.add('hidden');
    mainContent.classList.remove('hidden');
    // Tampilkan email user di layar
    document.getElementById('user-display').innerText = user.email;
    // Ambil data komentar
    loadComments();
  } else {
    // Jika belum login: Tampilkan form login saja
    authForm.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
}

// Tombol Login
document.getElementById('btn-login').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) alert("Gagal login: " + error.message);
  else checkUser(); // Refresh halaman user
};

// Tombol Logout
document.getElementById('btn-logout').onclick = async () => {
  await db.auth.signOut();
  location.reload(); // Refresh halaman browser
};

// Tombol Kirim Komentar
document.getElementById('btn-submit-comment').onclick = async () => {
  const content = document.getElementById('comment-text').value;

  // Cek siapa yang sedang login
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    alert("Sesi habis, silakan login lagi.");
    return;
  }

  // Kirim data ke tabel 'comment'
  const { error } = await db.from('comment').insert([
    { content: content, email: user.email }
  ]);

  if (error) {
    alert("Gagal kirim komentar: " + error.message);
  } else {
    // Jika sukses, kosongkan kolom ketik dan refresh daftar komentar
    document.getElementById('comment-text').value = '';
    loadComments();
  }
};

// Fungsi Mengambil Daftar Komentar
async function loadComments() {
  // Ambil data dari tabel 'comment'
  const { data, error } = await db
    .from('comment')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Jika error, tampilkan pesan di layar
    console.error("Error loading comments:", error);
    commentsList.innerHTML = "<p style='color:red'>Gagal memuat komentar. Cek Console.</p>";
  } else {
    // Jika data kosong
    if (data.length === 0) {
      commentsList.innerHTML = "<p>Belum ada komentar.</p>";
    } else {
      // Render (tampilkan) data ke HTML
      commentsList.innerHTML = data.map(c => `
                <div class="comment-item">
                    <div class="comment-email">${c.email}</div>
                    <div>${c.content}</div>
                </div>
            `).join('');
    }
  }
}

// Jalankan fungsi cek user saat pertama kali web dibuka
checkUser();