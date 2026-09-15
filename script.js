const STORAGE_KEY = 'fueliq_demo_v1';
const AI_ENDPOINT = '/api/ai/chat';

const defaultState = {
  vehicles: [],
  fuelLogs: [],
  trips: [],
  drivers: [],
  budgets: [],
  alerts: [],
  settings: {
    darkMode: true,
    demoMode: true,
    theme: 'midnight',
    authenticated: false,
  },
};

const state = loadState();

const refs = {
  landingPage: document.getElementById('landingPage'),
  appShell: document.getElementById('appShell'),
  navButtons: document.querySelectorAll('.nav-item'),
  sections: document.querySelectorAll('.page-section'),
  globalSearch: document.getElementById('globalSearch'),
  themeToggle: document.getElementById('themeToggle'),
  themeOptions: document.querySelectorAll('.theme-option'),
  openDashboardBtn: document.getElementById('openDashboardBtn'),
  getStartedBtn: document.getElementById('getStartedBtn'),
  exploreDemoBtn: document.getElementById('exploreDemoBtn'),
  signInModal: document.getElementById('signInModal'),
  signInForm: document.getElementById('signInForm'),
  generateReportBtn: document.getElementById('generateReportBtn'),
  exportBtn: document.getElementById('exportBtn'),
  investigateAlertBtn: document.getElementById('investigateAlertBtn'),
  sidebarAlertTitle: document.getElementById('sidebarAlertTitle'),
  sidebarAlertText: document.getElementById('sidebarAlertText'),
  addFuelBtn: document.getElementById('addFuelBtn'),
  vehicleTableBody: document.getElementById('vehicleTableBody'),
  fuelLogTableBody: document.getElementById('fuelLogTableBody'),
  tripTableBody: document.getElementById('tripTableBody'),
  driverTableBody: document.getElementById('driverTableBody'),
  alertList: document.getElementById('alertList'),
  insightList: document.getElementById('aiInsightList'),
  predictionCards: document.getElementById('predictionCards'),
  budgetList: document.getElementById('budgetList'),
  budgetSummary: document.getElementById('budgetSummary'),
  reportRows: document.getElementById('reportRows'),
  reportTable: document.getElementById('reportTable'),
  assistantOutput: document.getElementById('assistantOutput'),
  assistantForm: document.getElementById('assistantForm'),
  assistantInput: document.getElementById('assistantInput'),
  assistantStatus: document.getElementById('assistantStatus'),
  assistantSubmit: document.getElementById('assistantSubmit'),
  liveSyncText: document.getElementById('liveSyncText'),
  liveClock: document.getElementById('liveClock'),
  summaryCards: {
    totalFuel: document.getElementById('totalFuelValue'),
    totalSpend: document.getElementById('totalSpendValue'),
    avgPrice: document.getElementById('avgPriceValue'),
    avgEconomy: document.getElementById('avgEconomyValue'),
    distance: document.getElementById('distanceValue'),
    vehicles: document.getElementById('vehiclesValue'),
    drivers: document.getElementById('driversValue'),
    monthlySpend: document.getElementById('monthlySpendValue'),
    nextMonth: document.getElementById('nextMonthValue'),
  },
  vehicleForm: document.getElementById('vehicleForm'),
  fuelForm: document.getElementById('fuelForm'),
  tripForm: document.getElementById('tripForm'),
  driverForm: document.getElementById('driverForm'),
  budgetForm: document.getElementById('budgetForm'),
  vehicleModal: document.getElementById('vehicleModal'),
  fuelModal: document.getElementById('fuelModal'),
  tripModal: document.getElementById('tripModal'),
  driverModal: document.getElementById('driverModal'),
  budgetModal: document.getElementById('budgetModal'),
  modalCloseButtons: document.querySelectorAll('.modal-close'),
  vehicleSearch: document.getElementById('vehicleSearch'),
  vehicleStatusFilter: document.getElementById('vehicleStatusFilter'),
  reportVehicleFilter: document.getElementById('reportVehicleFilter'),
  reportDriverFilter: document.getElementById('reportDriverFilter'),
  reportFuelTypeFilter: document.getElementById('reportFuelTypeFilter'),
  reportStartDate: document.getElementById('reportStartDate'),
  reportEndDate: document.getElementById('reportEndDate'),
  reportApplyBtn: document.getElementById('reportApplyBtn'),
  reportDownloadBtn: document.getElementById('reportDownloadBtn'),
};

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartConfigs = {};
let lastPersistedState = localStorage.getItem(STORAGE_KEY);

initializeApp();

function initializeApp() {
  ensureSampleData();
  applyTheme(state.settings.theme || 'midnight');
  bindEvents();
  populateSelectControls();
  renderAll();
  updateLandingView();
  startLiveUpdates();
}

function startLiveUpdates() {
  updateLiveClock();
  window.setInterval(updateLiveClock, 1000);
  window.setInterval(refreshFromStorage, 5000);
  window.addEventListener('storage', refreshFromStorage);
}

function updateLiveClock() {
  const now = new Date();
  if (refs.liveClock) {
    refs.liveClock.dateTime = now.toISOString();
    refs.liveClock.textContent = now.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

function refreshFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === lastPersistedState) return;

  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed, { settings: { ...state.settings, ...(parsed.settings || {}) } });
    lastPersistedState = raw;
    populateSelectControls();
    renderAll();
    if (refs.liveSyncText) refs.liveSyncText.textContent = 'Live local sync';
  } catch (error) {
    console.error('Error refreshing live data:', error);
  }
}

