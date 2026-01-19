// Konfigurasi Supabase
const SUPABASE_URL = 'https://grnbawakruzedgsqapvu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hHYxshwAPqB0eo68oQwI6Q_2fHCnJAW';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elemen UI
const authForm = document.getElementById('auth-form');
const mainContent = document.getElementById('main-content');
const commentsList = document.getElementById('comments-list');

// 1. Fungsi Cek Status Login
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    authForm.classList.add('hidden');
    mainContent.classList.remove('hidden');
    document.getElementById('user-display').innerText = user.email;
    loadComments();
  } else {
    authForm.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
}

// 2. Fitur Daftar (Sign Up)
document.getElementById('btn-signup').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert('Cek email Anda untuk konfirmasi (jika fitur konfirmasi aktif)!');
};



// 4. Fitur Logout
document.getElementById('btn-logout').onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// 5. Kirim Komentar
document.getElementById('btn-submit-comment').onclick = async () => {
  const content = document.getElementById('comment-text').value;
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('comments').insert([
    { content: content, email: user.email }
  ]);

  if (error) alert(error.message);
  else {
    document.getElementById('comment-text').value = '';
    loadComments();
  }
};

// 6. Tampilkan Komentar
async function loadComments() {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    commentsList.innerHTML = "Gagal memuat komentar.";
  } else {
    commentsList.innerHTML = data.map(c => `
            <div class="comment-item">
                <div class="comment-email">${c.email}</div>
                <div>${c.content}</div>
            </div>
        `).join('');
  }
}

// Jalankan pengecekan user saat halaman dibuka
checkUser();
