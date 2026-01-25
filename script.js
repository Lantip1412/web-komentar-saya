// --- 1. KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://grnbawakruzedgsqapvu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hHYxshwAPqB0eo68oQwI6Q_2fHCnJAW';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. PENGATURAN WAKTU LOGOUT (Bisa Diubah) ---
// 5 Menit = 5 * 60 * 1000 = 300000 milidetik
// Jika ingin tes cepat, ubah jadi 10000 (10 detik)
const BATAS_WAKTU_DIAM = 10000;

// --- 3. ELEMEN HTML ---
const authForm = document.getElementById('auth-form');
const mainContent = document.getElementById('main-content');
const commentsList = document.getElementById('comments-list');

// --- 4. LOGIKA APLIKASI ---

async function checkUser() {
  const { data: { user } } = await db.auth.getUser();

  if (user) {
    authForm.classList.add('hidden');
    mainContent.classList.remove('hidden');
    document.getElementById('user-display').innerText = user.email;
    loadComments();

    // Mulai jalankan timer logout otomatis
    mulaiPenghitungWaktu();
  } else {
    authForm.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
}

document.getElementById('btn-login').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) alert("Gagal login: " + error.message);
  else checkUser();
};

document.getElementById('btn-logout').onclick = async () => {
  await db.auth.signOut();
  location.reload();
};

document.getElementById('btn-submit-comment').onclick = async () => {
  const content = document.getElementById('comment-text').value;
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    alert("Sesi habis, silakan login lagi.");
    return;
  }

  const { error } = await db.from('comment').insert([
    { content: content, email: user.email }
  ]);

  if (error) {
    alert("Gagal kirim komentar: " + error.message);
  } else {
    document.getElementById('comment-text').value = '';
    loadComments();
  }
};

async function loadComments() {
  const { data, error } = await db
    .from('comment')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    commentsList.innerHTML = "<p style='color:red'>Gagal memuat komentar.</p>";
  } else {
    if (data.length === 0) {
      commentsList.innerHTML = "<p>Belum ada komentar.</p>";
    } else {
      commentsList.innerHTML = data.map(c => `
                <div class="comment-item">
                    <div class="comment-email">${c.email}</div>
                    <div>${c.content}</div>
                </div>
            `).join('');
    }
  }
}

// --- 5. FITUR LOGOUT OTOMATIS (BARU) ---
let timerLogout;

function mulaiPenghitungWaktu() {
  // Setiap kali fungsi ini dipanggil, reset timer lama
  clearTimeout(timerLogout);

  // Set timer baru sesuai batas waktu
  timerLogout = setTimeout(async () => {
    alert("Anda tidak aktif selama 5 menit. Logout otomatis demi keamanan.");
    await db.auth.signOut();
    location.reload();
  }, BATAS_WAKTU_DIAM);
}

// Dengarkan aktivitas user (Mouse gerak, Klik, Ngetik)
// Jika ada aktivitas, timer di-reset ulang ke 0
window.onload = mulaiPenghitungWaktu;
document.onmousemove = mulaiPenghitungWaktu;
document.onkeypress = mulaiPenghitungWaktu;
document.onclick = mulaiPenghitungWaktu;
document.onscroll = mulaiPenghitungWaktu;

// Jalankan aplikasi
checkUser();