function bindEvents() {
  refs.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.section;
      switchSection(target);
    });
  });

  if (refs.globalSearch) {
    refs.globalSearch.addEventListener('input', (event) => {
      const keyword = event.target.value.trim().toLowerCase();
      filterGlobalTables(keyword);
    });
  }

  if (refs.themeToggle) {
    refs.themeToggle.addEventListener('click', () => {
      const themes = ['midnight', 'arctic', 'carbon', 'aurora'];
      const currentIndex = themes.indexOf(state.settings.theme || 'midnight');
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      applyTheme(nextTheme);
    });
  }

  refs.themeOptions.forEach((button) => {
    button.addEventListener('click', () => {
      const themeName = button.dataset.theme || 'midnight';
      applyTheme(themeName);
    });
  });

  if (refs.openDashboardBtn) {
    refs.openDashboardBtn.addEventListener('click', () => {
      openModal(refs.signInModal);
    });
  }

  if (refs.getStartedBtn) {
    refs.getStartedBtn.addEventListener('click', () => {
      openModal(refs.signInModal);
    });
  }

  if (refs.exploreDemoBtn) {
    refs.exploreDemoBtn.addEventListener('click', () => {
      openModal(refs.signInModal);
    });
  }

  if (refs.signInForm) {
    refs.signInForm.addEventListener('submit', (event) => {
      event.preventDefault();
      state.settings.authenticated = true;
      saveState();
      closeModal(refs.signInModal);
      toggleLanding(false);
      switchSection('dashboard');
      showNotification('Signed in successfully.', 'success');
    });
  }

  if (refs.generateReportBtn) {
    refs.generateReportBtn.addEventListener('click', () => {
      toggleLanding(false);
      switchSection('reports');
      renderReportTable();
    });
  }

  if (refs.exportBtn) {
    refs.exportBtn.addEventListener('click', () => {
      downloadReportCsv();
    });
  }

  if (refs.investigateAlertBtn) {
    refs.investigateAlertBtn.addEventListener('click', () => {
      toggleLanding(false);
      switchSection('intelligence');
      const prompt = 'Investigate the issue';
      refs.assistantInput.value = prompt;
      refs.assistantForm.requestSubmit();
    });
  }

  if (refs.addFuelBtn) {
    refs.addFuelBtn.addEventListener('click', () => openModal(refs.fuelModal));
  }

  document.querySelectorAll('[data-open-modal]').forEach((button) => {
    button.addEventListener('click', () => openModal(document.getElementById(button.dataset.openModal)));
  });

  refs.modalCloseButtons.forEach((button) => {
    button.addEventListener('click', () => closeModal(button.closest('.modal')));
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });

  refs.vehicleForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(refs.vehicleForm);
    const vehicle = {
      id: formData.get('id') || crypto.randomUUID(),
      registration: formData.get('registration').trim(),
      make: formData.get('make').trim(),
      model: formData.get('model').trim(),
      year: Number(formData.get('year')),
      fuelType: formData.get('fuelType'),
      tankCapacity: Number(formData.get('tankCapacity')),
      mileage: Number(formData.get('mileage')),
      assignedDriver: formData.get('assignedDriver').trim(),
      status: formData.get('status'),
    };

    const validation = validateVehicle(vehicle);
    if (!validation.valid) {
      showNotification(validation.message, 'error');
      return;
    }

    const existingIndex = state.vehicles.findIndex((item) => item.id === vehicle.id);
    if (existingIndex > -1) {
      state.vehicles[existingIndex] = vehicle;
    } else {
      state.vehicles.push(vehicle);
    }

    saveState();
    refs.vehicleForm.reset();
    closeModal(refs.vehicleModal);
    populateSelectControls();
    renderAll();
    showNotification('Vehicle saved successfully.', 'success');
  });

  refs.fuelForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(refs.fuelForm);
    const litres = Number(formData.get('litres'));
    const pricePerLitre = Number(formData.get('pricePerLitre'));
    const distance = Number(formData.get('distance')) || 0;
    const fuelRecord = {
      id: formData.get('id') || crypto.randomUUID(),
      date: formData.get('date'),
      time: formData.get('time') || '08:00',
      loggedAt: new Date().toISOString(),
      vehicleId: formData.get('vehicleId'),
      driverId: formData.get('driverId'),
      station: formData.get('station').trim(),
      fuelType: formData.get('fuelType'),
      litres,
      pricePerLitre,
      totalCost: litres * pricePerLitre,
      odometer: Number(formData.get('odometer')),
      distanceTravelled: distance,
      paymentMethod: formData.get('paymentMethod'),
      notes: formData.get('notes').trim(),
    };

    const validation = validateFuelRecord(fuelRecord);
    if (!validation.valid) {
      showNotification(validation.message, 'error');
      return;
    }

    const existingIndex = state.fuelLogs.findIndex((item) => item.id === fuelRecord.id);
    if (existingIndex > -1) {
      state.fuelLogs[existingIndex] = fuelRecord;
    } else {
      state.fuelLogs.push(fuelRecord);
    }

    saveState();
    refs.fuelForm.reset();
    closeModal(refs.fuelModal);
    populateSelectControls();
    renderAll();
    showNotification('Fuel record added successfully.', 'success');
  });

  refs.tripForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(refs.tripForm);
    const trip = {
      id: formData.get('id') || crypto.randomUUID(),
      vehicleId: formData.get('vehicleId'),
      driverId: formData.get('driverId'),
      startLocation: formData.get('startLocation').trim(),
      destination: formData.get('destination').trim(),
      date: formData.get('date'),
      distance: Number(formData.get('distance')),
      purpose: formData.get('purpose').trim(),
      fuelConsumed: Number(formData.get('fuelConsumed')),
      tripCost: Number(formData.get('tripCost')),
    };

    if (!trip.vehicleId || !trip.driverId || !trip.startLocation || !trip.destination || !trip.date) {
      showNotification('Please complete all required trip details.', 'error');
      return;
    }

    if (trip.distance <= 0 || trip.tripCost <= 0) {
      showNotification('Distance and trip cost must be greater than zero.', 'error');
      return;
    }

    const existingIndex = state.trips.findIndex((item) => item.id === trip.id);
    if (existingIndex > -1) {
      state.trips[existingIndex] = trip;
    } else {
      state.trips.push(trip);
    }

    saveState();
    refs.tripForm.reset();
    closeModal(refs.tripModal);
    renderAll();
    showNotification('Trip recorded successfully.', 'success');
  });

  refs.driverForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(refs.driverForm);
    const driver = {
      id: formData.get('id') || crypto.randomUUID(),
      name: formData.get('name').trim(),
      contact: formData.get('contact').trim(),
      assignedVehicle: formData.get('assignedVehicle'),
      status: formData.get('status'),
    };

    if (!driver.name || !driver.contact) {
      showNotification('Driver name and contact are required.', 'error');
      return;
    }

    const existingIndex = state.drivers.findIndex((item) => item.id === driver.id);
    if (existingIndex > -1) {
      state.drivers[existingIndex] = driver;
    } else {
      state.drivers.push(driver);
    }

    saveState();
    refs.driverForm.reset();
    closeModal(refs.driverModal);
    populateSelectControls();
    renderAll();
    showNotification('Driver saved successfully.', 'success');
  });

  refs.budgetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(refs.budgetForm);
    const budget = {
      id: formData.get('id') || crypto.randomUUID(),
      month: formData.get('month'),
      amount: Number(formData.get('amount')),
      category: formData.get('category').trim() || 'Fuel',
    };

    if (!budget.month || budget.amount <= 0) {
      showNotification('Month and budget amount are required.', 'error');
      return;
    }

    const existingIndex = state.budgets.findIndex((item) => item.id === budget.id);
    if (existingIndex > -1) {
      state.budgets[existingIndex] = budget;
    } else {
      state.budgets.push(budget);
    }

    saveState();
    refs.budgetForm.reset();
    closeModal(refs.budgetModal);
    renderAll();
    showNotification('Budget saved successfully.', 'success');
  });

  if (refs.reportApplyBtn) refs.reportApplyBtn.addEventListener('click', renderReportTable);
  if (refs.reportDownloadBtn) refs.reportDownloadBtn.addEventListener('click', downloadReportCsv);
  if (refs.vehicleSearch) refs.vehicleSearch.addEventListener('input', renderVehicleTable);
  if (refs.vehicleStatusFilter) refs.vehicleStatusFilter.addEventListener('change', renderVehicleTable);

  refs.assistantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = refs.assistantInput.value.trim();
    if (!prompt) return;

    appendChatMessage('user', prompt);
    refs.assistantInput.value = '';
    setAssistantLoading(true);

    try {
      const answer = await requestGpt5(prompt);
      appendChatMessage('bot', answer);
    } catch (error) {
      if (refs.assistantStatus) refs.assistantStatus.textContent = 'Local assistant · gateway unavailable';
      appendChatMessage('bot', assistantResponse(prompt));
    } finally {
      setAssistantLoading(false);
    }
  });

  document.querySelectorAll('.quick-question').forEach((button) => {
    button.addEventListener('click', () => {
      refs.assistantInput.value = button.textContent.trim();
      refs.assistantForm.requestSubmit();
    });
  });
}

