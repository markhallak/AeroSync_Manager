const {
    createClient
} = supabase
const _supabase = createClient('https://pfwnyxmmxgydkohyqrto.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmd255eG1teGd5ZGtvaHlxcnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk3MTg5NjMsImV4cCI6MjAxNTI5NDk2M30.v--PqHL9B8GMFNNW-bp-mMcr7p30V_5hKXVUSRTBGxA');

let flightData = [];

async function getFlightData() {
    setLoadingState();

    let {
        data,
        error
    } = await _supabase
        .from('Flight')
        .select();

    if (error) {
        console.error("Error fetching data", error);
    } else {
        flightData = data;
        filterFlights();
    }

    removeLoadingState();
}

async function subscribeToChannel() {
    _supabase
        .channel('room1')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'Flight'
        }, async () => {
            await getFlightData();
            filterFlights();
        })
        .subscribe();
}

const statusColors = {
    "Scheduled": "#ed5ea1",
    "OnTime": "#e2bb1c",
    "Delayed": "#11b2ae",
    "Canceled": "#FF0000",
    "Boarding": "#ba9dbe",
    "Landed": "#fd1f4f",
    "Arrived": "#bbc248"
};

document.addEventListener('DOMContentLoaded', async () => {
    await initFlightInfoApp();
    subscribeToChannel();
});

function getURLParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('search') || '',
        type: params.get('type') || 'Arrival'
    };
}

async function initFlightInfoApp() {
    populateDropdowns();
    await getFlightData();

    const urlParams = getURLParameters();

    if (urlParams.search) {
        document.getElementById('flight-search-input').value = urlParams.search;
    }
    if (urlParams.type === 'Departure') {
        toggleFlightType(); // Make sure this function can toggle to 'Departure' if it's not already
    }

    filterFlights();
    attachEventListeners();
}

function populateDropdowns() {
    const dateDropdown = document.getElementById('scheduled-day');
    const timeDropdown = document.getElementById('scheduled-time');
    dateDropdown.innerHTML = ['Any Day', 'Today', 'Tomorrow', 'Day after tomorrow'].map(option => `<option value="${option}">${option}</option>`).join('');
    timeDropdown.innerHTML = ['Any time', '00:00-01:59', '02:00-03:59', '04:00-05:59', '06:00-07:59', '08:00-09:59', '10:00-11:59', '12:00-13:59', '14:00-15:59', '16:00-17:59', '18:00-19:59', '20:00-21:59', '22:00-23:59'].map(option => `<option value="${option}">${option}</option>`).join('');
}

function attachEventListeners() {
    document.getElementById('flight-search-input').addEventListener('input', filterFlights);
    document.getElementById('scheduled-day').addEventListener('change', filterFlights);
    document.getElementById('scheduled-time').addEventListener('change', filterFlights);
    document.getElementById('flight-type-toggle').addEventListener('click', () => {
        toggleFlightType();
    });
}

function filterFlights() {
    const searchInputValue = document.getElementById('flight-search-input').value.toLowerCase();
    const selectedDate = document.getElementById('scheduled-day').value;
    const selectedTimeRange = document.getElementById('scheduled-time').value;
    const isDeparture = isDepartureSelected();

    const getSelectedDateValue = (selectedOption) => {
        const today = new Date();
        switch (selectedOption) {
            case "Today":
                return today.toISOString().split('T')[0];
            case "Tomorrow":
                return new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
            case "Day after tomorrow":
                return new Date(today.setDate(today.getDate() + 2)).toISOString().split('T')[0];
            default:
                return selectedOption;
        }
    };

    const filteredFlights = flightData.filter(flight => {
        const searchMatches = flight.flight_number.toLowerCase().includes(searchInputValue) ||
                              (flight.origin_location && flight.origin_location.toLowerCase().includes(searchInputValue)) ||
                              (flight.destination_location && flight.destination_location.toLowerCase().includes(searchInputValue))
                              || (flight.airline_name && flight.airline_name.toLowerCase().includes(searchInputValue));
        const dateMatches = selectedDate === "Any Day" || flight.scheduled_day === getSelectedDateValue(selectedDate);
        const timeMatches = selectedTimeRange === "Any time" || (flight.scheduled_time >= selectedTimeRange.split('-')[0] && flight.scheduled_time <= selectedTimeRange.split('-')[1]);

        return searchMatches && (dateMatches && timeMatches) && (flight.isArriving !== isDeparture);
    });

    displayFilteredFlights(filteredFlights);
}

function displayFilteredFlights(flights) {
    const searchResultsSection = document.getElementById('search-results');
    searchResultsSection.innerHTML = '';
    flights.forEach(flight => {
        searchResultsSection.appendChild(createFlightCard(flight, isDepartureSelected() ? 'departures' : 'arrivals'));
    });
}

function isDepartureSelected() {
    return document.getElementById('flight-type-toggle').classList.contains('toggle-switch-on');
}

