let raceEvents = [];

const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' });
const prettyDate = new Intl.DateTimeFormat('nl-NL', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const searchInput = document.querySelector('#search');
const typeFilter = document.querySelector('#typeFilter');
const countryFilter = document.querySelector('#countryFilter');
const eventsContainer = document.querySelector('#events');
const monthContainer = document.querySelector('#calendar');
const cardTemplate = document.querySelector('#eventCardTemplate');

const uniqueValues = (key) =>
  [...new Set(raceEvents.map((event) => event[key]))].sort((a, b) => a.localeCompare(b, 'nl'));

function fillSelect(select, values) {
  select.innerHTML = select.id === 'typeFilter'
    ? '<option value="all">Alle types</option>'
    : '<option value="all">Alle landen</option>';

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function isUpcoming(eventDate) {
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return new Date(eventDate) >= midnight;
}

function filterEvents() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const selectedCountry = countryFilter.value;

  return raceEvents
    .filter((event) => isUpcoming(event.date))
    .filter((event) => (selectedType === 'all' ? true : event.type === selectedType))
    .filter((event) => (selectedCountry === 'all' ? true : event.country === selectedCountry))
    .filter((event) => {
      if (!query) return true;
      return [event.name, event.city, event.country, event.type]
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderMonthOverview(events) {
  const monthCounts = events.reduce((acc, event) => {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!acc[key]) {
      acc[key] = { month: monthName.format(date), year: date.getFullYear(), count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  monthContainer.innerHTML = '';
  Object.values(monthCounts).forEach((item) => {
    const chip = document.createElement('article');
    chip.className = 'month-chip';
    chip.innerHTML = `<span>${item.month} ${item.year}</span><strong>${item.count} event${item.count > 1 ? 's' : ''}</strong>`;
    monthContainer.append(chip);
  });
}

function renderEvents(events) {
  eventsContainer.innerHTML = '';

  if (!events.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Geen aankomende races gevonden met deze filters.';
    eventsContainer.append(empty);
    return;
  }

  events.forEach((event) => {
    const node = cardTemplate.content.firstElementChild.cloneNode(true);
    const date = new Date(event.date);

    node.querySelector('.event-date').innerHTML = `<span>${date.getDate()}</span><small>${monthName
      .format(date)
      .slice(0, 3)}</small>`;
    node.querySelector('h3').textContent = event.name;
    node.querySelector('.event-meta').textContent = `${prettyDate.format(date)} • ${event.city}, ${event.country} • ${event.type}`;
    node.querySelector('.event-description').textContent = event.description;
    const link = node.querySelector('a');
    link.href = event.link;
    eventsContainer.append(node);
  });
}

function render() {
  const filteredEvents = filterEvents();
  renderMonthOverview(filteredEvents);
  renderEvents(filteredEvents);
}

function showLoadError() {
  monthContainer.innerHTML = '';
  eventsContainer.innerHTML = '';
  const errorState = document.createElement('div');
  errorState.className = 'empty-state';
  errorState.textContent = 'Kon events niet ophalen vanaf de server. Probeer het later opnieuw.';
  eventsContainer.append(errorState);
}

async function init() {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) {
      throw new Error('Request failed');
    }

    raceEvents = await response.json();

    fillSelect(typeFilter, uniqueValues('type'));
    fillSelect(countryFilter, uniqueValues('country'));

    render();
  } catch (error) {
    showLoadError();
  }
}

[searchInput, typeFilter, countryFilter].forEach((element) => {
  element.addEventListener('input', render);
  element.addEventListener('change', render);
});

init();
