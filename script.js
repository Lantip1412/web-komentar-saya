// --- 1. KONFIGURASI ---
const SUPABASE_URL = 'https://grnbawakruzedgsqapvu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hHYxshwAPqB0eo68oQwI6Q_2fHCnJAW'; // <-- PASTE KEY ANDA DI SINI
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ROOM_NAME = "Room-Rahasia-Lantip-Dan-Teman";
// Waktu Logout Otomatis (5 Menit)
const BATAS_WAKTU_DIAM = 5 * 60 * 1000;

// --- 2. LOGIKA LOGIN & USER ---
async function checkUser() {
  const { data: { user } } = await db.auth.getUser();
  if (user) {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('user-display').innerText = user.email;

    loadChat();
    setInterval(loadChat, 2000);

    // Aktifkan Timer Logout
    mulaiPenghitungWaktu();
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

  await db.from('comment').insert([{ content: content, email: user.email }]);

  input.value = '';
  loadChat();
}

async function loadChat() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) return;

  const { data, error } = await db
    .from('comment') // Pastikan nama tabel benar (comment / comments)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error) {
    const chatBox = document.getElementById('chat-box');

    chatBox.innerHTML = data.map(msg => {
      const isMe = msg.email === user.email;
      const bubbleClass = isMe ? 'my-message' : 'other-message';

      // LOGIKA FORMAT WAKTU (Jam:Menit)
      const waktuObj = new Date(msg.created_at);
      // Mengubah ke format jam Indonesia (24 jam)
      const waktuStr = waktuObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      return `
                <div class="message-bubble ${bubbleClass}">
                    <div class="sender-name">${msg.email.split('@')[0]}</div>
                    <div class="message-text">${msg.content}</div>
                    <div class="message-time">${waktuStr}</div>
                </div>
            `;
    }).join('');
  }
}

// --- 4. FITUR VIDEO CALL ---
let api = null;

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
  api = new JitsiMeetExternalAPI(domain, options);
}

function endVideoCall() {
  if (api) {
    api.dispose();
    api = null;
  }
  document.getElementById('video-container').style.display = 'none';
}

// --- 5. FITUR AUTO LOGOUT (IDLE) ---
let timerLogout;

function mulaiPenghitungWaktu() {
  clearTimeout(timerLogout);
  timerLogout = setTimeout(async () => {
    alert("Anda tidak aktif selama 5 menit. Logout otomatis...");
    await logout();
  }, BATAS_WAKTU_DIAM);
}

// Reset timer jika ada aktivitas
window.onload = mulaiPenghitungWaktu;
document.onmousemove = mulaiPenghitungWaktu;
document.onkeypress = mulaiPenghitungWaktu;
document.onclick = mulaiPenghitungWaktu;
document.onscroll = mulaiPenghitungWaktu;

document.getElementById('message-input').addEventListener("keypress", function (event) {
  if (event.key === "Enter") sendMessage();
});

checkUser();