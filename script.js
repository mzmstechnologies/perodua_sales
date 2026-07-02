// ── CONFIGURATION ── update these values ──────────────────────────────
const CONFIG = {
  agentName:       "Mak Cik Perodua",
  agentPhone:      "60197066093",
  googleFormUrl:   "https://docs.google.com/forms/d/e/1FAIpQLScOF-VXc0RoP66J6OS6duhpUX_riMYEDCS1WrEnVNzztbUeLw/viewform",
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbxObvs8ULc8dAYcZVx2ILGCgpBNukO3KpMuQfiaHYpOplubOOea7po3sIzPinf_9goa/exec",
};

// ── PERODUA CAR DATA (OTR 2024/2025, Peninsular Malaysia) ─────────────
const CARS = [
  {
    id: "axia", name: "Perodua Axia",
    tagline: "Ringan, Lincah & Jimat Minyak",
    bg: "#E8F5E9", fg: "#2E7D32", fromPrice: 39600,
    variants: [
      { name: "E (Manual)", price: 39600 },
      { name: "G (Auto)",   price: 45700 },
      { name: "X (Auto)",   price: 48500 },
      { name: "AV (Auto)",  price: 52000 },
    ]
  },
  {
    id: "bezza", name: "Perodua Bezza",
    tagline: "Sedan Selesa & Ekonomikal",
    bg: "#E3F2FD", fg: "#1565C0", fromPrice: 41900,
    variants: [
      { name: "1.0 G Premium (Auto)", price: 41900 },
      { name: "1.3 X (Auto)",         price: 46000 },
      { name: "1.3 AV (Auto)",        price: 52000 },
    ]
  },
  {
    id: "myvi", name: "Perodua Myvi",
    tagline: "Kereta Kebanggaan Rakyat Malaysia",
    bg: "#FCE4EC", fg: "#C62828", fromPrice: 55700,
    variants: [
      { name: "1.3 G (Auto)", price: 55700 },
      { name: "1.5 X (Auto)", price: 59700 },
      { name: "1.5 H (Auto)", price: 62700 },
      { name: "1.5 AV (Auto)",price: 69500 },
    ]
  },
  {
    id: "ativa", name: "Perodua Ativa",
    tagline: "SUV Turbo Pertama Perodua",
    bg: "#FFF3E0", fg: "#E65100", fromPrice: 61500,
    variants: [
      { name: "X (Auto)",  price: 61500 },
      { name: "H (Auto)",  price: 67000 },
      { name: "AV (Auto)", price: 72500 },
    ]
  },
  {
    id: "alza", name: "Perodua Alza",
    tagline: "MPV Lapang 7 Tempat Duduk",
    bg: "#F3E5F5", fg: "#6A1B9A", fromPrice: 62500,
    variants: [
      { name: "X (Auto)",  price: 62500 },
      { name: "H (Auto)",  price: 69500 },
      { name: "AV (Auto)", price: 75500 },
    ]
  },
  {
    id: "aruz", name: "Perodua Aruz",
    tagline: "SUV Tangguh & Berkuasa",
    bg: "#E8EAF6", fg: "#283593", fromPrice: 74500,
    variants: [
      { name: "X (Auto)",  price: 74500 },
      { name: "AV (Auto)", price: 84000 },
    ]
  },
];

// ── STATE ──────────────────────────────────────────────────────────────
let selectedTenure = 7;
let calcData = { car:"", variant:"", price:0, downPayment:0, rate:3.5, tenure:7, loan:0, monthly:0, interest:0, total:0 };

// ── INIT ───────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderCarCards();
  renderCalcDropdown();
  renderTenureButtons();
  updatePreview();
  const ph = CONFIG.agentPhone;
  if (!ph.includes("X")) {
    document.getElementById("displayPhone").textContent = "+" + ph;
  }
});

// ── CAR CARDS ──────────────────────────────────────────────────────────
function renderCarCards() {
  document.getElementById("carsGrid").innerHTML = CARS.map(car => `
    <div class="car-card" id="card-${car.id}" onclick="selectCarCard('${car.id}')">
      <div class="car-image" style="background:${car.bg};">
        <div class="car-placeholder">
          <div class="car-placeholder-icon" style="color:${car.fg};">&#128664;</div>
          <div class="car-placeholder-label" style="color:${car.fg};">${car.name.replace("Perodua ","")}</div>
        </div>
      </div>
      <div class="car-info">
        <div class="car-model-name">${car.name}</div>
        <div class="car-tagline">${car.tagline}</div>
        <div class="car-price-from">Harga Bermula</div>
        <div class="car-price">RM ${fmt(car.fromPrice)}</div>
        <button class="car-select-btn" id="carBtn-${car.id}">Pilih &amp; Kira</button>
      </div>
    </div>
  `).join("");
}

