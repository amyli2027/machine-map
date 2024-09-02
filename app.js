document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const machinesPerPage = 12;
    let machinesData = [];

    fetch('machines.json')
        .then(response => response.json())
        .then(jsonData => {
            machinesData = jsonData.machines;
            renderPage(currentPage);
        })
        .catch(error => console.error('Error loading JSON:', error));

    function renderPage(page) {
        const mapGrid = document.querySelector('.map-grid');
        mapGrid.innerHTML = '';

        // Calculate the starting and ending index for the current page
        const startIndex = (page - 1) * machinesPerPage;
        const endIndex = startIndex + machinesPerPage;
        const pageMachines = machinesData.slice(startIndex, endIndex);

        // Create grid items for the current page
        pageMachines.forEach(machine => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.setAttribute('data-machine-name', machine.name.toLowerCase()); // Store machine name in a data attribute
            gridItem.textContent = machine.name;

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltiptext';
            tooltip.textContent = `${machine.info}, Machine Number: ${machine.machineNumber}`;

            gridItem.appendChild(tooltip);
            mapGrid.appendChild(gridItem);
        });

        updateNavigationButtons(page);
    }

    function updateNavigationButtons(page) {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');

        // Enable or disable the previous button
        prevButton.disabled = (page === 1);

        // Enable or disable the next button
        nextButton.disabled = (page * machinesPerPage >= machinesData.length);
    }

    function goToPageForMachine(machineName) {
        const machineIndex = machinesData.findIndex(machine => machine.name.toLowerCase() === machineName.toLowerCase());
        if (machineIndex !== -1) {
            const targetPage = Math.floor(machineIndex / machinesPerPage) + 1;
            if (targetPage !== currentPage) {
                currentPage = targetPage;
                renderPage(currentPage);
            }
        }
    }

    document.getElementById('prevButton').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });

    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentPage * machinesPerPage < machinesData.length) {
            currentPage++;
            renderPage(currentPage);
        }
    });

    document.getElementById('lookupForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const searchTerm = document.getElementById('machineName').value.toLowerCase().trim();
        const gridItems = document.querySelectorAll('.grid-item');

        gridItems.forEach(function(item) {
            // Reset background color
            item.style.backgroundColor = '#ccc';

            // Check for an exact match using the data attribute
            if (item.getAttribute('data-machine-name') === searchTerm) {
                console.log("lookup");
                // Highlight matching item
                item.style.backgroundColor = 'yellow';
            }
        });

        // Go to the page containing the searched machine
        goToPageForMachine(searchTerm);
    });
});