async function requestGpt5(prompt) {
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: 'You are FuelIQ, a friendly and concise fleet assistant. Handle greetings and simple conversation naturally. For fleet questions, use only the supplied fleet context, state assumptions, and recommend practical next actions.' },
        { role: 'user', content: `${prompt}\n\nFleet context:\n${buildAssistantContext()}` },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI gateway returned ${response.status}`);
  const data = await response.json();
  const answer = data.answer || data.output_text || data.choices?.[0]?.message?.content;
  if (!answer) throw new Error('AI gateway returned no answer');
  if (refs.assistantStatus) refs.assistantStatus.textContent = 'GPT-5 connected';
  return answer;
}

function buildAssistantContext() {
  const summary = getDashboardSummary();
  const vehicles = state.vehicles.map((vehicle) => {
    const fuel = state.fuelLogs.filter((entry) => entry.vehicleId === vehicle.id);
    const litres = fuel.reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
    return `${vehicle.registration}: ${litres.toFixed(1)} L across ${fuel.length} fuel records`;
  });
  return [
    `Total fuel: ${summary.totalFuel.toFixed(1)} L`,
    `Total spend: ${formatCurrency(summary.totalSpend)}`,
    `Average economy: ${summary.avgEconomy.toFixed(2)} km/L`,
    `Vehicles: ${vehicles.join('; ') || 'No vehicles recorded'}`,
  ].join('\n');
}

function appendChatMessage(role, message) {
  if (!refs.assistantOutput) return;
  const label = role === 'user' ? 'You' : 'FuelIQ';
  refs.assistantOutput.insertAdjacentHTML('beforeend', `<div class="chat-message ${role}"><strong>${label}:</strong> ${escapeHtml(message)}</div>`);
  refs.assistantOutput.scrollTop = refs.assistantOutput.scrollHeight;
}

function setAssistantLoading(isLoading) {
  if (refs.assistantSubmit) {
    refs.assistantSubmit.disabled = isLoading;
    refs.assistantSubmit.textContent = isLoading ? 'Thinking...' : 'Ask';
  }
  if (isLoading && refs.assistantStatus) refs.assistantStatus.textContent = 'GPT-5 thinking...';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function switchSection(sectionId) {
  refs.sections.forEach((section) => {
    section.classList.toggle('active', section.id === sectionId);
  });

  refs.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.section === sectionId);
  });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
    };
  } catch (error) {
    console.error('Error loading state:', error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  const serializedState = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, serializedState);
  lastPersistedState = serializedState;
}

function ensureSampleData() {
  if (state.vehicles.length > 0 || state.fuelLogs.length > 0 || state.trips.length > 0 || state.drivers.length > 0) {
    return;
  }

  state.vehicles = [
    { id: 'veh-1', registration: 'UGA-234A', make: 'Toyota', model: 'Hiace', year: 2021, fuelType: 'Diesel', tankCapacity: 90, mileage: 128500, assignedDriver: 'Moses Kato', status: 'Active' },
    { id: 'veh-2', registration: 'UGA-678K', make: 'Isuzu', model: 'FRR', year: 2019, fuelType: 'Diesel', tankCapacity: 120, mileage: 246000, assignedDriver: 'Abdullah Nsubuga', status: 'Maintenance' },
    { id: 'veh-3', registration: 'UGA-119P', make: 'Mercedes', model: 'Sprinter', year: 2023, fuelType: 'Diesel', tankCapacity: 100, mileage: 76000, assignedDriver: 'Sarah Nakato', status: 'Active' },
    { id: 'veh-4', registration: 'UGA-907R', make: 'Nissan', model: 'Navara', year: 2020, fuelType: 'Petrol', tankCapacity: 80, mileage: 142200, assignedDriver: 'Joseph Kimu', status: 'Active' },
  ];

  state.drivers = [
    { id: 'drv-1', name: 'Moses Kato', contact: '+256 772 123 456', assignedVehicle: 'UGA-234A', status: 'Active' },
    { id: 'drv-2', name: 'Abdullah Nsubuga', contact: '+256 702 987 654', assignedVehicle: 'UGA-678K', status: 'On leave' },
    { id: 'drv-3', name: 'Sarah Nakato', contact: '+256 788 345 221', assignedVehicle: 'UGA-119P', status: 'Active' },
    { id: 'drv-4', name: 'Joseph Kimu', contact: '+256 750 231 909', assignedVehicle: 'UGA-907R', status: 'Active' },
  ];

  state.fuelLogs = [
    { id: 'log-1', date: '2026-01-15', vehicleId: 'veh-1', driverId: 'drv-1', station: 'Shell Lugogo', fuelType: 'Diesel', litres: 90, pricePerLitre: 3950, totalCost: 355500, odometer: 120800, distanceTravelled: 650, paymentMethod: 'Cash', notes: 'Route to Mukono and back' },
    { id: 'log-2', date: '2026-02-10', vehicleId: 'veh-1', driverId: 'drv-1', station: 'Total Kampala', fuelType: 'Diesel', litres: 110, pricePerLitre: 4050, totalCost: 445500, odometer: 121600, distanceTravelled: 800, paymentMethod: 'Card', notes: 'Long haul route' },
    { id: 'log-3', date: '2026-03-12', vehicleId: 'veh-2', driverId: 'drv-2', station: 'Petrol Station Ntinda', fuelType: 'Diesel', litres: 125, pricePerLitre: 4120, totalCost: 515000, odometer: 238700, distanceTravelled: 730, paymentMethod: 'Bank Transfer', notes: 'Heavier cargo schedule' },
    { id: 'log-4', date: '2026-04-18', vehicleId: 'veh-2', driverId: 'drv-2', station: 'Kobil Kasangati', fuelType: 'Diesel', litres: 145, pricePerLitre: 4180, totalCost: 606100, odometer: 239500, distanceTravelled: 800, paymentMethod: 'Cash', notes: 'Unusual fuel surge observed' },
    { id: 'log-5', date: '2026-05-06', vehicleId: 'veh-3', driverId: 'drv-3', station: 'Shell Kololo', fuelType: 'Diesel', litres: 80, pricePerLitre: 4025, totalCost: 322000, odometer: 77500, distanceTravelled: 640, paymentMethod: 'Card', notes: 'Urban deliveries' },
    { id: 'log-6', date: '2026-06-20', vehicleId: 'veh-4', driverId: 'drv-4', station: 'Petrol Station Wandegeya', fuelType: 'Petrol', litres: 55, pricePerLitre: 5200, totalCost: 286000, odometer: 140700, distanceTravelled: 500, paymentMethod: 'Cash', notes: 'Routine site visits' },
    { id: 'log-7', date: '2026-07-03', vehicleId: 'veh-3', driverId: 'drv-3', station: 'Total Entebbe Road', fuelType: 'Diesel', litres: 95, pricePerLitre: 4250, totalCost: 403750, odometer: 78280, distanceTravelled: 780, paymentMethod: 'Card', notes: 'Airport route' },
    { id: 'log-8', date: '2026-08-21', vehicleId: 'veh-4', driverId: 'drv-4', station: 'Shell Nakawa', fuelType: 'Petrol', litres: 60, pricePerLitre: 5350, totalCost: 321000, odometer: 141900, distanceTravelled: 550, paymentMethod: 'Mobile Money', notes: 'Quarterly review trip' },
    { id: 'log-9', date: '2026-09-08', vehicleId: 'veh-1', driverId: 'drv-1', station: 'Total Kampala', fuelType: 'Diesel', litres: 120, pricePerLitre: 4300, totalCost: 516000, odometer: 122900, distanceTravelled: 820, paymentMethod: 'Card', notes: 'Fuel efficiency monitoring' },
  ];

  state.trips = [
    { id: 'trip-1', vehicleId: 'veh-1', driverId: 'drv-1', startLocation: 'Kampala', destination: 'Mukono', date: '2026-02-04', distance: 45, purpose: 'Dispatch', fuelConsumed: 8, tripCost: 32000 },
    { id: 'trip-2', vehicleId: 'veh-2', driverId: 'drv-2', startLocation: 'Kawempe', destination: 'Jinja', date: '2026-04-22', distance: 120, purpose: 'Delivery', fuelConsumed: 25, tripCost: 98000 },
    { id: 'trip-3', vehicleId: 'veh-3', driverId: 'drv-3', startLocation: 'Entebbe', destination: 'Kampala', date: '2026-07-12', distance: 52, purpose: 'Airport transfer', fuelConsumed: 9, tripCost: 39000 },
    { id: 'trip-4', vehicleId: 'veh-4', driverId: 'drv-4', startLocation: 'Nakawa', destination: 'Mbarara', date: '2026-08-29', distance: 210, purpose: 'Field inspection', fuelConsumed: 28, tripCost: 150000 },
  ];

  state.budgets = [
    { id: 'budget-1', month: '2026-09', amount: 2000000, category: 'Fuel' },
    { id: 'budget-2', month: '2026-10', amount: 2200000, category: 'Fuel' },
  ];

  state.alerts = [
    { id: 'alert-1', title: 'High fuel consumption', message: 'UGA-678K used 18% more fuel than its recent average.', type: 'warning', read: false },
    { id: 'alert-2', title: 'Fuel price increase', message: 'Average diesel price increased by UGX 180/L this month.', type: 'info', read: true },
    { id: 'alert-3', title: 'Maintenance reminder', message: 'Vehicle UGA-678K should be checked for tyre pressure and engine health.', type: 'critical', read: false },
  ];

  saveState();
}

function applyTheme(themeName = 'midnight') {
  const validThemes = ['midnight', 'arctic', 'carbon', 'aurora'];
  const selectedTheme = validThemes.includes(themeName) ? themeName : 'midnight';
  state.settings.theme = selectedTheme;
  state.settings.darkMode = selectedTheme !== 'arctic';
  saveState();

  document.body.classList.remove('theme-midnight', 'theme-arctic', 'theme-carbon', 'theme-aurora');
  document.body.classList.add(`theme-${selectedTheme}`);

  refs.themeOptions.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === selectedTheme);
  });

  if (refs.themeToggle) refs.themeToggle.textContent = 'Theme';
}

function toggleLanding(showLanding) {
  if (refs.landingPage) refs.landingPage.classList.toggle('hidden', !showLanding);
  if (refs.appShell) refs.appShell.classList.toggle('hidden', showLanding);
}

function updateLandingView() {
  const shouldShowLanding = !state.settings.authenticated && (!window.location.hash || window.location.hash === '#');
  toggleLanding(shouldShowLanding);
}

window.addEventListener('hashchange', updateLandingView);

function renderAll() {
  renderSummaryCards();
  renderVehicleTable();
  renderFuelTable();
  renderTripTable();
  renderDriverTable();
  renderAlerts();
  renderAIInsights();
  renderBudgetSummary();
  renderCharts();
  renderReportTable();
  populateFilters();
  populateSelectControls();
}

function renderSummaryCards() {
  const totals = getDashboardSummary();

  refs.summaryCards.totalFuel.textContent = `${totals.totalFuel.toFixed(1)} L`;
  refs.summaryCards.totalSpend.textContent = formatCurrency(totals.totalSpend);
  refs.summaryCards.avgPrice.textContent = formatCurrency(totals.avgPrice, true);
  refs.summaryCards.avgEconomy.textContent = `${totals.avgEconomy.toFixed(2)} km/L`;
  refs.summaryCards.distance.textContent = `${totals.totalDistance.toLocaleString()} km`;
  refs.summaryCards.vehicles.textContent = state.vehicles.length;
  refs.summaryCards.drivers.textContent = state.drivers.length;
  refs.summaryCards.monthlySpend.textContent = formatCurrency(totals.monthlyFuelSpend);
  refs.summaryCards.nextMonth.textContent = formatCurrency(totals.predictedNextMonth);
}

function getDashboardSummary() {
  const totalFuel = state.fuelLogs.reduce((sum, item) => sum + Number(item.litres || 0), 0);
  const totalSpend = state.fuelLogs.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
  const avgPrice = state.fuelLogs.length ? totalSpend / state.fuelLogs.reduce((sum, item) => sum + Number(item.litres || 0), 0) : 0;
  const totalDistance = state.fuelLogs.reduce((sum, item) => sum + Number(item.distanceTravelled || 0), 0);
  const avgEconomy = totalFuel > 0 ? totalDistance / totalFuel : 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyFuelSpend = state.fuelLogs.filter((item) => item.date.startsWith(currentMonth)).reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
  const previousMonth = getPreviousMonthKey(currentMonth);
  const previousMonthSpend = state.fuelLogs.filter((item) => item.date.startsWith(previousMonth)).reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
  const forecastFactor = previousMonthSpend > 0 ? monthlyFuelSpend / previousMonthSpend : 1;
  const predictedNextMonth = Math.max(monthlyFuelSpend * forecastFactor, monthlyFuelSpend * 1.06);

  return { totalFuel, totalSpend, avgPrice, avgEconomy, totalDistance, totalVehicles: state.vehicles.length, monthlyFuelSpend, predictedNextMonth };
}

function renderVehicleTable() {
  if (!refs.vehicleTableBody) return;
  const query = refs.vehicleSearch ? refs.vehicleSearch.value.trim().toLowerCase() : '';
  const statusFilter = refs.vehicleStatusFilter ? refs.vehicleStatusFilter.value : 'All';

  const rows = state.vehicles.filter((vehicle) => {
    const matchesQuery = [vehicle.registration, vehicle.make, vehicle.model, vehicle.assignedDriver].join(' ').toLowerCase().includes(query);
    const matchesStatus = !statusFilter || statusFilter === 'All' || vehicle.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  refs.vehicleTableBody.innerHTML = rows.length
    ? rows.map((vehicle) => {
        const efficiency = calculateVehicleEfficiency(vehicle.id);
        return `
          <tr>
            <td>${vehicle.registration}</td>
            <td>${vehicle.make} ${vehicle.model}</td>
            <td>${vehicle.year}</td>
            <td>${vehicle.fuelType}</td>
            <td>${vehicle.mileage.toLocaleString()} km</td>
            <td>${vehicle.assignedDriver}</td>
            <td><span class="status-badge ${vehicle.status.toLowerCase().replace(/\s+/g, '-')}">${vehicle.status}</span></td>
            <td>${efficiency ? `${efficiency.toFixed(2)} km/L` : 'N/A'}</td>
            <td>
              <button class="tiny-btn secondary" data-edit-vehicle="${vehicle.id}">Edit</button>
              <button class="tiny-btn danger" data-delete-vehicle="${vehicle.id}">Delete</button>
            </td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="9" class="empty-row">No vehicles match the selected filters.</td></tr>';

  refs.vehicleTableBody.querySelectorAll('[data-delete-vehicle]').forEach((button) => {
    button.addEventListener('click', () => deleteVehicle(button.dataset.deleteVehicle));
  });

  refs.vehicleTableBody.querySelectorAll('[data-edit-vehicle]').forEach((button) => {
    button.addEventListener('click', () => editVehicle(button.dataset.editVehicle));
  });
}

