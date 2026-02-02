import { computeDestiny } from "./destiny.js";

// Load JSON real data
const nguHanh = await fetch("./data/ngu_hanh_125_full.json").then((r) =>
  r.json(),
);

const menhPhu = await fetch("./data/menh_phu_link.json").then((r) => r.json());

document.getElementById("btnPredict").addEventListener("click", () => {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("Nhập họ tên trước!");

  // Compute destiny
  const result = computeDestiny(name, nguHanh, menhPhu);

  renderResult(result);
});

function luckColor(luck) {
  if (luck.includes("Rất tốt")) return "bg-green-200 text-green-800";
  if (luck.includes("Tốt")) return "bg-green-100 text-green-700";
  if (luck.includes("Được")) return "bg-yellow-100 text-yellow-700";
  if (luck.includes("Xấu")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function renderResult(data) {
  document.getElementById("results").classList.remove("hidden");

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
