import { computeDestiny } from "./destiny.js";

document.getElementById("btnPredict").addEventListener("click", () => {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("Nhập họ tên trước!");

  // Compute destiny
  const result = computeDestiny(name);

  renderResult(result);
});

function luckColor(luck) {
  if (luck.includes("Rất tốt")) return "bg-green-200 text-green-800";
  if (luck.includes("Tốt")) return "bg-green-100 text-green-700";
  if (luck.includes("Được")) return "bg-yellow-100 text-yellow-700";
  if (luck.includes("Xấu")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function getRank(score) {
  if (score >= 90)
    return {
      label: "🌟 Tuyệt phẩm (Đại Cát toàn phần)",
      badge: "bg-green-100 text-green-800",
      circle: "bg-green-500 text-white",
    };

  if (score >= 70)
    return {
      label: "✅ Tên rất đẹp (Ít khuyết điểm)",
      badge: "bg-blue-100 text-blue-800",
      circle: "bg-blue-500 text-white",
    };

  if (score >= 50)
    return {
      label: "⚠️ Tên khá (Cần nỗ lực vượt khó)",
      badge: "bg-yellow-100 text-yellow-800",
      circle: "bg-yellow-400 text-white",
    };

  return {
    label: "❌ Tên xấu (Nên cân nhắc bí danh)",
    badge: "bg-red-100 text-red-800",
    circle: "bg-red-500 text-white",
  };
}

function renderResult(data) {
  document.getElementById("results").classList.remove("hidden");

   // ==============================
  // SCORE BUBBLE UI
  // ==============================
  const total = data.scoring.totalScore;

  // Score number
  document.getElementById("totalScore").textContent = total;

  // Rank styling
  const rank = getRank(total);

  // Badge text
  const badge = document.getElementById("scoreRank");
  badge.textContent = rank.label;
  badge.className = `mt-2 inline-block px-4 py-2 rounded-xl font-semibold ${rank.badge}`;

  // Circle color
  const circle = document.getElementById("scoreCircle");
  circle.className = `w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-center font-extrabold text-3xl shadow-lg ${rank.circle}`;

  // Prediction list
  const list = document.getElementById("predictionList");
  list.innerHTML = "";
  data.prediction.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    list.appendChild(li);
  });

  // Destiny cards
  const destinyTable = document.getElementById("destinyTable");
  destinyTable.innerHTML = "";

  const labels = {
    hoVan: "Họ vận",
    tenVan: "Tên vận",
    menhVan: "Mệnh vận",
    tongVan: "Tổng vận",
    phuVan: "Phụ vận",
  };

  const order = ["hoVan", "tenVan", "menhVan", "tongVan", "phuVan"];

  for (let key of order) {
    const d = data.result[key];

    const card = document.createElement("div");
    card.className = "rounded-xl p-4 border shadow-sm flex flex-col gap-2";

    card.innerHTML = `
    <h3 class="font-bold text-slate-700">${labels[key]}</h3>

    <p class="text-2xl font-bold">${d.value}</p>

    <span class="px-2 py-1 rounded-lg text-sm font-semibold ${luckColor(
      d.luck,
    )}">
      ${d.luck}
    </span>

    <p class="text-sm text-slate-600 mt-2">
      ${d.meaning}
    </p>
  `;

    destinyTable.appendChild(card);
  }

  // Ba Bieu The
  document.getElementById("threeStates").textContent =
    data.baBieuThe.three_states_interpretation;
  document.getElementById("threeMeaning").textContent =
    data.baBieuThe.meaning_interpretation;

  // Menh Phu
  document.getElementById("menhPhuKey").textContent =
    `${data.menhPhu.menh}-${data.menhPhu.phu}`;
  document.getElementById("menhPhuLuck").textContent = data.menhPhu.luck;
  document.getElementById("menhPhuMeaning").textContent = data.menhPhu.meaning;

  // Raw JSON
  document.getElementById("jsonOutput").textContent = JSON.stringify(
    data,
    null,
    2,
  );
}
