const TARIFF = 0.92;
const DAYS_IN_MONTH = 30;

const currency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const generateConsumptionData = () => {
  const base = 11 + Math.random() * 3;
  return Array.from({ length: DAYS_IN_MONTH }, (_, dayIndex) => {
    const dailyVariation = (Math.random() - 0.5) * 5;
    const weeklyPattern = Math.sin((dayIndex / 6) * Math.PI) * 1.8;
    return Math.max(6, +(base + dailyVariation + weeklyPattern).toFixed(2));
  });
};

const calculateVariation = (today, yesterday) => {
  if (!yesterday) return 0;
  return +(((today - yesterday) / yesterday) * 100).toFixed(1);
};

const dashboard = {
  chart: null,

  init() {
    this.bindEvents();
    this.renderSimulation();
    document.getElementById("tariffValue").textContent = TARIFF.toFixed(2);
  },

  bindEvents() {
    document
      .getElementById("regenerateBtn")
      .addEventListener("click", () => this.renderSimulation());
  },

  renderSimulation() {
    const data = generateConsumptionData();
    const today = data[data.length - 1];
    const yesterday = data[data.length - 2];
    const dayVariation = calculateVariation(today, yesterday);
    const monthlyAverage = +(data.reduce((acc, value) => acc + value, 0) / data.length).toFixed(2);

    this.updateMetrics({ today, yesterday, dayVariation, monthlyAverage });
    this.updateTable(data);
    this.updateChart(data);
  },

  updateMetrics({ today, dayVariation, monthlyAverage }) {
    document.getElementById("todayConsumption").textContent = `${today} kWh`;
    document.getElementById("todayCost").textContent = `Custo no dia: ${currency(today * TARIFF)}`;

    const variationEl = document.getElementById("dayComparison");
    const statusEl = document.getElementById("comparisonStatus");

    variationEl.textContent = `${dayVariation > 0 ? "+" : ""}${dayVariation}%`;
    if (dayVariation > 0) {
      variationEl.className = "metric positive";
      statusEl.textContent = "Atenção: consumo maior que ontem.";
    } else if (dayVariation < 0) {
      variationEl.className = "metric negative";
      statusEl.textContent = "Bom resultado: consumo menor que ontem.";
    } else {
      variationEl.className = "metric";
      statusEl.textContent = "Mesmo consumo em relação a ontem.";
    }

    document.getElementById("monthAverage").textContent = `${monthlyAverage} kWh`;
    document.getElementById("monthProjection").textContent = `Projeção mensal: ${currency(
      monthlyAverage * DAYS_IN_MONTH * TARIFF
    )}`;
  },

  updateTable(data) {
    const tableBody = document.getElementById("historyTable");
    tableBody.innerHTML = "";

    data.forEach((value, index) => {
      const previous = data[index - 1];
      const variation = calculateVariation(value, previous);
      const row = document.createElement("tr");
      const variationClass = variation > 0 ? "positive" : variation < 0 ? "negative" : "";

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${value.toFixed(2)}</td>
        <td>${(value * TARIFF).toFixed(2)}</td>
        <td class="${variationClass}">${index === 0 ? "-" : `${variation > 0 ? "+" : ""}${variation}%`}</td>
      `;

      tableBody.appendChild(row);
    });
  },

  updateChart(data) {
    const ctx = document.getElementById("consumptionChart");
    const labels = data.map((_, index) => `Dia ${index + 1}`);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Consumo diário (kWh)",
            data,
            borderWidth: 2,
            borderColor: "#1a73e8",
            backgroundColor: "rgba(26, 115, 232, 0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  },
};

dashboard.init();