function renderFuelTable() {
  if (!refs.fuelLogTableBody) return;
  refs.fuelLogTableBody.innerHTML = state.fuelLogs.length
    ? state.fuelLogs.slice().reverse().map((entry) => {
        const vehicle = getVehicleById(entry.vehicleId);
        const fuelDriver = getDriverById(entry.driverId);
        return `
          <tr>
            <td>${formatDate(entry.date)}</td>
            <td>${vehicle ? vehicle.registration : 'Unknown'}</td>
            <td>${fuelDriver ? fuelDriver.name : 'Unknown'}</td>
            <td>${entry.station}</td>
            <td>${entry.fuelType}</td>
            <td>${entry.litres.toFixed(1)} L</td>
            <td>${formatCurrency(Number(entry.pricePerLitre), true)}</td>
            <td>${formatCurrency(Number(entry.totalCost))}</td>
            <td>${entry.odometer.toLocaleString()} km</td>
            <td>
              <button class="tiny-btn secondary" data-edit-fuel="${entry.id}">Edit</button>
              <button class="tiny-btn danger" data-delete-fuel="${entry.id}">Delete</button>
            </td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="10" class="empty-row">No fuel records available.</td></tr>';

  refs.fuelLogTableBody.querySelectorAll('[data-delete-fuel]').forEach((button) => {
    button.addEventListener('click', () => deleteFuelLog(button.dataset.deleteFuel));
  });

  refs.fuelLogTableBody.querySelectorAll('[data-edit-fuel]').forEach((button) => {
    button.addEventListener('click', () => editFuelLog(button.dataset.editFuel));
  });
}

function renderTripTable() {
  if (!refs.tripTableBody) return;
  refs.tripTableBody.innerHTML = state.trips.length
    ? state.trips.slice().reverse().map((trip) => {
        const vehicle = getVehicleById(trip.vehicleId);
        const driver = getDriverById(trip.driverId);
        return `
          <tr>
            <td>${formatDate(trip.date)}</td>
            <td>${vehicle ? vehicle.registration : 'Unknown'}</td>
            <td>${driver ? driver.name : 'Unknown'}</td>
            <td>${trip.startLocation} → ${trip.destination}</td>
            <td>${trip.distance.toLocaleString()} km</td>
            <td>${trip.purpose}</td>
            <td>${trip.fuelConsumed.toFixed(1)} L</td>
            <td>${formatCurrency(trip.tripCost)}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="8" class="empty-row">No trips recorded yet.</td></tr>';
}

function renderDriverTable() {
  if (!refs.driverTableBody) return;
  refs.driverTableBody.innerHTML = state.drivers.length
    ? state.drivers.map((driver) => {
        const fuelUse = getDriverFuelUse(driver.id);
        const fuelSpend = getDriverFuelSpend(driver.id);
        const avgEfficiency = getDriverAverageEfficiency(driver.id);
        return `
          <tr>
            <td>${driver.name}</td>
            <td>${driver.contact}</td>
            <td>${driver.assignedVehicle || 'Unassigned'}</td>
            <td>${driver.status}</td>
            <td>${getTripsByDriver(driver.id).length}</td>
            <td>${fuelUse.toFixed(1)} L</td>
            <td>${formatCurrency(fuelSpend)}</td>
            <td>${avgEfficiency ? `${avgEfficiency.toFixed(2)} km/L` : 'N/A'}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="8" class="empty-row">No drivers available.</td></tr>';
}

function renderAlerts() {
  if (!refs.alertList) return;
  const alerts = getFuelAlerts();
  const highConsumptionAlerts = alerts.filter((alert) => alert.title.startsWith('High fuel consumption'));
  if (refs.sidebarAlertTitle) refs.sidebarAlertTitle.textContent = highConsumptionAlerts.length ? `${highConsumptionAlerts.length} fuel alert${highConsumptionAlerts.length === 1 ? '' : 's'}` : 'Fuel use is on track';
  if (refs.sidebarAlertText) refs.sidebarAlertText.textContent = highConsumptionAlerts[0]?.message || 'No vehicle is currently above its fuel-use baseline.';
  refs.alertList.innerHTML = alerts.length
    ? alerts.map((alert) => `
        <li class="alert-item ${alert.type} ${alert.read ? 'read' : ''}">
          <span class="alert-severity" aria-hidden="true"></span>
          <div class="alert-content">
            <div class="alert-heading">
              <strong>${alert.title}</strong>
              <span class="alert-time">${alert.meta || 'Fleet monitor'}</span>
            </div>
            <p>${alert.message}</p>
            ${alert.action ? `<small class="alert-action">Recommended: ${alert.action}</small>` : ''}
          </div>
          <button class="tiny-btn secondary" data-mark-alert="${alert.id}">${alert.read ? 'Reviewed' : 'Review'}</button>
        </li>
      `).join('')
    : '<li class="empty-row">No active alerts.</li>';

  refs.alertList.querySelectorAll('[data-mark-alert]').forEach((button) => {
    button.addEventListener('click', () => toggleAlertRead(button.dataset.markAlert));
  });
}

function getFuelAlerts() {
  const dynamicAlerts = state.vehicles.flatMap((vehicle) => {
    const records = state.fuelLogs
      .filter((entry) => entry.vehicleId === vehicle.id && Number(entry.litres) > 0 && Number(entry.distanceTravelled) > 0)
      .sort((first, second) => `${first.date} ${first.time || ''}`.localeCompare(`${second.date} ${second.time || ''}`));
    if (records.length < 2) return [];

    const latest = records.at(-1);
    const baselineRecords = records.slice(0, -1);
    const latestRate = Number(latest.litres) / Number(latest.distanceTravelled);
    const baselineRate = baselineRecords.reduce((sum, entry) => sum + Number(entry.litres) / Number(entry.distanceTravelled), 0) / baselineRecords.length;
    const deviation = baselineRate > 0 ? (latestRate - baselineRate) / baselineRate : 0;
    if (deviation < 0.05) return [];

    return [{
      id: `fuel-alert-${vehicle.id}`,
      title: `High fuel consumption: ${vehicle.registration}`,
      message: `The latest fuel record is ${formatPercentage(deviation)} above this vehicle's normal fuel use per kilometre.`,
      meta: formatDate(latest.date),
      action: 'Check idling, tyre pressure, route load, and engine condition.',
      type: deviation >= 0.15 ? 'critical' : 'warning',
      read: false,
    }];
  });

  const existingAlerts = state.alerts.filter((alert) => alert.id !== 'alert-1');
  return [...dynamicAlerts, ...existingAlerts];
}

