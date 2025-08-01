// --- CONFIGURATION ---

// Defines the properties of each upgrade
const upgradeConfig = {
    shieldBallCount: { name: 'Shield Ball Count', increment: 25 },
    throwCount: { name: 'Extra Throw', increment: 1 },
    regenerateCount: { name: 'Regeneration', increment: 1 },
    shieldDamage: { name: 'Shield Damage', increment: 1 }
};

/**
 * Calculates the cost for the next level of an upgrade.
 * @param {string} key The upgrade's key (e.g., 'throwCount').
 * @param {number} currentValue The current value of the stat.
 * @returns {number} The cost for the next purchase.
 */
function getUpgradeCost(key, currentValue) {
    switch (key) {
        case 'shieldBallCount':
            return Math.floor(40 * Math.pow(2.5, currentValue/50 - 1));
        case 'throwCount':
            return Math.floor(50 * Math.pow(1.8, currentValue - 1));
        case 'regenerateCount':
            return Math.floor(10 * Math.pow(1.25, currentValue - 1));
        case 'shieldDamage':
            return Math.floor(500 * Math.pow(1.5, currentValue - 1));
        default:
            return Infinity;
    }
}


export default function menuScreen(game) {
    return new Promise(resolve => {
        // --- Get HTML Elements ---
        const menuContainer = document.getElementById('menu-container');
        const mainMenu = document.getElementById('main-menu');
        const upgradeScreen = document.getElementById('upgrade-screen');

        const highscoreDisplay = document.getElementById('highscore-display');
        const waveDisplay = document.getElementById('wave-display');
        const moneyDisplayMain = document.getElementById('money-display-main');
        const moneyDisplayUpgrades = document.getElementById('money-display-upgrades');
        const upgradeList = document.getElementById('upgrade-list');

        const startGameBtn = document.getElementById('start-game-btn');
        const showUpgradesBtn = document.getElementById('show-upgrades-btn');
        const backToMainBtn = document.getElementById('back-to-main-btn');

        /**
         * Updates all dynamic text and button states in the UI from the `game` object.
         */
        function updateUI() {
            // Update shared info
            const moneyText = `Money: $${game.money}`;
            highscoreDisplay.textContent = `High Score: ${game.highscore}`;
            waveDisplay.textContent = `Wave: ${game.wave}`;
            moneyDisplayMain.textContent = moneyText;
            moneyDisplayUpgrades.textContent = moneyText;

            // Rebuild the upgrade list with current data
            upgradeList.innerHTML = '';
            for (const key in game.upgrades) {
                const currentValue = game.upgrades[key];
                const cost = getUpgradeCost(key, currentValue);
                const canAfford = game.money >= cost;

                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="stat-info">
                        <span class="stat-name">${upgradeConfig[key].name}: </span>
                        <span class="stat-value">${currentValue}</span>
                    </div>
                    <button class="menu-btn upgrade-action" data-key="${key}" ${!canAfford ? 'disabled' : ''}>
                        Upgrade ($${cost})
                    </button>
                `;
                upgradeList.appendChild(li);
            }
        }

        // --- Event Handlers ---
        function handleUpgradeClick(event) {
            const key = event.target.dataset.key;
            if (!key) return; // Clicked somewhere else on the list item

            const cost = getUpgradeCost(key, game.upgrades[key]);
            if (game.money >= cost) {
                game.money -= cost;
                game.upgrades[key] += upgradeConfig[key].increment;
                updateUI();
            }
        }

        function handleShowUpgrades() {
            mainMenu.classList.add('hidden');
            upgradeScreen.classList.remove('hidden');
        }

        function handleBackToMain() {
            upgradeScreen.classList.add('hidden');
            mainMenu.classList.remove('hidden');
        }

        function handleStartGame() {
            // 1. Cleanup: Hide UI and remove listeners to prevent memory leaks
            menuContainer.classList.add('hidden');

            startGameBtn.removeEventListener('click', handleStartGame);
            showUpgradesBtn.removeEventListener('click', handleShowUpgrades);
            backToMainBtn.removeEventListener('click', handleBackToMain);
            upgradeList.removeEventListener('click', handleUpgradeClick);

            // 2. Resolve promise to let the main game loop continue
            resolve();
        }

        // --- Initialization ---
        menuContainer.classList.remove('hidden');
        mainMenu.classList.remove('hidden');
        upgradeScreen.classList.add('hidden');

        updateUI();

        // Attach event listeners
        startGameBtn.addEventListener('click', handleStartGame);
        showUpgradesBtn.addEventListener('click', handleShowUpgrades);
        backToMainBtn.addEventListener('click', handleBackToMain);
        // Use event delegation for upgrade buttons
        upgradeList.addEventListener('click', handleUpgradeClick);
    });
}