function toggleFlightType() {
    const toggleSwitch = document.getElementById('flight-type-toggle');
    toggleSwitch.classList.toggle('toggle-switch-on');
    updateHeader(isDepartureSelected());
    setLoadingState();
    setTimeout(() => {
        filterFlights();
        removeLoadingState();
    }, 500);
}

function updateHeader(isDeparture) {
    const header = document.querySelector('h2');
    const subheader = document.querySelector('p');
    header.textContent = isDeparture ? 'PASSENGER DEPARTURES' : 'PASSENGER ARRIVALS';
    subheader.textContent = isDeparture ? 'Keep track of departing passenger flights with live updates.' : 'Keep track of arriving passenger flights with live updates.';
}

function setLoadingState() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function removeLoadingState() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function loadFlights(filteredFlights, flightType) {
    const searchResultsSection = document.getElementById('search-results');
    searchResultsSection.innerHTML = '';

    filteredFlights.forEach(flight => {
        searchResultsSection.appendChild(createFlightCard(flight, flightType));
    });
}

function getFilteredFlights(isArriving) {
    return flightData.filter(flight => flight.isArriving === isArriving);
}

function createFlightCard(flight, flightType) {
    const flightInfo = document.createElement('div');
    flightInfo.className = 'flight-info';
    flightInfo.setAttribute('data-flight-id', flight.id);
    flightInfo.setAttribute('data-flight-number', flight.flight_number);

    flightInfo.appendChild(createFlagElement(flight.image_name));
    flightInfo.appendChild(createStatusBanner(flight.status));
    flightInfo.appendChild(createFlightInfoColumn(flight, flightType, 'left'));
    flightInfo.appendChild(createFlightInfoColumn(flight, flightType, 'right'));

    return flightInfo;
}

function createFlagElement(imageName) {
    const flag = document.createElement('div');
    flag.className = 'flag';
    flag.style.backgroundImage = `url('../static/images/${imageName}')`;
    return flag;
}

function createStatusBanner(status) {
    const statusBanner = document.createElement('div');
    statusBanner.className = 'status-banner';
    statusBanner.style.backgroundColor = statusColors[status] || '#777';
    statusBanner.textContent = status;
    return statusBanner;
}

function createFlightInfoColumn(flight, flightType, columnType) {
    const column = document.createElement('div');
    column.className = `flight-info-${columnType}`;

    if (columnType === 'left') {
        const header = document.createElement('div');
        header.className = 'flight-header';
        const locationText = flightType === 'arrivals' ?
            `From: ${flight.origin_location || 'N/A'}` :
            `To: ${flight.destination_location || 'N/A'}`;
        header.textContent = locationText;
        column.appendChild(header);

        const flightCodeAndAirline = document.createElement('p');
        flightCodeAndAirline.textContent = `${flight.flight_number} - ${flight.airline_name}`;
        column.appendChild(flightCodeAndAirline);

        const schedule = document.createElement('p');
        schedule.textContent = `${flight.scheduled_day} ${flight.scheduled_time}`;
        column.appendChild(schedule);
    } else {
        const terminalOrGate = document.createElement('p');
        terminalOrGate.textContent = flightType === 'arrivals' ? `${flight.terminal_name}` : `${flight.gate_name}`;
        column.appendChild(terminalOrGate);

        if (flightType === 'departures') {
            const checkIn = document.createElement('p');
            checkIn.textContent = `Check-in: ${flight.check_in_row}`;
            column.appendChild(checkIn);
        }

        const inFlightButton = document.createElement('button');
        inFlightButton.className = 'in-flight-button';
        inFlightButton.textContent = 'In-Flight Details';
        inFlightButton.addEventListener('click', () => showInFlightDetails(flight.id));
        column.appendChild(inFlightButton);
    }

    return column;
}

function showInFlightDetails(flightId) {
    const numericFlightId = Number(flightId);
    const flight = flightData.find(f => f.id === numericFlightId);

    const lightbox = document.getElementById('lightbox');
    const inFlightDetails = document.getElementById('in-flight-details');

    inFlightDetails.innerHTML = `
        <p>Airline: ${flight.airline_name}</p>
        <p>Entertainment: ${flight.inflight_entertainment_option.join(', ')}</p>
        <p>Meals: ${flight.meal_service.join(', ')}</p>
    `;

    lightbox.style.display = 'flex';

    document.getElementById("track-btn").addEventListener('click', () => {
        const postData = {
            "flightID": flight.id,
            "flightNumber": flight.flight_number
        };

        fetch('/trackFlight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            }).then(response => {
                if (response.status === 203) {
                    closeLightbox();
                } else if (response.status === 411) {
                    console.error("Cannot Track Flight");
                }
            })
            .catch(error => {
                if (!navigator.onLine) {
                    console.error('No internet connection');
                } else {
                    console.error('Fetch error:', error);
                }
            });
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}