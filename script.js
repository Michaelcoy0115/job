let currentPage = 1;
const itemsPerPage = 10;
let jobs = [];
let locations = ["A1", "A2", "A3", "A4", "A5", "A6"];
let deletePassword = "5555";
let names = ["John Doe", "Jane Smith", "Alice Johnson"];
let currentJobNumber = null;

// Validate job number input to allow only numeric characters
function validateJobNumber(input) {
    // Replace any non-numeric character with an empty string
    input.value = input.value.replace(/\D/g, '');
}

// Function to show different screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active'); // Hide all screens
    });
    document.getElementById(screenId).classList.add('active'); // Show selected screen
    updateDropdowns();
    if (screenId === 'inspectJob') {
        populateInspectRows();
        updatePaginationControls(jobs.filter(job => job.status === 'Checked In'));
    }
    if (screenId === 'checkInJob') {
        populateCheckInRows();
        updatePaginationControls(jobs.filter(job => job.status === 'Checked Out'));
    }
    if (screenId === 'deleteJobs') {
        populateDeleteRows();
        updatePaginationControls(jobs.filter(job => job.status === 'Checked Out'));
    }
}

// Prompt for password to access Delete Jobs section
function promptPassword() {
    const enteredPassword = prompt("Enter the password to delete jobs:");
    if (enteredPassword === deletePassword) {
        showScreen('deleteJobs');
    } else {
        alert("Incorrect password!");
    }
}

// Prompt for password before allowing deletion in options
function promptPasswordForOptions(action) {
    const enteredPassword = prompt("Enter the password to delete:");
    if (enteredPassword === deletePassword) {
        action();
    } else {
        alert("Incorrect password!");
    }
}

// Change the password if the current password is correct
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    if (currentPassword === deletePassword) {
        deletePassword = newPassword;
        alert("Password changed successfully!");
    } else {
        alert("Current password is incorrect!");
    }

    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
}

// Update pagination controls based on the data
function updatePaginationControls(data) {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('pageNumbers').innerText = `Page ${currentPage} of ${totalPages}`;
}

// Navigate to the previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateCurrentScreen();
    }
}

// Navigate to the next page
function nextPage() {
    const activeScreen = document.querySelector('.screen.active').id;
    const totalPages = Math.ceil(getFilteredJobs(activeScreen).length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateCurrentScreen();
    }
}

// Update the current screen based on pagination
function updateCurrentScreen() {
    const activeScreen = document.querySelector('.screen.active').id;
    if (activeScreen === 'inspectJob') populateInspectRows();
    if (activeScreen === 'checkInJob') populateCheckInRows();
    if (activeScreen === 'deleteJobs') populateDeleteRows();
}

// Get paginated data for the current page
function getPaginatedData(data) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
}

// Populate inspect rows with paginated data
function populateInspectRows() {
    const searchJobNumber = document.getElementById('inspectSearchJobNumber').value.toLowerCase();
    const searchDescription = document.getElementById('inspectSearchDescription').value.toLowerCase();
    const filteredJobs = jobs.filter(job => 
        job.status === 'Checked In' &&
        job.jobNumber.toString().includes(searchJobNumber) && 
        job.description.toLowerCase().includes(searchDescription)
    );
    const inspectTable = document.getElementById('inspectTable');
    const paginatedJobs = getPaginatedData(filteredJobs);
    inspectTable.innerHTML = paginatedJobs.map(job => `
        <div class="tableRow">
            <div class="tableCell">${job.jobNumber}</div>
            <div class="tableCell">${job.description}</div>
            <div class="tableCell">${job.location}</div>
            <div class="tableCell"><button onclick="checkoutJob(${job.jobNumber})">Check Out</button></div>
        </div>
    `).join('');
    updatePaginationControls(filteredJobs);
}

// Populate check-in rows with paginated data
function populateCheckInRows() {
    const searchJobNumber = document.getElementById('checkInSearchJobNumber').value.toLowerCase();
    const searchDescription = document.getElementById('checkInSearchDescription').value.toLowerCase();
    const filteredJobs = jobs.filter(job => 
        job.status === 'Checked Out' &&
        job.jobNumber.toString().includes(searchJobNumber) && 
        job.description.toLowerCase().includes(searchDescription)
    );
    const checkInTable = document.getElementById('checkInTable');
    const paginatedJobs = getPaginatedData(filteredJobs);
    checkInTable.innerHTML = paginatedJobs.map(job => `
        <div class="tableRow">
            <div class="tableCell">${job.jobNumber}</div>
            <div class="tableCell">${job.description}</div>
            <div class="tableCell">
                <select class="locationDropdown" data-job-number="${job.jobNumber}"></select>
            </div>
            <div class="tableCell">${job.checkedOutBy || ''}</div>
            <div class="tableCell"><button onclick="checkInJob(${job.jobNumber})">Check In</button></div>
        </div>
    `).join('');
    updateDropdowns(); // Populate dropdowns in the check-in table
    updatePaginationControls(filteredJobs);
}