function selectCarCard(id) {
  document.querySelectorAll(".car-card").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(".car-select-btn").forEach(el => el.textContent = "Pilih & Kira");
  document.getElementById("card-" + id).classList.add("selected");
  document.getElementById("carBtn-" + id).textContent = "Dipilih \u2713";
  document.getElementById("calcCar").value = id;
  updateVariants();
  setTimeout(() => document.getElementById("calculator").scrollIntoView({ behavior: "smooth", block: "start" }), 150);
}

// ── CALCULATOR ─────────────────────────────────────────────────────────
function renderCalcDropdown() {
  const sel = document.getElementById("calcCar");
  CARS.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id; o.textContent = c.name;
    sel.appendChild(o);
  });
}

function renderTenureButtons() {
  const grid = document.getElementById("tenureGrid");
  for (let y = 1; y <= 9; y++) {
    const btn = document.createElement("button");
    btn.className = "tenure-btn" + (y === 7 ? " active" : "");
    btn.textContent = y;
    btn.dataset.year = y;
    btn.type = "button";
    btn.onclick = () => {
      selectedTenure = y;
      document.querySelectorAll(".tenure-btn").forEach(b => b.classList.toggle("active", +b.dataset.year === y));
      updateCalc();
    };
    grid.appendChild(btn);
  }
}

function updateVariants() {
  const id = document.getElementById("calcCar").value;
  const car = CARS.find(c => c.id === id);
  const vSel = document.getElementById("calcVariant");
  vSel.innerHTML = '<option value="">-- Pilih Varian --</option>';
  if (car) {
    car.variants.forEach((v, i) => {
      const o = document.createElement("option");
      o.value = i; o.textContent = `${v.name}  —  RM ${fmt(v.price)}`;
      vSel.appendChild(o);
    });
    document.querySelectorAll(".car-card").forEach(el => el.classList.remove("selected"));
    document.querySelectorAll(".car-select-btn").forEach(el => el.textContent = "Pilih & Kira");
    const card = document.getElementById("card-" + id);
    if (card) {
      card.classList.add("selected");
      document.getElementById("carBtn-" + id).textContent = "Dipilih \u2713";
    }
  }
  updateCalc();
}

function updateCalc() {
  const id = document.getElementById("calcCar").value;
  const vIdx = document.getElementById("calcVariant").value;
  const car = CARS.find(c => c.id === id);
  const dp = parseFloat(document.getElementById("downPayment").value) || 0;
  const rate = parseFloat(document.getElementById("interestRate").value) || 0;
  const tenure = selectedTenure;

  let price = 0, carLabel = "Belum dipilih", varLabel = "";
  if (car && vIdx !== "") {
    const v = car.variants[+vIdx];
    price = v.price;
    carLabel = car.name;
    varLabel = v.name;
    document.getElementById("carPrice").value = "RM " + fmt(price);
    const pct = price > 0 ? ((dp / price) * 100).toFixed(1) : 0;
    document.getElementById("dpPercent").textContent = dp > 0 ? `${pct}% daripada harga kereta` : "";
  } else {
    document.getElementById("carPrice").value = "";
    document.getElementById("dpPercent").textContent = "";
  }

  const loan = Math.max(0, price - dp);
  const interest = loan * (rate / 100) * tenure;
  const total = loan + interest;
  const months = tenure * 12;
  const monthly = months > 0 && loan > 0 ? total / months : 0;

  document.getElementById("rCar").textContent = varLabel ? `${carLabel} (${varLabel})` : carLabel;
  document.getElementById("rPrice").textContent = "RM " + fmt(price);
  document.getElementById("rLoan").textContent = "RM " + fmt(loan);
  document.getElementById("rMonthly").textContent = "RM " + fmt(monthly);
  document.getElementById("rTenure").textContent = tenure + " tahun";
  document.getElementById("rRate").textContent = rate + "%";
  document.getElementById("rInterest").textContent = "RM " + fmt(interest);
  document.getElementById("rTotal").textContent = "RM " + fmt(total);

  calcData = { car: carLabel, variant: varLabel, price, downPayment: dp, rate, tenure, loan, monthly, interest, total };
  updateCarField();
  updatePreview();
}

