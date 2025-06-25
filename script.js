let controller = null;

function solve() {
  const input = document.getElementById("evenInput").value.trim();
  const resultDiv = document.getElementById("result");
  const logDiv = document.getElementById("log10info");
  resultDiv.textContent = "⏳ Đang tính toán...";
  logDiv.textContent = "";

  if (!/^\d+$/.test(input)) {
    resultDiv.textContent = "❌ Vui lòng nhập một số nguyên dương hợp lệ.";
    return;
  }

  const x = BigInt(input);
  const digits = x.toString().length;
  logDiv.textContent = `Con số bạn vừa thử sấp xỉ 10^${digits}`;

  controller = new AbortController();

  fetch(`https://overnight-api-57tf.vercel.app/solve?x=${x}`, {
    method: "GET",
    signal: controller.signal
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        resultDiv.textContent = `✅ Tìm được: ${data.a} + ${data.b} = ${data.sum}`;
      } else {
        resultDiv.textContent = "❌ Không tìm thấy nghiệm trong khoảng thử.";
      }
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        resultDiv.textContent = "❌ Đã dừng tính toán theo yêu cầu.";
      } else {
        resultDiv.textContent = "❌ Lỗi kết nối đến máy chủ.";
      }
    });
}

function abortFetch() {
  if (controller) {
    controller.abort();
    controller = null;
  }
}