// Populate delete rows with paginated data
function populateDeleteRows() {
    const searchJobNumber = document.getElementById('deleteSearchJobNumber').value.toLowerCase();
    const searchDescription = document.getElementById('deleteSearchDescription').value.toLowerCase();
    const filteredJobs = jobs.filter(job => 
        job.status === 'Checked Out' &&
        job.jobNumber.toString().includes(searchJobNumber) && 
        job.description.toLowerCase().includes(searchDescription)
    );
    const deleteJobTable = document.getElementById('deleteJobTable');
    const paginatedJobs = getPaginatedData(filteredJobs);
    deleteJobTable.innerHTML = paginatedJobs.map(job => `
        <div class="tableRow">
            <div class="tableCell">${job.jobNumber}</div>
            <div class="tableCell">${job.description}</div>
            <div class="tableCell">${job.location}</div>
            <div class="tableCell"><button onclick="deleteJob(${job.jobNumber})">Delete</button></div>
        </div>
    `).join('');
    updatePaginationControls(filteredJobs);
}

// Search jobs in the active screen
function searchJobs(screenId) {
    currentPage = 1;
    updateCurrentScreen();
}

// Checkout a job
function checkoutJob(jobNumber) {
    currentJobNumber = jobNumber;
    document.getElementById('checkoutModal').style.display = 'block';
    filterNames();
}

// Confirm the checkout process
function confirmCheckout() {
    const selectedName = document.getElementById('checkoutNameDropdown').value;
    const job = jobs.find(job => job.jobNumber === currentJobNumber);
    if (job && selectedName) {
        job.status = 'Checked Out';
        job.checkedOutBy = selectedName;
    }
    document.getElementById('checkoutModal').style.display = 'none';
    updateCurrentScreen(); // Update the list
}

// Close the modal
function closeModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// Filter names in the checkout modal
function filterNames() {
    const searchValue = document.getElementById('checkoutNameSearch').value.toLowerCase();
    const filteredNames = names.filter(name => name.toLowerCase().includes(searchValue));
    const checkoutNameDropdown = document.getElementById('checkoutNameDropdown');
    checkoutNameDropdown.innerHTML = filteredNames.map(name => `<option value="${name}">${name}</option>`).join('');
}

// Check In a job
function checkInJob(jobNumber) {
    const job = jobs.find(job => job.jobNumber === jobNumber && job.status === 'Checked Out');
    const newLocationDropdown = document.querySelector(`select[data-job-number="${jobNumber}"]`);
    const newLocation = newLocationDropdown.value;

    if (!job) {
        alert('Job not found or not checked out!');
        return;
    }
    if (!newLocation || !locations.includes(newLocation)) {
        alert('Invalid location!');
        return;
    }

    job.location = newLocation;
    job.status = 'Checked In';
    job.checkedOutBy = ''; // Clear the checked out by field
    updateCurrentScreen();
}

// Delete a job
function deleteJob(jobNumber) {
    const jobIndex = jobs.findIndex(job => job.jobNumber === jobNumber && job.status === 'Checked Out');
    if (jobIndex > -1) {
        jobs.splice(jobIndex, 1);
        alert('Job deleted successfully!');
    } else {
        alert('Job not found or not checked out!');
    }
    updateCurrentScreen(); // Update the list
}

// Add a new location
function addLocation() {
    const newLocationName = document.getElementById('newLocationName').value;
    if (!newLocationName) {
        alert('Location name cannot be empty!');
        return;
    }
    if (locations.includes(newLocationName)) {
        alert('This location already exists!');
        return;
    }
    locations.push(newLocationName);
    updateDropdowns();
    showScreen('welcome');
}

// Delete a location
function deleteLocation() {
    promptPasswordForOptions(() => {
        const selectedLocation = document.getElementById('deleteLocationDropdown').value;
        if (!selectedLocation) {
            alert('No location selected!');
            return;
        }
        locations = locations.filter(loc => loc !== selectedLocation);
        updateDropdowns();
        alert('Location deleted successfully!');
    });
}

// Add a new name for checkout
function addName() {
    const newName = document.getElementById('newName').value;
    if (!newName) {
        alert('Name cannot be empty!');
        return;
    }
    if (names.includes(newName)) {
        alert('This name already exists!');
        return;
    }
    names.push(newName);
    updateDropdowns();
    alert('Name added successfully!');
    document.getElementById('newName').value = ''; // Clear the input field
}

// Delete a name
function deleteName() {
    promptPasswordForOptions(() => {
        const selectedName = document.getElementById('deleteNameDropdown').value;
        if (!selectedName) {
            alert('No name selected!');
            return;
        }
        names = names.filter(name => name !== selectedName);
        updateDropdowns();
        alert('Name deleted successfully!');
    });
}

// Populate dropdowns with location and name options
function updateDropdowns() {
    const locationDropdowns = document.querySelectorAll('.locationDropdown');
    const deleteLocationDropdown = document.getElementById('deleteLocationDropdown');
    const deleteNameDropdown = document.getElementById('deleteNameDropdown');

    // Update location dropdowns
    locationDropdowns.forEach(dropdown => {
        dropdown.innerHTML = locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
    });

    // Update the location and name deletion dropdowns
    deleteLocationDropdown.innerHTML = locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
    deleteNameDropdown.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
}

// Create a new job
function createJob() {
    const jobNumber = parseInt(document.getElementById('jobNumber').value, 10);
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;

    if (!jobNumber || !description || !location) {
        alert('All fields are required!');
        return;
    }

    const newJob = { jobNumber, description, location, status: 'Checked In', checkedOutBy: '' };
    jobs.push(newJob);
    jobs.sort((a, b) => a.jobNumber - b.jobNumber); // Sort jobs numerically
    showScreen('welcome'); // Return to the welcome screen
}

document.addEventListener('DOMContentLoaded', () => {
    showScreen('welcome'); // Initialize the app by showing the welcome screen
});