function formatPercentage(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function renderAIInsights() {
  if (!refs.insightList || !refs.predictionCards) return;
  const insights = getAIInsights();
  refs.insightList.innerHTML = insights.map((item) => `
    <li>
      <span class="insight-badge">${item.type}</span>
      <p>${item.message}</p>
    </li>
  `).join('');

  const predictionCards = [
    { label: 'Next month forecast', value: formatCurrency(getDashboardSummary().predictedNextMonth) },
    { label: 'Expected litres', value: `${(getDashboardSummary().totalFuel * 1.12).toFixed(1)} L` },
    { label: 'Historical spend', value: formatCurrency(getDashboardSummary().totalSpend) },
    { label: 'Confidence', value: 'Medium' },
  ];

  refs.predictionCards.innerHTML = predictionCards.map((item) => `
    <div class="prediction-card">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join('');
}

function renderBudgetSummary() {
  if (!refs.budgetSummary || !refs.budgetList) return;
  const totalBudget = state.budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalSpend = getDashboardSummary().totalSpend;
  const remaining = totalBudget - totalSpend;
  const usedPct = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  refs.budgetSummary.innerHTML = `
    <div class="budget-metric"><span>Total budget</span><strong>${formatCurrency(totalBudget)}</strong></div>
    <div class="budget-metric"><span>Spent</span><strong>${formatCurrency(totalSpend)}</strong></div>
    <div class="budget-metric"><span>Remaining</span><strong>${formatCurrency(Math.max(remaining, 0))}</strong></div>
    <div class="budget-metric"><span>Used</span><strong>${usedPct.toFixed(1)}%</strong></div>
  `;

  refs.budgetList.innerHTML = state.budgets.length
    ? state.budgets.map((budget) => {
        const spent = getMonthlySpendForBudget(budget.month);
        const remainingAmount = budget.amount - spent;
        const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        return `
          <div class="budget-row">
            <div>
              <strong>${budget.month}</strong>
              <span>${budget.category}</span>
            </div>
            <div class="budget-values">
              <span>${formatCurrency(spent)} spent</span>
              <span>${formatCurrency(Math.max(remainingAmount, 0))} left</span>
            </div>
            <div class="progress-bar"><span style="width: ${Math.min(percent, 100)}%"></span></div>
          </div>
        `;
      }).join('')
    : '<div class="empty-row">No budgets created yet.</div>';
}

function renderCharts() {
  const monthlyData = getMonthlyFuelData();
  const expenditureData = getMonthlySpendData();
  const fuelPrices = getFuelPriceTrend();
  const efficiencyByVehicle = getVehicleEfficiencySummary();
  const distanceByMonth = getDistanceByMonth();
  const twoHourFuelData = getTwoHourFuelData();

  createOrUpdateChart('fuelConsumptionChart', 'line', {
    labels: monthlyData.labels,
    datasets: [{ label: 'Fuel consumed (L)', data: monthlyData.values, borderColor: '#3ea7ff', backgroundColor: 'rgba(62, 167, 255, 0.15)', fill: true, tension: 0.35 }],
  });

  createOrUpdateChart('twoHourFuelChart', 'bar', {
    labels: twoHourFuelData.labels,
    datasets: [{ label: 'Fuel used (L)', data: twoHourFuelData.values, backgroundColor: '#5ae0a7', borderRadius: 6 }],
  });

  createOrUpdateChart('fuelExpenditureChart', 'bar', {
    labels: expenditureData.labels,
    datasets: [{ label: 'Fuel spend (UGX)', data: expenditureData.values, backgroundColor: ['#60a5fa', '#3ea7ff', '#8b5cf6', '#f29d54', '#f472b6', '#6ad8ff', '#f59e0b', '#22d3ee'] }],
  });

  createOrUpdateChart('fuelPriceChart', 'line', {
    labels: fuelPrices.labels,
    datasets: [{ label: 'Average price per litre (UGX)', data: fuelPrices.values, borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.18)', fill: true, tension: 0.35 }],
  });

  createOrUpdateChart('efficiencyChart', 'bar', {
    labels: efficiencyByVehicle.labels,
    datasets: [{ label: 'Fuel efficiency (km/L)', data: efficiencyByVehicle.values, backgroundColor: '#38bdf8' }],
  });

  createOrUpdateChart('distanceChart', 'radar', {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{ label: 'Distance travelled (km)', data: distanceByMonth, backgroundColor: 'rgba(139, 92, 246, 0.18)', borderColor: '#8b5cf6', pointBackgroundColor: '#8b5cf6' }],
  });

  createOrUpdateChart('monthlySpendChart', 'doughnut', {
    labels: ['Fuel', 'Trips', 'Maintenance', 'Other'],
    datasets: [{ data: [getDashboardSummary().totalSpend, state.trips.reduce((sum, trip) => sum + trip.tripCost, 0), 260000, 120000], backgroundColor: ['#3ea7ff', '#6ad8ff', '#8b5cf6', '#f29d54'] }],
  });
}

function getTwoHourFuelData() {
  const byDay = new Map();

  state.fuelLogs.forEach((entry, index) => {
    const time = entry.time || `${String(8 + (index % 2)).padStart(2, '0')}:00`;
    if (!byDay.has(entry.date)) byDay.set(entry.date, []);
    byDay.get(entry.date).push({ time, litres: Number(entry.litres || 0) });
  });

  const labels = [];
  const values = [];
  [...byDay.entries()].sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate)).forEach(([date, entries]) => {
    entries.sort((first, second) => first.time.localeCompare(second.time)).slice(-2).forEach((entry) => {
      labels.push(`${formatDate(date)} ${entry.time}`);
      values.push(entry.litres);
    });
  });

  return { labels, values };
}

function createOrUpdateChart(chartId, type, config) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  if (chartConfigs[chartId]) chartConfigs[chartId].destroy();
  chartConfigs[chartId] = new Chart(canvas.getContext('2d'), {
    type,
    data: { labels: config.labels, datasets: config.datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#dfeaf7' } } },
      scales: type === 'doughnut' || type === 'radar' ? {} : {
        x: { ticks: { color: '#9bb3c8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
        y: { ticks: { color: '#9bb3c8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
      },
    },
  });
}

function renderReportTable() {
  if (!refs.reportRows) return;
  const rows = getFilteredReports();
  refs.reportRows.innerHTML = rows.length
    ? rows.map((row) => `
      <tr>
        <td>${formatDate(row.date)}</td>
        <td>${row.vehicle}</td>
        <td>${row.driver}</td>
        <td>${row.type}</td>
        <td>${row.station || '—'}</td>
        <td>${formatCurrency(row.amount)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="6" class="empty-row">No report data for the current filters.</td></tr>';
}

function getFilteredReports() {
  const vehicleFilter = refs.reportVehicleFilter.value;
  const driverFilter = refs.reportDriverFilter.value;
  const fuelTypeFilter = refs.reportFuelTypeFilter.value;
  const startDate = refs.reportStartDate.value;
  const endDate = refs.reportEndDate.value;

  return state.fuelLogs.filter((entry) => {
    const vehicle = getVehicleById(entry.vehicleId);
    const driver = getDriverById(entry.driverId);
    if (vehicleFilter && vehicleFilter !== 'All' && vehicle?.registration !== vehicleFilter) return false;
    if (driverFilter && driverFilter !== 'All' && driver?.name !== driverFilter) return false;
    if (fuelTypeFilter && fuelTypeFilter !== 'All' && entry.fuelType !== fuelTypeFilter) return false;
    if (startDate && entry.date < startDate) return false;
    if (endDate && entry.date > endDate) return false;
    return true;
  }).map((entry) => ({
    date: entry.date,
    vehicle: getVehicleById(entry.vehicleId)?.registration || 'Unknown',
    driver: getDriverById(entry.driverId)?.name || 'Unknown',
    type: entry.fuelType,
    station: entry.station,
    amount: Number(entry.totalCost || 0),
  }));
}

function populateFilters() {
  if (!refs.reportVehicleFilter || !refs.reportDriverFilter || !refs.reportFuelTypeFilter) return;
  const vehicles = state.vehicles;
  const drivers = state.drivers;
  const fuelTypes = [...new Set(state.fuelLogs.map((entry) => entry.fuelType))];

  refs.reportVehicleFilter.innerHTML = `<option value="All">All vehicles</option>${vehicles.map((vehicle) => `<option value="${vehicle.registration}">${vehicle.registration}</option>`).join('')}`;
  refs.reportDriverFilter.innerHTML = `<option value="All">All drivers</option>${drivers.map((driver) => `<option value="${driver.name}">${driver.name}</option>`).join('')}`;
  refs.reportFuelTypeFilter.innerHTML = `<option value="All">All fuels</option>${fuelTypes.map((type) => `<option value="${type}">${type}</option>`).join('')}`;
}

function populateSelectControls() {
  const vehicleOptions = state.vehicles.map((vehicle) => `<option value="${vehicle.id}">${vehicle.registration}</option>`).join('');
  const driverOptions = state.drivers.map((driver) => `<option value="${driver.id}">${driver.name}</option>`).join('');
  const vehicleRegistrationOptions = state.vehicles.map((vehicle) => `<option value="${vehicle.registration}">${vehicle.registration}</option>`).join('');

  const vehicleSelects = document.querySelectorAll('select[name="vehicleId"]');
  vehicleSelects.forEach((select) => {
    const selectedValue = select.value || '';
    select.innerHTML = `<option value="">Select vehicle</option>${vehicleOptions}`;
    if (selectedValue) select.value = selectedValue;
  });

  const driverSelects = document.querySelectorAll('select[name="driverId"]');
  driverSelects.forEach((select) => {
    const selectedValue = select.value || '';
    select.innerHTML = `<option value="">Select driver</option>${driverOptions}`;
    if (selectedValue) select.value = selectedValue;
  });

  const assignedVehicleSelects = document.querySelectorAll('select[name="assignedVehicle"]');
  assignedVehicleSelects.forEach((select) => {
    const selectedValue = select.value || '';
    select.innerHTML = `<option value="">Unassigned</option>${vehicleRegistrationOptions}`;
    if (selectedValue) select.value = selectedValue;
  });
}

function filterGlobalTables(keyword) {
  const rows = document.querySelectorAll('tbody tr');
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(keyword) ? '' : 'none';
  });
}

function deleteVehicle(id) {
  state.vehicles = state.vehicles.filter((vehicle) => vehicle.id !== id);
  state.fuelLogs = state.fuelLogs.filter((entry) => entry.vehicleId !== id);
  saveState();
  renderAll();
  showNotification('Vehicle deleted.', 'success');
}

function deleteFuelLog(id) {
  state.fuelLogs = state.fuelLogs.filter((entry) => entry.id !== id);
  saveState();
  renderAll();
  showNotification('Fuel record removed.', 'success');
}

function editVehicle(id) {
  const vehicle = state.vehicles.find((item) => item.id === id);
  if (!vehicle) return;
  refs.vehicleForm.querySelector('[name="id"]').value = vehicle.id;
  refs.vehicleForm.querySelector('[name="registration"]').value = vehicle.registration;
  refs.vehicleForm.querySelector('[name="make"]').value = vehicle.make;
  refs.vehicleForm.querySelector('[name="model"]').value = vehicle.model;
  refs.vehicleForm.querySelector('[name="year"]').value = vehicle.year;
  refs.vehicleForm.querySelector('[name="fuelType"]').value = vehicle.fuelType;
  refs.vehicleForm.querySelector('[name="tankCapacity"]').value = vehicle.tankCapacity;
  refs.vehicleForm.querySelector('[name="mileage"]').value = vehicle.mileage;
  refs.vehicleForm.querySelector('[name="assignedDriver"]').value = vehicle.assignedDriver;
  refs.vehicleForm.querySelector('[name="status"]').value = vehicle.status;
  openModal(refs.vehicleModal);
}

function editFuelLog(id) {
  const record = state.fuelLogs.find((entry) => entry.id === id);
  if (!record) return;
  refs.fuelForm.querySelector('[name="id"]').value = record.id;
  refs.fuelForm.querySelector('[name="date"]').value = record.date;
  refs.fuelForm.querySelector('[name="vehicleId"]').value = record.vehicleId;
  refs.fuelForm.querySelector('[name="driverId"]').value = record.driverId;
  refs.fuelForm.querySelector('[name="station"]').value = record.station;
  refs.fuelForm.querySelector('[name="fuelType"]').value = record.fuelType;
  refs.fuelForm.querySelector('[name="litres"]').value = record.litres;
  refs.fuelForm.querySelector('[name="pricePerLitre"]').value = record.pricePerLitre;
  refs.fuelForm.querySelector('[name="odometer"]').value = record.odometer;
  refs.fuelForm.querySelector('[name="distance"]').value = record.distanceTravelled;
  refs.fuelForm.querySelector('[name="paymentMethod"]').value = record.paymentMethod;
  refs.fuelForm.querySelector('[name="notes"]').value = record.notes;
  openModal(refs.fuelModal);
}

function toggleAlertRead(id) {
  const alert = state.alerts.find((item) => item.id === id);
  if (!alert) return;
  alert.read = !alert.read;
  saveState();
  renderAlerts();
}

function formatCurrency(value, perUnit = false) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: perUnit ? 0 : 2 }).format(number);
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getVehicleById(id) {
  return state.vehicles.find((vehicle) => vehicle.id === id);
}