function updateCarField() {
  const carEl = document.getElementById("custCar");
  const mEl = document.getElementById("custMonthly");
  if (calcData.car && calcData.variant) {
    carEl.value = `${calcData.car} ${calcData.variant} — RM ${fmt(calcData.price)}`;
    mEl.value = calcData.monthly > 0
      ? `RM ${fmt(calcData.monthly)} / bulan (${calcData.tenure} thn @ ${calcData.rate}%)`
      : "";
  } else {
    carEl.value = "";
    mEl.value = "";
  }
}

// ── WHATSAPP ───────────────────────────────────────────────────────────
function buildMessage() {
  const name    = (document.getElementById("custName").value  || "").trim() || "(Nama)";
  const ic      = (document.getElementById("custIC").value    || "").trim() || "(No. IC)";
  const phone   = (document.getElementById("custPhone").value || "").trim() || "(No. Tel)";
  const email   = (document.getElementById("custEmail").value || "").trim();
  const note    = (document.getElementById("custNote").value  || "").trim();

  let msg = "Assalamualaikum Mak Cik Perodua,\n\n";
  msg += "Saya berminat untuk membeli kereta Perodua. Berikut maklumat saya:\n\n";
  msg += `*Nama Penuh:* ${name}\n`;
  msg += `*No. IC:* ${ic}\n`;
  msg += `*No. Telefon:* ${phone}\n`;
  if (email) msg += `*E-mel:* ${email}\n`;
  msg += "\n";

  if (calcData.car && calcData.variant) {
    msg += `*Kereta Dipilih:* ${calcData.car} ${calcData.variant}\n`;
    msg += `*Harga OTR:* RM ${fmt(calcData.price)}\n`;
    msg += `*Bayaran Pendahuluan:* RM ${fmt(calcData.downPayment)}\n`;
    msg += `*Amaun Pinjaman:* RM ${fmt(calcData.loan)}\n`;
    msg += `*Tempoh Pinjaman:* ${calcData.tenure} tahun\n`;
    msg += `*Kadar Faedah:* ${calcData.rate}% p.a.\n`;
    msg += `*Anggaran Bayaran Bulanan:* RM ${fmt(calcData.monthly)}\n`;
    msg += "\n";
  }
  if (note) msg += `*Nota:* ${note}\n\n`;

  msg += "Sila hubungi saya untuk maklumat lanjut. Terima kasih!";
  return msg;
}

function updatePreview() {
  document.getElementById("previewText").textContent = buildMessage();
}

function sendWhatsApp() {
  const name  = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  if (!name || !phone) {
    toast("Sila isi Nama Penuh dan No. Telefon terlebih dahulu.", false);
    return;
  }

  const msg = buildMessage();
  const phone_cleaned = CONFIG.agentPhone.replace(/\D/g, "");
  window.open("https://wa.me/" + phone_cleaned + "?text=" + encodeURIComponent(msg), "_blank");

  captureToSheets(name, phone);
  toast("WhatsApp sedang dibuka! Maklumat anda telah direkodkan.", true);
}

async function captureToSheets(name, phone) {
  const url = CONFIG.googleScriptUrl;
  if (!url || !url.startsWith("https://")) return;
  const payload = {
    timestamp:      new Date().toLocaleString("ms-MY"),
    name,
    ic:             document.getElementById("custIC").value,
    phone,
    email:          document.getElementById("custEmail").value,
    car:            calcData.car,
    variant:        calcData.variant,
    carPrice:       calcData.price,
    downPayment:    calcData.downPayment,
    loanAmount:     calcData.loan,
    tenure:         calcData.tenure,
    interestRate:   calcData.rate,
    monthlyPayment: calcData.monthly,
    note:           document.getElementById("custNote").value,
  };
  try {
    await fetch(url, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
  } catch(e) { console.warn("Sheets capture failed:", e); }
}

function scrollToInquiry() {
  document.getElementById("inquiry").scrollIntoView({ behavior: "smooth" });
}

// ── UTILITIES ──────────────────────────────────────────────────────────
function fmt(n) {
  if (!n || isNaN(n)) return "0";
  return Math.round(n).toLocaleString("en-MY");
}

function toast(msg, success = true) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast" + (success ? " success" : "") + " show";
  setTimeout(() => el.className = "toast", 3500);
}
