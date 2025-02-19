// Emission factors (kg CO2 per unit)
const emissionFactors = {
    transport: {
        car: 0.2, 
        bus: 0.08, 
        train: 0.04, 
        plane: 0.25, 
    },
    household: {
        electricity: 0.5, 
        gas: 0.2, 
        water: 0.001, 
    },
    food: {
        meat: 13.3, 
        dairy: 3.2,
        vegetables: 0.4, 
        processed: 2.5, 
    },
    shopping: {
        clothing: 0.01, 
        electronics: 0.02, 
        furniture: 0.015, 
    }
};

// State management
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let totalEmissions = 0;

// DOM Elements
const categorySelect = document.getElementById('category');
const activityForm = document.getElementById('activity-form');
const activitiesList = document.getElementById('activities');
const emissionsValue = document.querySelector('.emissions-value');

// Option containers
const optionContainers = {
    transport: document.getElementById('transport-options'),
    household: document.getElementById('household-options'),
    food: document.getElementById('food-options'),
    shopping: document.getElementById('shopping-options')
};

// Initialize Chart.js
let emissionsChart;
function initializeChart() {
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    emissionsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transport', 'Household', 'Food', 'Shopping'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#e74c3c',
                    '#f1c40f'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Show relevant options based on category
categorySelect.addEventListener('change', () => {
    // Hide all option containers
    Object.values(optionContainers).forEach(container => {
        container.style.display = 'none';
    });

    // Show selected category options
    const selectedCategory = categorySelect.value;
    if (selectedCategory && optionContainers[selectedCategory]) {
        optionContainers[selectedCategory].style.display = 'block';
    }
});

// Calculate emissions based on activity type and amount
function calculateEmissions(category, type, amount) {
    const factor = emissionFactors[category][type];
    return factor * amount;
}

// Calculate category totals
function calculateCategoryTotals() {
    const totals = {
        transport: 0,
        household: 0,
        food: 0,
        shopping: 0
    };

    activities.forEach(activity => {
        totals[activity.category] += activity.emissions;
    });

    return totals;
}

// Update summary cards
function updateSummaryCards(totals) {
    Object.keys(totals).forEach(category => {
        const summaryElement = document.getElementById(`${category}-summary`);
        if (summaryElement) {
            summaryElement.querySelector('.summary-value').textContent = 
                `${totals[category].toFixed(2)} kg`;
        }
    });
}

// Update chart
function updateChart(totals) {
    emissionsChart.data.datasets[0].data = [
        totals.transport,
        totals.household,
        totals.food,
        totals.shopping
    ];
    emissionsChart.update();
}

// Add new activity
activityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = categorySelect.value;
    let type, amount;

    switch (category) {
        case 'transport':
            type = document.getElementById('transport-type').value;
            amount = parseFloat(document.getElementById('transport-distance').value);
            break;
        case 'household':
            type = document.getElementById('energy-type').value;
            amount = parseFloat(document.getElementById('energy-amount').value);
            break;
        case 'food':
            type = document.getElementById('food-type').value;
            amount = parseFloat(document.getElementById('food-amount').value);
            break;
        case 'shopping':
            type = document.getElementById('item-type').value;
            amount = parseFloat(document.getElementById('item-amount').value);
            break;
    }

    if (!category || !type || !amount) {
        alert('Please fill in all fields');
        return;
    }

    const emissions = calculateEmissions(category, type, amount);
    const activity = {
        id: Date.now(),
        category,
        type,
        amount,
        emissions,
        date: new Date().toISOString()
    };

    activities.push(activity);
    localStorage.setItem('activities', JSON.stringify(activities));
    updateDisplay();
    activityForm.reset();
    
    // Hide all option containers
    Object.values(optionContainers).forEach(container => {
        container.style.display = 'none';
    });
});

// Delete activity
function deleteActivity(id) {
    activities = activities.filter(activity => activity.id !== id);
    localStorage.setItem('activities', JSON.stringify(activities));
    updateDisplay();
}

// Update display
function updateDisplay() {
    // Update total emissions
    totalEmissions = activities.reduce((total, activity) => total + activity.emissions, 0);
    emissionsValue.textContent = `${totalEmissions.toFixed(2)} kg`;

    // Calculate and update category totals
    const categoryTotals = calculateCategoryTotals();
    updateSummaryCards(categoryTotals);
    updateChart(categoryTotals);

    // Update activities list
    activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-category">${activity.category} - ${activity.type}</div>
                <div class="activity-details">
                    Amount: ${activity.amount} ${getUnit(activity.category)} | 
                    Date: ${new Date(activity.date).toLocaleDateString()}
                </div>
            </div>
            <span class="activity-emissions">${activity.emissions.toFixed(2)} kg CO₂</span>
            <button class="delete-btn" onclick="deleteActivity(${activity.id})">×</button>
        </div>
    `).join('');
}

// Get unit based on category
function getUnit(category) {
    switch (category) {
        case 'transport':
            return 'km';
        case 'household':
            return 'kWh';
        case 'food':
            return 'kg';
        case 'shopping':
            return '$';
        default:
            return '';
    }
}

// Initialize chart and display
initializeChart();
updateDisplay();