function getDriverById(id) {
  return state.drivers.find((driver) => driver.id === id);
}

function calculateVehicleEfficiency(vehicleId) {
  const records = state.fuelLogs.filter((entry) => entry.vehicleId === vehicleId && Number(entry.distanceTravelled) > 0 && Number(entry.litres) > 0);
  if (!records.length) return 0;
  const totalDistance = records.reduce((sum, entry) => sum + Number(entry.distanceTravelled || 0), 0);
  const totalFuel = records.reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
  return totalFuel ? totalDistance / totalFuel : 0;
}

function getDriverFuelUse(driverId) {
  return state.fuelLogs.filter((entry) => entry.driverId === driverId).reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
}

function getDriverFuelSpend(driverId) {
  return state.fuelLogs.filter((entry) => entry.driverId === driverId).reduce((sum, entry) => sum + Number(entry.totalCost || 0), 0);
}

function getDriverAverageEfficiency(driverId) {
  const records = state.fuelLogs.filter((entry) => entry.driverId === driverId && Number(entry.distanceTravelled) > 0 && Number(entry.litres) > 0);
  if (!records.length) return 0;
  const totalDistance = records.reduce((sum, entry) => sum + Number(entry.distanceTravelled || 0), 0);
  const totalFuel = records.reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
  return totalFuel ? totalDistance / totalFuel : 0;
}

