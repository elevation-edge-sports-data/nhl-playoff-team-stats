document.addEventListener('DOMContentLoaded', () => {
    console.log('Script initialized');

    // Team code to full name mapping
    const teamNames = {
        'AFM': 'Atlanta Flames',
        'ANA': 'Anaheim Ducks',
        'ARI': 'Arizona Coyotes',
        'ATL': 'Atlanta Thrashers',
        'BOS': 'Boston Bruins',
        'BRK': 'Brooklyn Americans',
        'BUF': 'Buffalo Sabres',
        'CAR': 'Carolina Hurricanes',
        'CBJ': 'Columbus Blue Jackets',
        'CGS': 'California Golden Seals',
        'CGY': 'Calgary Flames',
        'CHI': 'Chicago Blackhawks',
        'CLE': 'Cleveland Barons',
        'CLR': 'Colorado Rockies',
        'COL': 'Colorado Avalanche',
        'DAL': 'Dallas Stars',
        'DCG': 'Detroit Cougars',
        'DET': 'Detroit Red Wings',
        'DFL': 'Detroit Falcons',
        'EDM': 'Edmonton Oilers',
        'FLA': 'Florida Panthers',
        'HAM': 'Hamilton Tigers',
        'HFD': 'Hartford Whalers',
        'KCS': 'Kansas City Scouts',
        'LAK': 'Los Angeles Kings',
        'MIN': 'Minnesota Wild',
        'MMR': 'Montreal Maroons',
        'MNS': 'Minnesota North Stars',
        'MTL': 'Montreal Canadiens',
        'MWN': 'Montreal Wanderers',
        'NJD': 'New Jersey Devils',
        'NSH': 'Nashville Predators',
        'NYA': 'New York Americans',
        'NYI': 'New York Islanders',
        'NYR': 'New York Rangers',
        'OAK': 'Oakland Seals',
        'OTT': 'Ottawa Senators',
        'PHI': 'Philadelphia Flyers',
        'PHX': 'Phoenix Coyotes',
        'PIR': 'Pittsburgh Pirates',
        'PIT': 'Pittsburgh Penguins',
        'QBD': 'Quebec Bulldogs',
        'QUA': 'Philadelphia Quakers',
        'QUE': 'Quebec Nordiques',
        'SEA': 'Seattle Kraken',
        'SEN': 'Ottawa Senators (Original)',
        'SJS': 'San Jose Sharks',
        'SLE': 'St. Louis Eagles',
        'STL': 'St. Louis Blues',
        'TAN': 'Toronto Arenas',
        'TBL': 'Tampa Bay Lightning',
        'TOR': 'Toronto Maple Leafs',
        'TSP': 'Toronto St. Patricks',
        'UTA': 'Utah Hockey Club',
        'VAN': 'Vancouver Canucks',
        'VGK': 'Vegas Golden Knights',
        'WIN': 'Winnipeg Jets (Original)',
        'WPG': 'Winnipeg Jets',
        'WSH': 'Washington Capitals'
    };

    let data = {};
    let teamColors = {};
    let teamSecondaryColors = {};
    let teamTertiaryColors = {};
    let teamQuaternaryColors = {};
    let teamQuinaryColors = {};
    let uniqueLogos = {};
    let sortColumn = 'year';
    let sortDirection = 'desc';

    // Default colors
    const defaultColors = {
        c1: '#111111',
        c2: '#A4A9AD',
        c3: '#A4A9AD',
        c4: '#111111',
        c5: '#A4A9AD'
    };

    // Configure repository name for GitHub Pages
    const repoName = 'elevation-edge-sports-data'; // Updated to match your repository
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePaths = isGitHubPages ? [`/${repoName}`, '/docs', '/'] : [''];
    console.log('Base paths:', basePaths);

    // Fetch files
    async function tryFetch(filePath, basePaths) {
        for (const base of basePaths) {
            const url = `${base}${filePath}`;
            console.log(`Fetching: ${url}`);
            try {
                const response = await fetch(url);
                if (response.ok) {
                    console.log(`Loaded: ${url}`);
                    return { response, base };
                }
                console.warn(`Fetch failed: ${url} (${response.status})`);
            } catch (error) {
                console.warn(`Fetch error: ${url} (${error.message})`);
            }
        }
        throw new Error(`Failed to load ${filePath}`);
    }

    // Load files
    tryFetch('NHLteamcolors.json', basePaths)
        .then(({ response, base }) => {
            window.basePath = base;
            console.log(`Base path set: ${base}`);
            return response.json();
        })
        .then(colorData => {
            console.log('NHLteamcolors.json:', colorData);
            if (Array.isArray(colorData)) {
                colorData.forEach(entry => {
                    if (entry.team) {
                        teamColors[entry.team] = entry.c1 || '#000000';
                        teamSecondaryColors[entry.team] = entry.c2;
                        teamTertiaryColors[entry.team] = entry.c3;
                        teamQuaternaryColors[entry.team] = entry.c4;
                        teamQuinaryColors[entry.team] = entry.c5;
                    }
                });
            }
            return tryFetch('uniquelogos.json', [window.basePath]);
        })
        .then(({ response }) => response.json())
        .then(logoData => {
            console.log('uniquelogos.json:', logoData);
            if (Array.isArray(logoData)) {
                logoData.forEach(entry => {
                    if (entry.team) {
                        uniqueLogos[entry.team] = [];
                        for (let key in entry) {
                            if (key.startsWith('Column') && entry[key]) {
                                uniqueLogos[entry.team].push(entry[key]);
                            }
                        }
                    }
                });
            }
            return tryFetch('data.json', [window.basePath]);
        })
        .then(({ response }) => response.json())
        .then(jsonData => {
            console.log('data.json:', jsonData);
            data = jsonData || {};
            populateTeamSelector();
        })
        .catch(error => {
            console.error('Load error:', error);
            alert('Failed to load data. Using fallback teams.');
            data = {};
            populateTeamSelector();
        });

    // Populate team selector
    function populateTeamSelector() {
        console.log('Populating team selector');
        const teams = new Set();
        Object.values(data).forEach(yearData => {
            if (Array.isArray(yearData)) {
                yearData.forEach(entry => {
                    if (entry && entry.team) {
                        teams.add(entry.team);
                        console.log(`Found team: ${entry.team}`);
                    }
                });
            }
        });

        if (teams.size === 0) {
            console.warn('No teams in data, using fallback');
            Object.keys(teamNames).forEach(team => teams.add(team));
        }

        const selector = document.getElementById('teamSelector');
        if (!selector) {
            console.error('teamSelector not found');
            alert('Error: teamSelector not found');
            return;
        }

        selector.innerHTML = '<option value="">Select a team</option>';
        Array.from(teams).sort().forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team; // Use abbreviation only
            selector.appendChild(option);
            console.log(`Added team: ${team}`);
        });
        console.log(`Populated ${teams.size} teams`);
    }

    // Case-insensitive property access
    function getProperty(obj, prop) {
        if (!obj || typeof obj !== 'object') return undefined;
        const lowerProp = prop.toLowerCase();
        const key = Object.keys(obj).find(k => k.toLowerCase() === lowerProp);
        return key ? obj[key] : undefined;
    }

    // Sort table data
    function sortTableData(teamData, column, direction) {
        return teamData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            if (valA === 'N/A' || valA === null) valA = -Infinity;
            if (valB === 'N/A' || valB === null) valB = -Infinity;
            if (valA === valB) return 0;
            return direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }

    // Update visualization
    window.updateVisualization = function() {
        const team = document.getElementById('teamSelector').value;
        console.log('Updating for team:', team);

        const teamNameElement = document.getElementById('teamName');
        const teamAbbreviationElement = document.getElementById('teamAbbreviation');
        const teamLogosElement = document.getElementById('teamLogos');

        if (!teamNameElement || !teamAbbreviationElement || !teamLogosElement) {
            console.error('Missing DOM elements:', {
                teamName: !teamNameElement,
                teamAbbreviation: !teamAbbreviationElement,
                teamLogos: !teamLogosElement
            });
            alert('Error: One or more required DOM elements are missing. Please check index.html.');
            return;
        }

        if (!team) {
            teamNameElement.textContent = '';
            teamAbbreviationElement.textContent = '';
            teamLogosElement.innerHTML = '';
            document.querySelector('h1.header').style.color = defaultColors.c2;
            document.querySelector('.team-header').style.color = defaultColors.c2;
            document.getElementById('teamDataTable').style.color = '#000000';
            document.getElementById('teamDataTable').style.backgroundColor = '#FFFFFF';
            teamLogosElement.style.backgroundColor = defaultColors.c1;
            document.querySelectorAll('.team-logo').forEach(img => {
                img.style.backgroundColor = '#FFFFFF';
            });
            document.querySelectorAll('.chart').forEach(chart => {
                chart.style.backgroundColor = '#fff';
            });
            document.body.style.backgroundColor = defaultColors.c1;
            return;
        }

        // Update team name, abbreviation, and logos
        teamNameElement.textContent = teamNames[team] || team;
        teamAbbreviationElement.textContent = team;
        teamLogosElement.innerHTML = '';
        const logoYears = (uniqueLogos[team] || []).map(year => parseInt(year)).sort((a, b) => a - b);
        logoYears.forEach(year => {
            const img = document.createElement('img');
            img.src = `${window.basePath}logos/NHL${year}/${team}.png`;
            img.className = 'team-logo';
            img.alt = `${team} logo ${year}`;
            img.style.borderColor = teamTertiaryColors[team] || '#FFFFFF';
            img.style.backgroundColor = '#FFFFFF';
            img.onerror = () => {
                console.warn(`Logo failed: ${img.src}`);
                img.style.display = 'none';
            };
            teamLogosElement.appendChild(img);
        });

        // Update colors
        const primaryColor = teamColors[team] || '#000000';
        const secondaryColor = teamSecondaryColors[team] || '#000000';
        const tertiaryColor = teamTertiaryColors[team] || '#FFFFFF';
        const quaternaryColor = teamQuaternaryColors[team] || '#000000';
        const quinaryColor = teamQuinaryColors[team] && teamQuinaryColors[team].toLowerCase() !== '#ffffff' ? teamQuinaryColors[team] : '#000000';
        document.body.style.backgroundColor = primaryColor;
        document.querySelector('h1.header').style.color = secondaryColor;
        document.querySelector('.team-header').style.color = secondaryColor;
        teamLogosElement.style.backgroundColor = primaryColor;
        document.getElementById('teamDataTable').style.backgroundColor = '#FFFFFF';
        document.querySelectorAll('.chart').forEach(chart => {
            chart.style.backgroundColor = '#fff';
        });

        // Filter team data
        const teamData = [];
        Object.entries(data).forEach(([year, yearData]) => {
            if (Array.isArray(yearData)) {
                const entry = yearData.find(entry => entry && entry.team === team);
                if (entry) {
                    const elimOrder = getProperty(entry, 'elim order');
                    const elimRank = getProperty(entry, 'elim rank');
                    const playoffWins = getProperty(entry, 'playoff wins');
                    teamData.push({ 
                        year: parseInt(year), 
                        elim_order: elimOrder ?? 'N/A',
                        elim_rank: elimRank ?? 'N/A',
                        playoff_wins: playoffWins ?? 0
                    });
                }
            }
        });

        // Sort and update table
        sortTableData(teamData, sortColumn, sortDirection);
        const tbody = document.querySelector('#teamDataTable tbody');
        tbody.innerHTML = '';
        teamData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${window.basePath}logos/NHL${entry.year}/${team}.png" class="logo-img" alt="${team} ${entry.year} logo" onerror="this.style.display='none'" style="background-color: #FFFFFF;"></td>
                <td>${entry.year}</td>
                <td>${entry.elim_rank}</td>
                <td>${entry.elim_order}</td>
                <td>${entry.playoff_wins}</td>
            `;
            tbody.appendChild(row);
        });

        // Set table max-height
        const tableContainer = document.querySelector('.table-container');
        const firstChart = document.querySelector('.charts-container .chart:first-child');
        if (firstChart) {
            const firstChartRect = firstChart.getBoundingClientRect();
            tableContainer.style.maxHeight = `${Math.max(firstChartRect.bottom - firstChartRect.top, 100)}px`;
        } else {
            tableContainer.style.maxHeight = '100px';
        }

        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            const arrow = th.querySelector('.sort-arrow');
            const column = th.getAttribute('data-column');
            th.classList.remove('sorted');
            if (arrow) arrow.textContent = '';
            if (column === sortColumn) {
                th.classList.add('sorted');
                arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }
        });

        // Prepare chart data
        const validTeamData = teamData.filter(entry => entry.elim_order !== 'N/A' && entry.elim_rank !== 'N/A');
        const years = validTeamData.map(entry => entry.year);
        const elimRanks = validTeamData.map(entry => entry.elim_rank);
        const elimOrders = validTeamData.map(entry => entry.elim_order);
        const playoffWins = validTeamData.map(entry => entry.playoff_wins);

        // Generate histogram labels
        const maxValue = 32;
        const maxWins = 16;
        const rankFrequencies = Array(maxValue + 1).fill(0);
        const orderFrequencies = Array(maxValue + 1).fill(0);
        const winsFrequencies = Array(maxWins + 1).fill(0);
        elimRanks.forEach(rank => {
            if (typeof rank === 'number' && rank >= 0 && rank <= maxValue) rankFrequencies[rank]++;
        });
        elimOrders.forEach(order => {
            if (typeof order === 'number' && order >= 0 && order <= maxValue) orderFrequencies[order]++;
        });
        playoffWins.forEach(wins => {
            if (typeof wins === 'number' && wins >= 0 && wins <= maxWins) winsFrequencies[wins]++;
        });
        const sequentialLabels = Array.from({ length: maxValue + 1 }, (_, i) => i);
        const winsLabels = Array.from({ length: maxWins + 1 }, (_, i) => i);

        // Destroy existing charts
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
                        backgroundColor: (teamQuaternaryColors[team] || '#000000') + '80',
                        borderColor: teamQuaternaryColors[team] || '#000000',
                        borderWidth: 1
                    },
                    {
                        label: 'Elimination Number Frequency',
                        data: orderFrequencies,
                        backgroundColor: (teamQuinaryColors[team] || '#000000') + '80',
                        borderColor: teamQuinaryColors[team] || '#000000',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frequency' }, ticks: { stepSize: 1, precision: 0 } },
                    x: { title: { display: true, text: 'Value' }, grid: { display: false } }
                },
                plugins: { title: { display: false } }
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
                        borderColor: teamQuaternaryColors[team] || '#000000',
                        backgroundColor: (teamQuaternaryColors[team] || '#000000') + '80',
                        fill: true,
                        datalabels: { align: 'top', offset: 4, color: teamQuaternaryColors[team] || '#000000', font: { weight: 'bold' } }
                    },
                    {
                        label: 'Elimination Number',
                        data: elimOrders,
                        borderColor: teamQuinaryColors[team] || '#000000',
                        backgroundColor: (teamQuinaryColors[team] || '#000000') + '80',
                        fill: true,
                        datalabels: { align: 'top', offset: 4, color: teamQuinaryColors[team] || '#000000', font: { weight: 'bold' } }
                    }
                ]
            },
            options: {
                scales: {
                    y: { min: 0, max: 32, title: { display: true, text: 'Value' }, ticks: { stepSize: 2, precision: 0 } },
                    x: { title: { display: true, text: 'Year' }, grid: { display: false } }
                },
                plugins: { title: { display: false }, datalabels: { display: true } }
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
                    backgroundColor: (teamQuaternaryColors[team] || '#000000') + '80',
                    borderColor: teamQuaternaryColors[team] || '#000000',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frequency' }, ticks: { stepSize: 1, precision: 0 } },
                    x: { title: { display: true, text: 'Playoff Wins' }, grid: { display: false } }
                },
                plugins: { title: { display: true, text: 'Playoff Wins' }, legend: { display: false } }
            }
        });
    };

    // Add sorting listeners
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-column');
            sortDirection = (column === sortColumn) ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
            sortColumn = column;
            updateVisualization();
        });
    });
});