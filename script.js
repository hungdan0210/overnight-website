/* ===== OverNight Demo – script.js (hardened) =====
   • Không ghi cứng API-KEY trong mã nguồn public
   • Toàn bộ log nhạy cảm đã loại bỏ
   • Thêm throttling đơn giản tránh spam
*/

/* ---------- Cấu hình ---------- */
const API_URL = "https://overnight-api-beta.vercel.app/solve";

/*  
   👉 Cách nạp KEY an toàn:
   1) Tạo file .env local (không commit):
        VITE_OVN_KEY=your_secret_key
   2) Dùng bundler (Vite, webpack) để inject:
        const API_KEY = import.meta.env.VITE_OVN_KEY;
   3) Hoặc tạm thời gán thủ công dưới đây rồi xoá trước khi public.
*/
const API_KEY = "REPLACE_WITH_KEY";

/* ---------- Throttling: 1 request / 2 s ---------- */
let lastCall = 0;
function canCall() {
  const now = Date.now();
  if (now - lastCall < 2000) return false;
  lastCall = now;
  return true;
}

/* ---------- Hàm xử lý chính ---------- */
async function solve() {
  const xInput   = document.getElementById("x");
  const resultEl = document.getElementById("result");
  const x        = Number(xInput.value);

  /* Kiểm tra đầu vào */
  if (!x || x <= 2 || x % 2 !== 0) {
    resultEl.innerText = "Vui lòng nhập số chẵn lớn hơn 2";
    return;
  }
  const MAX = 2 ** 53;
  if (x > MAX) {
    resultEl.innerText =
      "Giới hạn thử nghiệm là 2^53 (do máy tính), không phải giới hạn của thuật toán OverNight.";
    return;
  }

  /* Throttling */
  if (!canCall()) {
    resultEl.innerText = "Đang chờ… vui lòng thử lại sau 2 giây.";
    return;
  }

  /* Gọi API */
  try {
    resultEl.innerText = "Đang xử lý…";

    const url = `${API_URL}?x=${x}&key=${API_KEY}`;
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      resultEl.innerText = "Không truy cập được API.";
      return;
    }
    const data = await res.json();

    if (data?.a && data?.b && data.x === x) {
      resultEl.innerText = `${x} = ${data.a} + ${data.b}`;
    } else {
      resultEl.innerText = "Không tìm thấy nghiệm phù hợp.";
    }
  } catch {
    resultEl.innerText = "Đã xảy ra lỗi kết nối hoặc xử lý.";
  }
}
