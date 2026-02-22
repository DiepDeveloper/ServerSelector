(function() {
	'use strict';
	const style = document.createElement('style');
	style.textContent = `
	#diepchat-server-selector {
		width: 450px;
		height: auto;
		background: transparent;
		padding: 0;
		font-family: Arial, sans-serif;
		overflow-y: visible;
		position: static;
		z-index: 10;
		box-sizing: border-box;
	}
	#diepchat-server-selector h3 {
		margin: 0 0 8px 0;
		font-size: 1em;
		font-weight: bold;
		letter-spacing: 1px;
	}
	.diepchat-server-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
		border-radius: 6px;
		padding: 5px 8px;
		border: 2px solid transparent;
		background: transparent;
		position: relative;
		overflow: hidden;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}
	.diepchat-server-mode {
		font-size: 15px;
		font-weight: bold;
		text-shadow:
			1px 0 0 #000,
			-1px 0 0 #000,
			0 1px 0 #000,
			0 -1px 0 #000,
			1px 1px 0 #000,
			-1px -1px 0 #000,
			1px -1px 0 #000,
			-1px 1px 0 #000;
	}
	.diepchat-server-row.ffa {
		border-color: #4f9f9c;
		background: linear-gradient(to bottom, #71e7e4 60%, #65cfcd 40%);
	}
	.diepchat-server-row.teams {
		border-color: #64984b;
		background: linear-gradient(to bottom, #93de6d 60%, #80c25f 40%);
	}
	.diepchat-server-row[mode="4teams"] {
		border-color: #8b3b3b;
		background: linear-gradient(to bottom, #ca5454 60%, #b54b4b 40%);
	}
	.diepchat-server-row.maze {
		border-color: #9f914f;
		background: linear-gradient(to bottom, #e8d472 60%, #d0be66 40%);
	}
	.diepchat-server-row.event {
		border-color: #3e578e;
		background: linear-gradient(to bottom, #587ecf 60%, #4f71ba 40%);
	}
	.diepchat-server-row.sandbox {
		border-color: #553989;
		background: linear-gradient(to bottom, #7a50c7 60%, #6e48b3 40%);
	}

	.diepchat-server-row.ffa:hover {
		border-color: #37b0ad;
		background: linear-gradient(to bottom, #46e7e2 60%, #40d1cc 40%);
	}
	.diepchat-server-row.teams:hover {
		border-color: #60b037;
		background: linear-gradient(to bottom, #7be746 60%, #71d140 40%);
	}
	.diepchat-server-row[mode="4teams"]:hover {
		border-color: #b03737;
		background: linear-gradient(to bottom, #e74646 60%, #d14040 40%);
	}
	.diepchat-server-row.maze:hover {
		border-color: #b09b37;
		background: linear-gradient(to bottom, #e7cb46 60%, #d1b740 40%);
	}
	.diepchat-server-row.event:hover {
		border-color: #375eb0;
		background: linear-gradient(to bottom, #467ae7 60%, #406ed1 40%);
	}
	.diepchat-server-row.sandbox:hover {
		border-color: #6237b0;
		background: linear-gradient(to bottom, #7e46e7 60%, #7240d1 40%);
	}
	.diepchat-server-row:last-child { margin-bottom: 0; }
	.diepchat-server-info {
		display: flex;
		flex-direction: column;
	}
	.diepchat-server-players {
		font-size: 0.95em;
		color: rgba(255, 255, 255, 0.7);
        text-shadow:
			1px 0 0 #000,
			-1px 0 0 #000,
			0 1px 0 #000,
			0 -1px 0 #000,
			1px 1px 0 #000,
			-1px -1px 0 #000,
			1px -1px 0 #000,
			-1px 1px 0 #000;
	}
	.diepchat-server-join {
        background: linear-gradient(to bottom, #3fae3f 60%, #318431 40%);
        border: 2px solid #2e8b2e;
		color: #fff;
		border-radius: 4px;
		padding: 3px 10px;
		cursor: pointer;
		font-size: 0.95em;
	}
	.diepchat-server-join:hover {
		background: linear-gradient(to bottom, #48ce48 60%, #3fae3f 40%);
	}
	`;
	document.head.appendChild(style);

	let container = null;

	function createContainer() {
		if (container) return;
		container = document.createElement('div');
		container.id = 'diepchat-server-selector';
		container.innerHTML = '<div id="diepchat-server-list">Loading...</div>';
		container.style.display = 'none';
		const spawnInput = document.getElementById('spawn-input');
		if (spawnInput && spawnInput.parentNode) {
			if (spawnInput.nextSibling) { spawnInput.parentNode.insertBefore(container, spawnInput.nextSibling); }
            else { spawnInput.parentNode.appendChild(container); }
		} else { document.body.appendChild(container); }
	}

	function showContainer() {
		if (!container) createContainer();
		container.style.display = '';
		updateServerListWithCurrentPrefs();
	}

	function hideContainer() {
		if (container) container.style.display = 'none';
	}

	function ensureContainerVisible() {
		const playBtn = document.getElementById('spawn-button');
		const spawnInput = document.getElementById('spawn-input');
		if (playBtn && playBtn.offsetParent !== null && spawnInput) { showContainer(); }
        else { hideContainer(); }
	}

	setInterval(ensureContainerVisible, 400);
	let lastServerData = null;
	function updateServerListWithCurrentPrefs() {
		if (!lastServerData) return;
		let selected_gamemode = localStorage.getItem('selected_gamemode');
		let selected_region = localStorage.getItem('region');
		let servers = [];
		if (lastServerData && lastServerData.regions) {
			lastServerData.regions.forEach(region => {
				if (selected_region && region.region !== selected_region) return;
				region.lobbies.forEach(lobby => {
					if (lobby.gamemode === selected_gamemode) {
						servers.push({
							region: region.region,
							regionName: region.regionName,
							gamemode: lobby.gamemode,
							gamemodeName: lobby.gamemodeName,
							numPlayers: lobby.numPlayers,
							ip: lobby.ip
						});
					}
				});
			});
		}
		updateServerList(servers);
	}

	function updateServerList(servers) {
		if (!container) return;
		const list = container.querySelector('#diepchat-server-list');
		if (!servers || servers.length === 0) {
			list.innerHTML = '<em>No servers found.</em>';
			return;
		}
		list.innerHTML = '';
		servers.forEach(server => {
			const row = document.createElement('div');
			let modeClass = '';
			switch (server.gamemode) {
				case 'ffa': modeClass = 'ffa'; break;
				case 'teams': modeClass = 'teams'; break;
				case '4teams': modeClass = '4teams'; break;
				case 'maze': modeClass = 'maze'; break;
				case 'event': modeClass = 'event'; break;
				case 'sandbox': modeClass = 'sandbox'; break;
				default: modeClass = '';
			}
			row.className = `diepchat-server-row ${modeClass}`;
			if (server.gamemode === '4teams') row.setAttribute('mode', '4teams');
			const flagMap = {
				'syd': 'https://diep.io/old-assets/assets/flag-square/au.svg',
				'sgp': 'https://diep.io/old-assets/assets/flag-square/sg.svg',
				'sao': 'https://diep.io/old-assets/assets/flag-square/br.svg',
				'fra': 'https://diep.io/old-assets/assets/flag-square/de.svg',
				'atl': 'https://diep.io/old-assets/assets/flag-square/us.svg'
			};
			const flagUrl = flagMap[server.region] || '';
			let playerColor = 'rgb(255, 255, 255)';
			if (server.numPlayers >= 50) { playerColor = '#28b800'; }
			else if (server.numPlayers <= 5) { playerColor = '#a40000'; }
			else {
				let min = 6, max = 49;
				let t = (server.numPlayers - min) / (max - min);
				function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
				let r, g, b;
				if (t < 0.35) {
					r = lerp(164, 255, t / 0.35);
					g = lerp(0, 153, t / 0.35);
					b = lerp(0, 0, t / 0.35);
				} else {
					let t2 = (t - 0.35) / (1 - 0.35);
					r = lerp(255, 40, t2);
					g = lerp(153, 184, t2);
					b = lerp(0, 0, t2);
				}
				playerColor = `rgb(${r},${g},${b})`;
			}
			row.innerHTML = `
				<div class="diepchat-server-info" style="display:flex;flex-direction:row;align-items:center;gap:8px;">
					<img src="${flagUrl}" alt="flag" style="width:32px;height:32px;border-radius:50%;border:2px solid #fff;box-sizing:border-box;">
					<span class="diepchat-server-mode">${server.gamemodeName}</span>
					<span class="diepchat-server-players" style="color:${playerColor}">${server.numPlayers} players</span>
				</div>
				<button class="diepchat-server-join">Join</button>
			`;
			row.querySelector('.diepchat-server-join').onclick = () => {
				const region = server.region;
				const mode = server.gamemode;
				const ip = server.ip;
				const lobbyUrl = `https://diep.io/?lobby=${region}_${mode}_${ip}`;
				window.location.href = lobbyUrl;
			};
			list.appendChild(row);
		});
	}
	const origFetch = window.fetch;
	window.fetch = async function(...args) {
		const url = args[0];
		let response = await origFetch.apply(this, args);
		if (typeof url === 'string' && url.startsWith('https://lb.diep.io/api/lb/pc')) {
			response.clone().json().then(data => {
				lastServerData = data;
				updateServerListWithCurrentPrefs();
			}).catch(() => {
				updateServerList([]);
			});
		}
		return response;
	};

	function tryFetchInitial() {
		fetch('https://lb.diep.io/api/lb/pc').then(r => r.json()).then(data => {
			lastServerData = data;
			updateServerListWithCurrentPrefs();
		}).catch(() => {
			updateServerList([]);
		});
	}
	tryFetchInitial();
	window.addEventListener('storage', function(e) {
		if (e.key === 'selected_gamemode' || e.key === 'region') { updateServerListWithCurrentPrefs(); }
	});
	const origSetItem = localStorage.setItem;
	localStorage.setItem = function(key, value) {
		origSetItem.apply(this, arguments);
		if (key === 'selected_gamemode' || key === 'region') {
			updateServerListWithCurrentPrefs();
		}
	};
	function observeGamemodeChange() {
		const checkAndObserve = () => {
			let lastMode = localStorage.getItem('selected_gamemode');
			setInterval(() => {
				let currentMode = localStorage.getItem('selected_gamemode');
				if (currentMode !== lastMode) {
					lastMode = currentMode;
					updateServerListWithCurrentPrefs();
				}
			}, 500);
		};
		checkAndObserve();
	}
	observeGamemodeChange();
})();