function getTripsByDriver(driverId) {
  return state.trips.filter((trip) => trip.driverId === driverId);
}

function getMonthlyFuelData() {
  const currentYear = new Date().getFullYear();
  return {
    labels: monthLabels,
    values: monthLabels.map((_, index) => {
      const monthNumber = String(index + 1).padStart(2, '0');
      return state.fuelLogs.filter((entry) => entry.date.startsWith(`${currentYear}-${monthNumber}`)).reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
    }),
  };
}

function getMonthlySpendData() {
  const currentYear = new Date().getFullYear();
  return {
    labels: monthLabels,
    values: monthLabels.map((_, index) => {
      const monthNumber = String(index + 1).padStart(2, '0');
      return state.fuelLogs.filter((entry) => entry.date.startsWith(`${currentYear}-${monthNumber}`)).reduce((sum, entry) => sum + Number(entry.totalCost || 0), 0);
    }),
  };
}

function getFuelPriceTrend() {
  const months = [...new Set(state.fuelLogs.map((entry) => entry.date.slice(0, 7)))];
  return {
    labels: months.length ? months.map((month) => month.slice(5)) : ['Jan'],
    values: months.length ? months.map((month) => {
      const entries = state.fuelLogs.filter((entry) => entry.date.startsWith(month));
      return entries.reduce((sum, entry) => sum + Number(entry.pricePerLitre || 0), 0) / (entries.length || 1);
    }) : [0],
  };
}

function getVehicleEfficiencySummary() {
  return {
    labels: state.vehicles.map((vehicle) => vehicle.registration),
    values: state.vehicles.map((vehicle) => calculateVehicleEfficiency(vehicle.id)),
  };
}

function getDistanceByMonth() {
  return Array.from({ length: 9 }, (_, index) => index + 1).map((monthIndex) => {
    const monthLabel = String(monthIndex).padStart(2, '0');
    return state.fuelLogs.filter((entry) => entry.date.includes(`2026-${monthLabel}`)).reduce((sum, entry) => sum + Number(entry.distanceTravelled || 0), 0);
  });
}

