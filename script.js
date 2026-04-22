let history = [];
let services = [];
let chart;

// LOAD
function loadData() {
  history = JSON.parse(localStorage.getItem("fuel")) || [];
  services = JSON.parse(localStorage.getItem("services")) || [];
}

// SAVE
function saveData() {
  localStorage.setItem("fuel", JSON.stringify(history));
  localStorage.setItem("services", JSON.stringify(services));
}

// ADD FUEL
function addEntry() {
  let miles = +milesInput();
  let gallons = +gallonsInput();
  let cost = +costInput();

  if (miles <= 0 || gallons <= 0 || cost <= 0) {
    alert("Invalid input");
    return;
  }

  let mpg = miles / gallons;

  history.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    miles,
    gallons,
    cost,
    mpg
  });

  saveData();
  updateUI();
}

// ADD SERVICE
function addService() {
  let name = service.value;
  let costVal = +serviceCost.value;

  if (!name || !costVal) return;

  services.unshift({
    id: Date.now(),
    name,
    cost: costVal
  });

  saveData();
  updateUI();
}

// INPUTS
const milesInput = () => document.getElementById("miles").value;
const gallonsInput = () => document.getElementById("gallons").value;
const costInput = () => document.getElementById("cost").value;

// UI
function updateUI() {
  let totalMiles = 0, totalGallons = 0, totalCost = 0;

  let historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  history.forEach(item => {
    totalMiles += item.miles;
    totalGallons += item.gallons;
    totalCost += item.cost;

    let el = document.createElement("div");
    el.className = "history-item";
    el.innerHTML = `
      <span>${item.mpg.toFixed(1)} MPG</span>
      <span>$${item.cost}</span>
    `;

    enableSwipe(el, () => deleteEntry(item.id));

    historyDiv.appendChild(el);
  });

  let avgMPG = totalGallons ? totalMiles / totalGallons : 0;
  let costPerMile = totalMiles ? totalCost / totalMiles : 0;

  document.getElementById("mpg").innerText = avgMPG.toFixed(1);
  document.getElementById("costMile").innerText = "$" + costPerMile.toFixed(2);
  document.getElementById("total").innerText = "$" + totalCost.toFixed(2);

  // BEST / WORST
  if (history.length > 0) {
    let mpgs = history.map(h => h.mpg);
    document.getElementById("bestMPG").innerText = "Best MPG: " + Math.max(...mpgs).toFixed(1);
    document.getElementById("worstMPG").innerText = "Worst MPG: " + Math.min(...mpgs).toFixed(1);
  }

  updateChart();
  updateServices();
}

// DELETE
function deleteEntry(id) {
  history = history.filter(e => e.id !== id);
  saveData();
  updateUI();
}

// SWIPE
function enableSwipe(el, callback) {
  let startX = 0;

  el.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  el.addEventListener("touchend", e => {
    let endX = e.changedTouches[0].clientX;
    if (startX - endX > 100) callback();
  });
}

// SERVICES UI
function updateServices() {
  let div = document.getElementById("serviceHistory");
  div.innerHTML = "";

  services.forEach(s => {
    div.innerHTML += `
      <div class="history-item">
        <span>${s.name}</span>
        <span>$${s.cost}</span>
      </div>`;
  });
}

// TABS
function showTab(tab) {
  document.querySelectorAll(".card").forEach(c => c.style.display = "none");
  document.querySelector("." + tab).style.display = "block";
}

// CHART
function updateChart() {
  let labels = history.map(h => new Date(h.date).toLocaleDateString());
  let data = history.map(h => h.mpg);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ data }]
    }
  });
}

// INIT
loadData();
updateUI();
showTab("dashboard-tab");