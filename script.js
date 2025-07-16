document.addEventListener('DOMContentLoaded', () => {
    // Team code to full name mapping
    const teamNames = {
        'AFM': 'Atlanta Flames', 'ANA': 'Anaheim Ducks', 'ARI': 'Arizona Coyotes', 'ATL': 'Atlanta Thrashers',
        'BOS': 'Boston Bruins', 'BUF': 'Buffalo Sabres', 'CAR': 'Carolina Hurricanes', 'CBJ': 'Columbus Blue Jackets',
        'CLE': 'Cleveland Barons', 'CGS': 'California Golden Seals', 'CGY': 'Calgary Flames', 'CHI': 'Chicago Blackhawks',
        'COL': 'Colorado Avalanche', 'DAL': 'Dallas Stars', 'DET': 'Detroit Red Wings', 'EDM': 'Edmonton Oilers',
        'FLA': 'Florida Panthers', 'HFD': 'Hartford Whalers', 'KCS': 'Kansas City Scouts', 'LAK': 'Los Angeles Kings',
        'MIN': 'Minnesota Wild', 'MNS': 'Minnesota North Stars', 'MTL': 'Montreal Canadiens', 'NJD': 'New Jersey Devils',
        'NSH': 'Nashville Predators', 'NYI': 'New York Islanders', 'NYR': 'New York Rangers', 'OTT': 'Ottawa Senators',
        'PHI': 'Philadelphia Flyers', 'PHX': 'Phoenix Coyotes', 'PIT': 'Pittsburgh Penguins', 'QUE': 'Quebec Nordiques',
        'SEA': 'Seattle Kraken', 'SJS': 'San Jose Sharks', 'STL': 'St. Louis Blues', 'TBL': 'Tampa Bay Lightning',
        'TOR': 'Toronto Maple Leafs', 'VAN': 'Vancouver Canucks', 'VGK': 'Vegas Golden Knights', 'WIN': 'Winnipeg Jets (1979-1996)',
        'WPG': 'Winnipeg Jets', 'WSH': 'Washington Capitals'
    };

    let data = {};
    let teamColors = {};
    let teamSecondaryColors = {};
    let sortColumn = 'year';
    let sortDirection = 'desc';

    // Load NHL team colors
    fetch('NHLteamcolors.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load NHLteamcolors.json');
            }
            return response.json();
        })
        .then(colorData => {
            console.log('Team colors loaded:', colorData);
            // Build color mappings
            colorData.forEach(entry => {
                if (entry.team && entry.c1) {
                    teamColors[entry.team] = entry.c1;
                }
                if (entry.team && entry.c2) {
                    teamSecondaryColors[entry.team] = entry.c2;
                }
            });
            console.log('teamColors:', teamColors);
            console.log('teamSecondaryColors:', teamSecondaryColors);
            // Load data.json after colors are loaded
            return fetch('data.json');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load data.json');
            }
            return response.json();
        })
        .then(jsonData => {
            data = jsonData;
            console.log('Data loaded:', data);
            populateTeamSelector();
        })
        .catch(error => {
            console.error('Error loading files:', error);
            alert('Failed to load data or team colors. Please ensure NHLteamcolors.json and data.json are in the same directory.');
        });

    // Populate team selector
    function populateTeamSelector() {
        const teams = new Set();
        Object.values(data).forEach(yearData => {
            if (Array.isArray(yearData)) {
                yearData.forEach(entry => {
                    if (entry.team) {
                        teams.add(entry.team);
                    }
                });
            }
        });
        console.log('Teams found:', Array.from(teams));
        const selector = document.getElementById('teamSelector');
        selector.innerHTML = '<option value="">Select a team</option>'; // Reset options
        Array.from(teams).sort().forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team; // Use team abbreviation
            selector.appendChild(option);
        });
        if (teams.size === 0) {
            console.error('No teams found in the data.');
            alert('No teams found in the data. Please check data.json.');
        }
    }

    // Helper function to find property case-insensitively
    function getProperty(obj, prop) {
        const lowerProp = prop.toLowerCase();
        const key = Object.keys(obj).find(k => k.toLowerCase() === lowerProp);
        console.log(`Looking for property "${prop}" in object:`, obj, `Found key: ${key}`);
        return key ? obj[key] : undefined;
    }

    // Sort table data
    function sortTableData(teamData, column, direction) {
        return teamData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            // Handle 'N/A' and null values
            if (valA === 'N/A' || valA === null) valA = -Infinity;
            if (valB === 'N/A' || valB === null) valB = -Infinity;
            if (valA === valB) return 0;
            if (direction === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });
    }

    // Update visualization
    window.updateVisualization = function() {
        const team = document.getElementById('teamSelector').value;
        if (!team) {
            document.getElementById('teamName').textContent = '';
            document.getElementById('teamLogo').style.display = 'none';
            document.querySelector('.header').style.color = '#000000'; // Reset to black
            document.querySelector('.team-header').style.color = '#000000'; // Reset to black
            return;
        }

        // Update team name and logo
        document.getElementById('teamName').textContent = teamNames[team] || team;
        const latestYear = Object.keys(data)
            .filter(year => Array.isArray(data[year]) && data[year].some(entry => entry.team === team))
            .map(year => parseInt(year))
            .sort((a, b) => b - a)[0] || 2025;
        const teamLogo = document.getElementById('teamLogo');
        teamLogo.src = `logos/NHL${latestYear}/${team}.png`;
        teamLogo.style.display = 'inline';

        // Update colors
        const secondaryColor = teamSecondaryColors[team] || '#000000';
        document.body.style.backgroundColor = teamColors[team] || '#f0f0f0';
        document.querySelector('.header').style.color = secondaryColor; // Secondary color for header
        document.querySelector('.team-header').style.color = secondaryColor; // Secondary color for team name
        document.getElementById('teamDataTable').style.color = secondaryColor;

        // Filter team data
        const teamData = [];
        Object.entries(data).forEach(([year, yearData]) => {
            if (Array.isArray(yearData)) {
                const entry = yearData.find(entry => entry.team === team);
                if (entry) {
                    console.log(`Entry for ${team} in ${year}:`, entry);
                    console.log(`Keys for ${team} in ${year}:`, Object.keys(entry));
                    const elimOrder = getProperty(entry, 'elim order');
                    const elimRank = getProperty(entry, 'elim rank');
                    const playoffWins = getProperty(entry, 'playoff wins');
                    console.log(`Raw values for ${team} in ${year}: elim order = ${elimOrder} (type: ${typeof elimOrder}), elim rank = ${elimRank} (type: ${typeof elimRank}), playoff wins = ${playoffWins} (type: ${typeof playoffWins})`);
                    teamData.push({ 
                        year: parseInt(year), 
                        elim_order: elimOrder ?? 'N/A',
                        elim_rank: elimRank ?? 'N/A',
                        playoff_wins: playoffWins ?? 0
                    });
                }
            }
        });

        // Sort table data
        sortTableData(teamData, sortColumn, sortDirection);
        console.log('Team data for', team, ':', teamData);

        // Update table with logo and playoff wins
        const tbody = document.querySelector('#teamDataTable tbody');
        tbody.innerHTML = '';
        teamData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="logos/NHL${entry.year}/${team}.png" class="logo-img" alt="${team} logo"></td>
                <td>${entry.year}</td>
                <td>${entry.elim_order}</td>
                <td>${entry.elim_rank}</td>
                <td>${entry.playoff_wins}</td>
            `;
            tbody.appendChild(row);
        });

        // Set table max-height dynamically, with a minimum for short tables
        const tableContainer = document.querySelector('.table-container');
        const firstChart = document.querySelector('.charts-container .chart:first-child');
        if (firstChart) {
            const firstChartRect = firstChart.getBoundingClientRect();
            const containerRect = document.querySelector('.container').getBoundingClientRect();
            const maxHeight = Math.max(firstChartRect.bottom - firstChartRect.top, 100); // Match first chart height or minimum 100px
            tableContainer.style.maxHeight = `${maxHeight}px`;
        } else {
            tableContainer.style.maxHeight = '100px'; // Fallback for short tables
        }

        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            const arrow = th.querySelector('.sort-arrow');
            const column = th.getAttribute('data-column');
            th.classList.remove('sorted');
            arrow.textContent = '';
            if (column === sortColumn) {
                th.classList.add('sorted');
                arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }
        });

        // Prepare data for charts (only valid entries)
        const validTeamData = teamData.filter(entry => entry.elim_order !== 'N/A' && entry.elim_rank !== 'N/A');
        const years = validTeamData.map(entry => entry.year);
        const elimRanks = validTeamData.map(entry => entry.elim_rank);
        const elimOrders = validTeamData.map(entry => entry.elim_order);
        const playoffWins = validTeamData.map(entry => entry.playoff_wins);

        // Generate sequential labels for histograms
        const maxValue = 32; // For combined histogram and line chart
        const maxWins = 16; // For playoff wins histogram
        const rankFrequencies = Array(maxValue + 1).fill(0);
        const orderFrequencies = Array(maxValue + 1).fill(0);
        const winsFrequencies = Array(maxWins + 1).fill(0);
        elimRanks.forEach(rank => {
            if (typeof rank === 'number' && rank >= 0 && rank <= maxValue) {
                rankFrequencies[rank]++;
            }
        });
        elimOrders.forEach(order => {
            if (typeof order === 'number' && order >= 0 && order <= maxValue) {
                orderFrequencies[order]++;
            }
        });
        playoffWins.forEach(wins => {
            if (typeof wins === 'number' && wins >= 0 && wins <= maxWins) {
                winsFrequencies[wins]++;
            }
        });
        const sequentialLabels = Array.from({ length: maxValue + 1 }, (_, i) => i);
        const winsLabels = Array.from({ length: maxWins + 1 }, (_, i) => i);

        // Destroy existing charts if they exist
        ['combinedHistogram', 'combinedLine', 'playoffWinsHistogram'].forEach(id => {
            const chart = Chart.getChart(id);
            if (chart) chart.destroy();
        });

        // Combined Histogram
        new Chart(document.getElementById('combinedHistogram'), {
            type: 'bar',
            data: {
                labels: sequentialLabels,
                datasets: [
                    {
                        label: 'Playoff Rank Frequency',
                        data: rankFrequencies,
                        backgroundColor: (teamColors[team] || '#007bff') + '80', // Semi-transparent primary
                        borderColor: teamColors[team] || '#007bff',
                        borderWidth: 1
                    },
                    {
                        label: 'Elimination Number Frequency',
                        data: orderFrequencies,
                        backgroundColor: (teamSecondaryColors[team] || '#000000') + '80', // Semi-transparent secondary
                        borderColor: teamSecondaryColors[team] || '#000000',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Frequency' },
                        ticks: { stepSize: 1, precision: 0 }, // Gridlines and labels in increments of 1
                        grid: { display: true, drawBorder: true }
                    },
                    x: { 
                        title: { display: true, text: 'Value' },
                        grid: { display: false } // Hide vertical gridlines
                    }
                },
                plugins: {
                    title: { display: false } // No title
                }
            }
        });

        // Combined Line Graph
        new Chart(document.getElementById('combinedLine'), {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Playoff Rank',
                        data: elimRanks,
                        borderColor: teamColors[team] || '#007bff',
                        backgroundColor: (teamColors[team] || '#007bff') + '80',
                        fill: true,
                        datalabels: {
                            align: 'top',
                            offset: 4,
                            color: teamColors[team] || '#007bff',
                            font: { weight: 'bold' }
                        }
                    },
                    {
                        label: 'Elimination Number',
                        data: elimOrders,
                        borderColor: teamSecondaryColors[team] || '#000000',
                        backgroundColor: (teamSecondaryColors[team] || '#000000') + '80',
                        fill: true,
                        datalabels: {
                            align: 'top',
                            offset: 4,
                            color: teamSecondaryColors[team] || '#000000',
                            font: { weight: 'bold' }
                        }
                    }
                ]
            },
            options: {
                scales: {
                    y: { 
                        min: 0, 
                        max: 32, 
                        title: { display: true, text: 'Value' },
                        ticks: { stepSize: 2, precision: 0 },
                        grid: { display: true, drawBorder: true }
                    },
                    x: { 
                        title: { display: true, text: 'Year' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    title: { display: false }, // No title
                    datalabels: { display: true }
                }
            }
        });

        // Playoff Wins Histogram
        new Chart(document.getElementById('playoffWinsHistogram'), {
            type: 'bar',
            data: {
                labels: winsLabels,
                datasets: [{
                    label: 'Playoff Wins Frequency',
                    data: winsFrequencies,
                    backgroundColor: (teamColors[team] || '#007bff') + '80', // Semi-transparent primary
                    borderColor: teamColors[team] || '#007bff',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Frequency' },
                        ticks: { stepSize: 1, precision: 0 }, // Gridlines and labels in increments of 1
                        grid: { display: true, drawBorder: true }
                    },
                    x: { 
                        title: { display: true, text: 'Playoff Wins' },
                        grid: { display: false } // Hide vertical gridlines
                    }
                },
                plugins: {
                    title: { display: true, text: 'Playoff Wins' }, // Updated title
                    legend: { display: false } // No legend
                }
            }
        });
    };

    // Add click event listeners for sorting
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-column');
            if (column === sortColumn) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            updateVisualization();
        });
    });
});