function getAIInsights() {
  const insights = [];
  const topFuelVehicle = [...state.vehicles].map((vehicle) => ({ ...vehicle, litres: state.fuelLogs.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + Number(entry.litres || 0), 0) })).sort((a, b) => b.litres - a.litres)[0];
  if (topFuelVehicle) insights.push({ type: 'Consumption', message: `${topFuelVehicle.registration} used ${topFuelVehicle.litres.toFixed(1)} L this period, which is above the typical fleet average. Review route planning and idling behaviour for this vehicle.` });

  const expensiveVehicle = [...state.vehicles].map((vehicle) => ({ ...vehicle, spend: state.fuelLogs.filter((entry) => entry.vehicleId === vehicle.id).reduce((sum, entry) => sum + Number(entry.totalCost || 0), 0) })).sort((a, b) => b.spend - a.spend)[0];
  if (expensiveVehicle) insights.push({ type: 'Cost', message: `${expensiveVehicle.registration} recorded the highest operating cost this cycle. Check payload weight, route distance, and maintenance issues.` });

  const weakestEfficiency = [...state.vehicles].map((vehicle) => ({ ...vehicle, efficiency: calculateVehicleEfficiency(vehicle.id) })).sort((a, b) => a.efficiency - b.efficiency)[0];
  if (weakestEfficiency) insights.push({ type: 'Efficiency', message: `${weakestEfficiency.registration} is the least efficient vehicle at ${weakestEfficiency.efficiency.toFixed(2)} km/L. Consider tyre pressure, engine tuning, or driver coaching.` });

  insights.push({ type: 'Trend', message: 'Average fuel price has risen over the last two reporting periods. Review station selection and route optimisation to reduce cost exposure.' });
  return insights.slice(0, 4);
}

function getMonthlySpendForBudget(monthKey) {
  return state.fuelLogs.filter((entry) => entry.date.startsWith(monthKey)).reduce((sum, entry) => sum + Number(entry.totalCost || 0), 0);
}

function getPreviousMonthKey(currentMonthKey) {
  const [year, month] = currentMonthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function validateVehicle(vehicle) {
  if (!vehicle.registration || !vehicle.make || !vehicle.model || !vehicle.assignedDriver) return { valid: false, message: 'All required vehicle fields must be filled in.' };
  if (vehicle.year < 1990 || vehicle.year > new Date().getFullYear() + 1) return { valid: false, message: 'Please enter a realistic vehicle year.' };
  if (vehicle.mileage < 0 || vehicle.tankCapacity <= 0) return { valid: false, message: 'Tank capacity and mileage should be positive values.' };
  return { valid: true };
}

function validateFuelRecord(record) {
  if (!record.date || !record.vehicleId || !record.driverId || !record.station || !record.fuelType) return { valid: false, message: 'Date, vehicle, driver, fuel station, and fuel type are required.' };
  if (record.litres <= 0 || record.pricePerLitre <= 0) return { valid: false, message: 'Litres and fuel price must be greater than zero.' };
  if (record.odometer < 0 || record.distanceTravelled < 0) return { valid: false, message: 'Odometer and distance cannot be negative.' };
  return { valid: true };
}

function showNotification(message, type = 'info') {
  const container = document.getElementById('notification');
  if (!container) return;
  container.textContent = message;
  container.className = `notification ${type}`;
  container.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => container.classList.remove('show'), 3000);
}

function openModal(modal) {
  if (!modal) return;
  if (modal === refs.fuelModal && refs.fuelForm && !refs.fuelForm.elements.id.value) {
    const now = new Date();
    refs.fuelForm.elements.date.value = now.toISOString().slice(0, 10);
    refs.fuelForm.elements.time.value = now.toTimeString().slice(0, 5);
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((modal) => closeModal(modal));
}

function downloadReportCsv() {
  const rows = getFilteredReports();
  if (!rows.length) {
    showNotification('No rows available to export.', 'error');
    return;
  }

  const headers = ['Date', 'Vehicle', 'Driver', 'Fuel Type', 'Station', 'Amount'];
  const csv = [headers.join(',')].concat(rows.map((row) => [row.date, row.vehicle, row.driver, row.type, row.station, row.amount].join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'fueliq-report.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function assistantResponse(prompt) {
  const lower = prompt.toLowerCase();
  const normalized = lower.replace(/[!?.,]/g, '').trim();

  if (/^(hi|hello|hey|hey there|good morning|good afternoon|good evening)$/.test(normalized)) {
    return 'Hi! I’m FuelIQ. How can I help you with your fleet today?';
  }

  if (normalized.includes('how are you')) {
    return 'I’m doing well and ready to help you review your fleet data.';
  }

  if (normalized === 'thanks' || normalized === 'thank you' || normalized === 'thank you so much') {
    return 'You’re welcome. I’m here whenever you need help.';
  }

  if (normalized === 'who are you' || normalized === 'what can you do') {
    return 'I’m FuelIQ, your fleet assistant. I can explain fuel use, costs, efficiency, alerts, and practical ways to reduce waste.';
  }

  if (normalized === 'help' || normalized === 'what can i ask') {
    return 'You can ask me about fuel costs, the most fuel-heavy vehicle, efficiency, alerts, monthly trends, or ways to reduce fuel waste.';
  }

  if (lower.includes('most fuel')) {
    const vehicle = [...state.vehicles].map((item) => ({ ...item, litres: state.fuelLogs.filter((entry) => entry.vehicleId === item.id).reduce((sum, entry) => sum + Number(entry.litres || 0), 0) })).sort((a, b) => b.litres - a.litres)[0];
    return `${vehicle.registration} is currently using the most fuel, with ${vehicle.litres.toFixed(1)} L in the current dataset. Consider checking route choices and maintenance.`;
  }

  if (lower.includes('spent on fuel this month')) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const spend = state.fuelLogs.filter((entry) => entry.date.startsWith(currentMonth)).reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
    return `This month, the fleet has spent ${formatCurrency(spend)} on fuel.`;
  }

  if (lower.includes('most efficient')) {
    const vehicle = [...state.vehicles].map((item) => ({ ...item, efficiency: calculateVehicleEfficiency(item.id) })).sort((a, b) => b.efficiency - a.efficiency)[0];
    return `${vehicle.registration} is the most efficient at ${vehicle.efficiency.toFixed(2)} km/L in the current data.`;
  }

  if (lower.includes('why did fuel costs increase')) {
    const avgPrice = state.fuelLogs.reduce((sum, item) => sum + Number(item.pricePerLitre || 0), 0) / Math.max(state.fuelLogs.length, 1);
    const recentAvg = state.fuelLogs.slice(-3).reduce((sum, item) => sum + Number(item.pricePerLitre || 0), 0) / 3;
    return `Fuel costs increased because the recent average price is ${formatCurrency(recentAvg, true)}, compared with a broader fleet average of ${formatCurrency(avgPrice, true)}. This matches higher station prices and a recent cost spike.`;
  }

  if (lower.includes('investigate')) {
    const badVehicle = [...state.vehicles].map((item) => ({ ...item, efficiency: calculateVehicleEfficiency(item.id) })).sort((a, b) => a.efficiency - b.efficiency)[0];
    return `The first vehicle to investigate is ${badVehicle.registration}. Its efficiency is low and it has been showing unusually high fuel usage. Check tyre pressure, engine condition, and route patterns.`;
  }

  if (lower.includes('reduce fuel costs')) {
    return 'To reduce costs, consolidate routes, avoid unnecessary idling, compare fuel stations, and review driver behaviour for inefficient trips.';
  }

  if (lower.includes('compare this month') && lower.includes('last month')) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const previousMonth = getPreviousMonthKey(currentMonth);
    const current = state.fuelLogs.filter((entry) => entry.date.startsWith(currentMonth)).reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
    const previous = state.fuelLogs.filter((entry) => entry.date.startsWith(previousMonth)).reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
    const delta = current - previous;
    return `This month’s spending is ${formatCurrency(current)} compared to ${formatCurrency(previous)} last month, a difference of ${formatCurrency(delta)}.`;
  }

  return 'FuelIQ can help with questions about fuel use, costs, driver efficiency, and vehicle anomalies. Try asking about the most fuel-heavy vehicle, this month’s spend, or the least efficient unit.';
}

function showSamplePrompt() {
  if (!refs.assistantOutput) return;
  refs.assistantOutput.innerHTML = '<div class="chat-message bot">FuelIQ: I can help analyse fleet fuel use, cost trends, and vehicle performance. Ask a question to begin.</div>';
}

showSamplePrompt();
