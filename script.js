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
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thuật toán OverNight</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <div class="column">
      <h2>Thử nghiệm thuật toán</h2>
      <label for="input">Nhập số chẵn x:</label>
      <input id="input" type="text" />
      <div class="button-group">
        <button onclick="findPair()">Tìm A + B</button>
        <button onclick="stopFetch()">⛔ Dừng tính toán</button>
      </div>
      <div id="result">Kết quả sẽ hiển thị tại đây...</div>
      <div class="log10info" id="loginfo"></div>
      <div class="note">
        🌍 Thế giới đã kiểm chứng đến x = 10<sup>18</sup>. Tại đây, tôi giới hạn đến 10<sup>20</sup> để bảo vệ API.  
        ⚡ Tuy nhiên, ở nơi khác tôi đã kiểm chứng với x ≈ 10<sup>72</sup>, trả về kết quả chỉ trong ~5 giây bằng máy tính cá nhân.  
        🧪 Đây là kiểm chứng thực hiện bằng Python, có giới hạn kỹ thuật.
      </div>
    </div>

    <div class="column">
      <img src="author.jpg" alt="Author" class="author-img"/>
      <h3>Thông tin tác giả</h3>
      <p><strong>Tên:</strong> Le Hung Dan</p>
      <p><strong>Quốc tịch:</strong> Việt Nam</p>
      <p><strong>Email:</strong> snakenidalee@gmail.com</p>
      <p><strong>Biệt danh hành trình:</strong> OverNight Project</p>
      <p><strong>Vai trò:</strong> Người đầu tiên công bố lời giải cho thuật toán OverNight bằng lý thuyết tập hợp, thuật toán và thực nghiệm.</p>
      <p class="share">“Tôi không phải nhà toán học... Nếu bạn thấy điều này hợp lý, xin hãy giúp lan tỏa.”</p>
    </div>

    <div class="column">
      <h3>Tuyên bố & Giải thích</h3>
      <p>Dự án OverNight là một khám phá độc lập... Thuật toán không được công bố công khai mà được kiểm chứng qua API bảo mật.</p>
      <p>Mọi lời gọi API thực hiện theo thời gian thực, không tiết lộ thuật toán thật.</p>
    </div>
  </div>

  <script>
    let controller;

    function stopFetch() {
      if (controller) {
        controller.abort();
        document.getElementById("result").innerText = "⛔ Đã dừng tính toán.";
        document.getElementById("loginfo").innerText = "";
      }
    }

    function findPair() {
      const input = document.getElementById("input").value;
      const x = BigInt(input);
      const log10 = Math.floor(Math.log10(Number(x)));
      document.getElementById("loginfo").innerText = `🔢 Con số bạn vừa thử sấp xỉ 10^${log10}`;

      document.getElementById("result").innerText = "⏳ Đang tìm nghiệm...";

      controller = new AbortController();

      fetch(`https://overnight-api-57tf.vercel.app/solve?x=${x.toString()}`, {
        signal: controller.signal
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === "success") {
            document.getElementById("result").innerText = `✅ Tìm được: ${data.sum}`;
          } else {
            document.getElementById("result").innerText = "❌ Không tìm thấy nghiệm phù hợp.";
          }
        })
        .catch(error => {
          if (error.name === "AbortError") return;
          document.getElementById("result").innerText = "❌ Lỗi kết nối đến máy chủ.";
        });
    }
  </script>
</body>
</html>
