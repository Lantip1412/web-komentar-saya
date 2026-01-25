// --- 1. KONFIGURASI ---
const SUPABASE_URL = 'https://grnbawakruzedgsqapvu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hHYxshwAPqB0eo68oQwI6Q_2fHCnJAW'; // <-- PASTE KEY ANDA DI SINI
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Nama Room Video Call (Harus unik & rahasia agar orang lain tidak nyasar)
const ROOM_NAME = "Room-Rahasia-Lantip-Dan-Teman";

// --- 2. LOGIKA LOGIN & USER ---
async function checkUser() {
  const { data: { user } } = await db.auth.getUser();
  if (user) {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('user-display').innerText = user.email;

    // Mulai ambil chat otomatis setiap 2 detik
    loadChat();
    setInterval(loadChat, 2000);
  } else {
    document.getElementById('auth-form').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
  }
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else checkUser();
}

async function logout() {
  await db.auth.signOut();
  location.reload();
}

// --- 3. FITUR CHATTING ---
async function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value;
  if (!content) return;

  const { data: { user } } = await db.auth.getUser();

  // Kirim ke tabel 'comment' (Kita pakai tabel yang sudah ada saja)
  await db.from('comment').insert([{ content: content, email: user.email }]);

  input.value = ''; // Kosongkan input
  loadChat(); // Refresh langsung
}

async function loadChat() {
  const { data: { user } } = await db.auth.getUser(); // Cek user siapa yang login
  if (!user) return;

  const { data, error } = await db
    .from('comment')
    .select('*')
    .order('created_at', { ascending: false }) // Pesan baru di atas (karena flex-reverse)
    .limit(50); // Ambil 50 pesan terakhir

  if (!error) {
    const chatBox = document.getElementById('chat-box');

    chatBox.innerHTML = data.map(msg => {
      // Cek apakah ini pesan saya atau orang lain untuk bedakan warna
      const isMe = msg.email === user.email;
      const bubbleClass = isMe ? 'my-message' : 'other-message';

      return `
                <div class="message-bubble ${bubbleClass}">
                    <div class="sender-name">${msg.email}</div>
                    ${msg.content}
                </div>
            `;
    }).join('');
  }
}

// --- 4. FITUR VIDEO CALL (JITSI MEET) ---
let api = null; // Wadah untuk video call

function startVideoCall() {
  document.getElementById('video-container').style.display = 'block';

  const domain = 'meet.jit.si';
  const options = {
    roomName: ROOM_NAME,
    width: '100%',
    height: '100%',
    parentNode: document.querySelector('#jitsi-frame'),
    lang: 'id',
    configOverwrite: { startWithAudioMuted: false },
  };

  // Jalankan Video Call
  api = new JitsiMeetExternalAPI(domain, options);
}

function endVideoCall() {
  if (api) {
    api.dispose(); // Matikan kamera & koneksi
    api = null;
  }
  document.getElementById('video-container').style.display = 'none';
}

// Enter untuk kirim pesan
document.getElementById('message-input').addEventListener("keypress", function (event) {
  if (event.key === "Enter") sendMessage();
});

// Jalankan saat awal
checkUser();