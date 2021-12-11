function getPerSecBeforeManual(a){var b=0,c=game.jobs[a].increase;if("custom"==c)return 0;if(0<game.jobs[a].owned){if(b=game.jobs[a].owned*game.jobs[a].modifier,0<game.portal.Motivation.level&&(b+=b*game.portal.Motivation.level*game.portal.Motivation.modifier),0<game.portal.Motivation_II.level&&(b*=1+game.portal.Motivation_II.level*game.portal.Motivation_II.modifier),0<game.portal.Meditation.level&&(b*=(1+0.01*game.portal.Meditation.getBonusPercent()).toFixed(2)),0<game.jobs.Magmamancer.owned&&"metal"==c&&(b*=game.jobs.Magmamancer.getBonusPercent()),"Meditate"==game.global.challengeActive?b*=1.25:"Size"==game.global.challengeActive&&(b*=1.5),"Toxicity"==game.global.challengeActive){var d=game.challenges.Toxicity.lootMult*game.challenges.Toxicity.stacks/100;b*=1+d}"Balance"==game.global.challengeActive&&(b*=game.challenges.Balance.getGatherMult()),"Decay"==game.global.challengeActive&&(b*=10,b*=Math.pow(0.995,game.challenges.Decay.stacks)),"Daily"==game.global.challengeActive&&("undefined"!=typeof game.global.dailyChallenge.dedication&&(b*=dailyModifiers.dedication.getMult(game.global.dailyChallenge.dedication.strength)),"undefined"!=typeof game.global.dailyChallenge.famine&&"fragments"!=c&&"science"!=c&&(b*=dailyModifiers.famine.getMult(game.global.dailyChallenge.famine.strength))),"Watch"==game.global.challengeActive&&(b/=2),"Lead"==game.global.challengeActive&&1==game.global.world%2&&(b*=2),b=calcHeirloomBonus("Staff",a+"Speed",b)}return b}
function checkJobPercentageCost(a,b){var c="food",d=game.jobs[a],e=d.cost[c],f=0;b||(b=game.global.buyAmt),f="undefined"==typeof e[1]?e*b:Math.floor(e[0]*Math.pow(e[1],d.owned)*((Math.pow(e[1],b)-1)/(e[1]-1)));var g;if(game.resources[c].owned<f){var h=getPsString(c,!0);return 0<h&&(g=calculateTimeToMax(null,h,f-game.resources[c].owned)),[!1,g]}return g=0<game.resources[c].owned?(100*(f/game.resources[c].owned)).toFixed(1):0,[!0,g]}
function getScienceCostToUpgrade(a){var b=game.upgrades[a];return void 0!==b.cost.resources.science&&void 0!==b.cost.resources.science[0]?Math.floor(b.cost.resources.science[0]*Math.pow(b.cost.resources.science[1],b.done)):void 0!==b.cost.resources.science&&void 0==b.cost.resources.science[0]?b.cost.resources.science:0}

function getMutationStatScale(mutationName, type) {
    let result = 0;
    switch (mutationName) {
        case "Corruption":
            result = type === "attack" ? 3 : 10;
            break;
        case "Healthy":
            result = type === "attack" ? 5 : 14;
    }
    return result;
}

function calculateEnemyScale(type, forMap = false, voidMap = false) {
	let maxScale = 1.0;
	if (voidMap) forMap = true;
	// Find maximum mutation multi
	if (!forMap || (forMap && (mutations.Magma.active() || game.global.world >= mutations.Corruption.start(true)))) {
		for (let mutation of Object.entries(mutations)) {
			let key = mutation[0]
			let val = mutation[1]
			if (val?.active() && val?.statScale) {
				let statMulti = getMutationStatScale(key, type);
				if (statMulti > 0) {
					let tempMulti = val.statScale(statMulti);
					if (forMap && ((voidMap && !mutations.Magma.active())
						|| (!voidMap && mutations.Magma.active()))) {
						tempMulti /= 2;
					}
					if (tempMulti > maxScale) {
						maxScale = tempMulti;
					}
				}
			}
		}
	}
	return maxScale;
}

/**
 * This is called in case we don't have cell instance to work with. Any calculation included in damage will not be here and vice versa.
 * @param worldNumber
 * @param cellNumber
 * @param enemyName
 * @param difficulty
 * @param scale
 * @param map
 * @param voidMap
 * @returns {number}
 */
function getEnemyMaxAttack(worldNumber, cellNumber, enemyName, difficulty = 1.0, scale = false, map = false, voidMap = false, spire = false) {
    // Use code directly stolen from game instead
    let enemyDamage;
    if (voidMap) map = true;
    if (spire) {
        enemyDamage = calcSpire(100, game.global.gridArray[99].name, 'attack');
    } else {
        enemyDamage = RgetEnemyMaxAttack(worldNumber, cellNumber, enemyName, difficulty, scale, false);
    }
    if (map) enemyDamage *= difficulty;
    // Mutations
    if (scale) {
        enemyDamage *= calculateEnemyScale("attack", map, voidMap);
        let grid = map ? game.global.mapGridArray : game.global.gridArray;
        grid = grid.filter(item => item.corrupted).map(item => item.corrupted)
        if (grid.includes("healthyStrong")) enemyDamage *= 2.5;
        else if (grid.includes("corruptStrong")) enemyDamage *= 2;
    }
    // Other Stuff
    if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
        let oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
        let zoneModifier = Math.floor(worldNumber / game.challenges[game.global.challengeActive].zoneScaleFreq);
        oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
        enemyDamage *= oblitMult;
    }
    if (game.global.challengeActive == "Life") {
        enemyDamage *= 6;
    } else if (game.global.challengeActive == "Toxicity") {
        enemyDamage *= 5;
    } else if (game.global.challengeActive == "Balance") {
        enemyDamage *= (map) ? 2.35 : 1.17;
    } else if (game.global.challengeActive == "Unbalance") {
        enemyDamage *= 1.5;
    } else if (game.global.challengeActive == "Domination") {
        enemyDamage *= 2.5;
    } else if (game.global.challengeActive == "Mayhem") {
        let mayhemMult = game.challenges.Mayhem.getEnemyMult();
        enemyDamage *= mayhemMult;
    } else if (game.global.challengeActive == "Exterminate") {
        let extMult = game.challenges.Exterminate.getSwarmMult();
        enemyDamage *= extMult;
    } else if (game.global.challengeActive == "Alchemy") {
        let statMult = alchObj.getEnemyStats(map, voidMap) + 1;
        enemyDamage *= statMult;
    } else if (game.global.challengeActive == "Storm" && !map) {
        enemyDamage *= game.challenges.Storm.getAttackMult();
    }
    return Math.floor(enemyDamage);
}

function getEnemyMaxHealth(worldNumber, cellNumber = 30, enemyName = "Snimp", scale = false, difficulty = 1.0, map = false, voidMap = false, daily = false, health = undefined, spire = false) {
    // Use code directly stolen from game instead
    let enemyHealth;
    if (voidMap) map = true;
    if (health) {
        enemyHealth = health;
    } else if (spire) {
        enemyHealth = calcSpire(100, game.global.gridArray[99].name, 'health');
    } else {
        enemyHealth = RgetEnemyMaxHealth(worldNumber, cellNumber, enemyName, false);
    }
    if (map) enemyHealth *= difficulty;
    // Mutations
    if (scale) {
        enemyHealth *= calculateEnemyScale("health", map, voidMap);
        let grid = map ? game.global.mapGridArray : game.global.gridArray;
        grid = grid.filter(item => item.corrupted).map(item => item.corrupted)
        if (grid.includes("healthyStrong")) enemyHealth *= 7.5;
        else if (grid.includes("corruptTough")) enemyHealth *= 5;
    }
    // Other Stuff
    if (game.global.challengeActive == "Obliterated" || game.global.challengeActive == "Eradicated") {
        let oblitMult = (game.global.challengeActive == "Eradicated") ? game.challenges.Eradicated.scaleModifier : 1e12;
        let zoneModifier = Math.floor(worldNumber / game.challenges[game.global.challengeActive].zoneScaleFreq);
        oblitMult *= Math.pow(game.challenges[game.global.challengeActive].zoneScaling, zoneModifier);
        enemyHealth *= oblitMult;
    } else if (daily && game.global.challengeActive == "Daily") {
        if (typeof game.global.dailyChallenge.badHealth !== 'undefined') {
            enemyHealth *= dailyModifiers.badHealth.getMult(game.global.dailyChallenge.badHealth.strength);
        }
        if (typeof game.global.dailyChallenge.badMapHealth !== 'undefined' && map) {
            enemyHealth *= dailyModifiers.badMapHealth.getMult(game.global.dailyChallenge.badMapHealth.strength);
        }
        if (typeof game.global.dailyChallenge.empower !== 'undefined') {
            if (!map) enemyHealth *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
        }
    } else if (game.global.challengeActive == "Life") {
        enemyHealth *= 11;
    } else if (game.global.challengeActive == "Coordinate") {
        enemyHealth *= getBadCoordLevel();
    } else if (game.global.challengeActive == "Meditate") {
        enemyHealth *= 2;
    } else if (game.global.challengeActive == "Toxicity") {
        enemyHealth *= 2;
    } else if (game.global.challengeActive == "Balance") {
        enemyHealth *= map ? 2.35 : 1.17;
    } else if (game.global.challengeActive == "Unbalance") {
        enemyHealth *= (map) ? 2 : 3;
    } else if (game.global.challengeActive == "Lead" && (game.challenges.Lead.stacks > 0)) {
        enemyHealth *= (1 + (Math.min(game.challenges.Lead.stacks, 200) * 0.04));
    } else if (game.global.challengeActive == "Domination") {
        enemyHealth *= 7.5;
    } else if (game.global.challengeActive == "Quest") {
        enemyHealth *= game.challenges.Quest.getHealthMult();
    } else if (game.global.challengeActive == "Revenge" && worldNumber % 2 == 0) {
        enemyHealth *= 10;
    } else if (game.global.challengeActive == "Mayhem") {
        let mayhemMult = game.challenges.Mayhem.getEnemyMult();
        enemyHealth *= mayhemMult;
    } else if (game.global.challengeActive == "Exterminate") {
        let extMult = game.challenges.Exterminate.getSwarmMult();
        enemyHealth *= extMult;
    } else if (game.global.challengeActive == "Duel") {
        if (game.challenges.Duel.enemyStacks < 20) enemyHealth *= game.challenges.Duel.healthMult;
    } else if (game.global.challengeActive == "Nurture") {
        if (map) enemyHealth *= 10;
        else enemyHealth *= 2;
        enemyHealth *= game.buildings.Laboratory.getEnemyMult();
    } else if (game.global.challengeActive == "Alchemy") {
        let statMult = alchObj.getEnemyStats(map, voidMap) + 1;
        enemyHealth *= statMult;
    } else if (((game.global.challengeActive == "Mayhem" && cellNumber == 99 && !map)
        || game.global.challengeActive == "Pandemonium")) {
        if (cellNumber == 99 && !map) enemyHealth *= game.challenges[game.global.challengeActive].getBossMult();
        else enemyHealth *= game.challenges.Pandemonium.getPandMult();
    } else if (game.global.challengeActive == "Storm" && !map) {
        enemyHealth *= game.challenges.Storm.getHealthMult();
    }
    return Math.floor(enemyHealth);
}

const getCurrentState = () => {
    let currentMap = getCurrentMapObject();
    let doingMaps = game.global.mapsActive;
    let selectingMaps = game.global.preMapsActive;
    let raidingMaps = currentMap?.level > game.global.world;
    let advancingWorld = !(doingMaps || selectingMaps);
    return {
        advancingWorld: advancingWorld,
        doingMaps: doingMaps,
        selectingMaps: selectingMaps,
        doingVoids: doingMaps && currentMap?.location === "Void",
        raidingMaps: raidingMaps,
        raidingBW: raidingMaps && currentMap?.location === "Bionic",
        raidingPrestige: raidingMaps && game.mapUnlocks[game.global.mapGridArray[game.global.mapGridArray.length - 1]]?.prestige,
        doingSpire: advancingWorld && game.global.spireActive && checkIfSpireWorld()
    }
}

const getCurrentGoals = () => {
    let doMaps = game.options.menu.mapAtZone.enabled === 0;
    return {
        buildBuildings: !game.global.autoStructureSetting.enabled,
        buildStorage: !game.global.autoStorage,
        hireJobs: !game.global.autoJobsSetting.enabled,
        breedTrimps: game.global.GeneticistassistSetting === -1,
        prestigeGear: game.global.autoPrestiges === 0,
        upgradeGear: game.global.autoUpgrades === false,
        doMaps: doMaps,
        farmForSpire: doMaps,
        farmMapBonus: doMaps,
        farmForVoids: doMaps,
        doPrestige: doMaps,
        doVoids: doMaps,
        doFarm: doMaps,
        raidPrestige: doMaps,
        raidBW: doMaps,
        buyGoldenUpgrades: game.global.autoGolden === 0
    }
}

/** Get enemy for calculations **/
let strongestEnemyCache = {
    map: {},
    void: {},
    world: {},
    spire: {}
}

const guessStrongestEnemy = (where = "world", what = "health") => {
    let strongestEnemy = {
        attack: -1,
        health: -1,
        level: -1,
        maxHealth: -1,
        name: "",
        valid: false
    };
    // Check if we can find on cache
    let mapItem = game.global.mapsOwnedArray.find(item => item.id === where);
    let mapCache;
    let isMap = where.includes("map");
    if (isMap) {
        if (mapItem.location === "Void") {
            mapCache = strongestEnemyCache.void;
        } else {
            mapCache = strongestEnemyCache.map;
        }
        if (Object.prototype.hasOwnProperty.call(mapCache, what)) {
            strongestEnemy = mapCache[what];
        }
    } else if (Object.prototype.hasOwnProperty.call(strongestEnemyCache[where], what)) {
        strongestEnemy = strongestEnemyCache[where][what];
    }
    if (!strongestEnemy.valid) {
        // Nothing on cache
        if (isMap) {
            // Maps are randomly generated on start so just assume last cell
            let mapSize;
            let enemyName;
            let difficulty;
            let isVoid = mapItem.location === "Void";
            if (isVoid) {
                mapSize = 100;
                enemyName = "Cthulimp";
                difficulty = game.global.world <= 59 ? 2.5 : 4.5;
            } else {
                mapSize = game.talents.mapLoot2.purchased ? 20 : 25;
                enemyName = "Snimp";
                difficulty = 0.75;
            }
            if (game.global.challengeActive === "Mapocalypse") {
                difficulty += 3;
            }
            strongestEnemy.attack = getEnemyMaxAttack(game.global.world, mapSize, enemyName, difficulty, true, isMap, isVoid);
            strongestEnemy.health = getEnemyMaxHealth(game.global.world, mapSize, enemyName, true, difficulty, isMap, isVoid, true);
            strongestEnemy.valid = true;
            mapCache["attack"] = strongestEnemy;
            mapCache["health"] = strongestEnemy;
        } else {
            // World is static so get highlights
            let lastCorruptStrongCell = game.global.gridArray.filter(cell => cell.corrupted === "corruptStrong").reduce((a,b) => b, undefined);
            let lastCorruptToughCell = game.global.gridArray.filter(cell => cell.corrupted === "corruptTough").reduce((a,b) => b, undefined);
            let lastHealthyStrongCell = game.global.gridArray.filter(cell => cell.corrupted === "healthyStrong").reduce((a,b) => b, undefined);
            let lastHealthyToughCell = game.global.gridArray.filter(cell => cell.corrupted === "healthyTough").reduce((a,b) => b, undefined);
            let lastCell = game.global.gridArray.reduce((a,b) => b, undefined);
            let enemies = [lastCorruptStrongCell, lastCorruptToughCell, lastHealthyStrongCell, lastHealthyToughCell, lastCell].filter(item => item !== undefined).map(item => JSON.parse(JSON.stringify(item)));
            if (what === "health") {
                enemies.filter(enemy => enemy.health === -1).forEach(enemy => enemy.health = getEnemyMaxHealth(game.global.world, enemy.level, enemy.name, enemy.mutation === "Corruption" || enemy.mutation === "Healthy", 1.0, false, false, true, undefined, where === "spire"))
                let enemy = enemies.reduce((acc, item) => item.health > acc.health ? item : acc);
                strongestEnemy.health = enemy.health;
            } else {
                enemies.filter(enemy => enemy.attack === -1).forEach(enemy => enemy.attack = getEnemyMaxAttack(game.global.world, enemy.level, enemy.name, 1.0, enemy.mutation === "Corruption" || enemy.mutation === "Healthy", false, false, where === "spire"))
                let enemy = enemies.reduce((acc, item) => item.attack > acc.attack ? item : acc);
                strongestEnemy.attack = enemy.attack;
            }
            strongestEnemy.valid = true;
            strongestEnemyCache[where][what] = strongestEnemy;
        }
    }
    return strongestEnemy;
}

function getCurrentEnemy(a){a||(a=1);var b;return game.global.mapsActive||game.global.preMapsActive?game.global.mapsActive&&!game.global.preMapsActive&&('undefined'==typeof game.global.mapGridArray[game.global.lastClearedMapCell+a]?b=game.global.mapGridArray[game.global.gridArray.length-1]:b=game.global.mapGridArray[game.global.lastClearedMapCell+a]):'undefined'==typeof game.global.gridArray[game.global.lastClearedCell+a]?b=game.global.gridArray[game.global.gridArray.length-1]:b=game.global.gridArray[game.global.lastClearedCell+a],b}
function getCorruptedCellsNum(){for(var a,b=0,c=0;c<game.global.gridArray.length-1;c++)a=game.global.gridArray[c],"Corruption"==a.mutation&&b++;return b}
function getCorruptScale(a){return"attack"===a?mutations.Corruption.statScale(3):"health"===a?mutations.Corruption.statScale(10):void 0}
//function getPotencyMod(a){var b=game.resources.trimps.potency;return 0<game.upgrades.Potency.done&&(b*=Math.pow(1.1,game.upgrades.Potency.done)),0<game.buildings.Nursery.owned&&(b*=Math.pow(1.01,game.buildings.Nursery.owned)),0<game.unlocks.impCount.Venimp&&(b*=Math.pow(1.003,game.unlocks.impCount.Venimp)),game.global.brokenPlanet&&(b/=10),b*=1+game.portal.Pheromones.level*game.portal.Pheromones.modifier,a||(a=0),0<game.jobs.Geneticist.owned&&(b*=Math.pow(.98,game.jobs.Geneticist.owned+a)),game.unlocks.quickTrimps&&(b*=2),'Daily'==game.global.challengeActive&&('undefined'!=typeof game.global.dailyChallenge.dysfunctional&&(b*=dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength)),'undefined'!=typeof game.global.dailyChallenge.toxic&&(b*=dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength,game.global.dailyChallenge.toxic.stacks))),'Toxicity'==game.global.challengeActive&&0<game.challenges.Toxicity.stacks&&(b*=Math.pow(game.challenges.Toxicity.stackMult,game.challenges.Toxicity.stacks)),'slowBreed'==game.global.voidBuff&&(b*=0.2),b=calcHeirloomBonus('Shield','breedSpeed',b),b}
//function getBreedTime(a,b){var c=game.resources.trimps,d=c.realMax(),e=getPotencyMod(b);e=1+e/10;var f=log10((d-c.employed)/(c.owned-c.employed))/log10(e);if(f/=10,a)return parseFloat(f.toFixed(1));var g=game.portal.Coordinated.level?game.portal.Coordinated.currentSend:c.maxSoldiers,h=log10((d-c.employed)/(d-g-c.employed))/log10(e);return h/=10,parseFloat(h.toFixed(1))}
function isBuildingInQueue(a){for(var c in game.global.buildingsQueue)if(game.global.buildingsQueue[c].includes(a))return!0}
//function getArmyTime(){var a=game.resources.trimps.owned-game.resources.trimps.employed,b=game.resources.trimps.realMax()<=game.resources.trimps.owned+1,c=game.portal.Coordinated.level?game.portal.Coordinated.currentSend:game.resources.trimps.maxSoldiers,d=getPotencyMod();return c/(a*d)}
function setScienceNeeded(){for(var a in scienceNeeded=0,upgradeList)if(a=upgradeList[a],game.upgrades[a].allowed>game.upgrades[a].done){if(1==game.global.world&&1e3>=game.global.totalHeliumEarned&&a.startsWith("Speed"))continue;scienceNeeded+=getScienceCostToUpgrade(a)}needGymystic&&(scienceNeeded+=getScienceCostToUpgrade("Gymystic"))}
function RsetScienceNeeded(){for(var a in RscienceNeeded=0,RupgradeList)if(a=RupgradeList[a],game.upgrades[a].allowed>game.upgrades[a].done){if(1==game.global.world&&1e3>=game.global.totalRadonEarned&&a.startsWith("Speed"))continue;RscienceNeeded+=getScienceCostToUpgrade(a)}}
// Difficulty is not implemented in this method but everyone don't mind to use it apparently. Probably copy paste code
function RgetEnemyMaxAttack(world, level, name, difficulty = 1.0, scale = 1.0, round = true) {
	var amt = 0;
	var attackBase = (game.global.universe == 2) ? 750 : 50;
	amt += attackBase * Math.sqrt(world) * Math.pow(3.27, world / 2);
	amt -= 10;
	if (world == 1) {
		amt *= 0.35;
		amt = (amt * 0.20) + ((amt * 0.75) * (level / 100));
	} else if (world == 2) {
		amt *= 0.5;
		amt = (amt * 0.32) + ((amt * 0.68) * (level / 100));
	} else if (world < 60)
		amt = (amt * 0.375) + ((amt * 0.7) * (level / 100));
	else {
		amt = (amt * 0.4) + ((amt * 0.9) * (level / 100));
		amt *= Math.pow(1.15, world - 59);
	}
	if (world < 60) amt *= 0.85;
	if (world > 6 && game.global.mapsActive) amt *= 1.1;
	amt *= game.badGuys[name].attack;
	if (game.global.universe == 2) {
		var part1 = (world > 40) ? 40 : world;
		var part2 = (world > 60) ? 20 : world - 40;
		var part3 = (world - 60);
		if (part2 < 0) part2 = 0;
		if (part3 < 0) part3 = 0;
		amt *= Math.pow(1.5, part1);
		amt *= Math.pow(1.4, part2);
		amt *= Math.pow(1.32, part3);
	}
	return round ? Math.floor(amt) : amt;
}

function RgetEnemyMaxHealth(world, level, name = "Grimp", round = true) {
			if (!level)
				level = 30;
			var amt = 0;
			var healthBase = (game.global.universe == 2) ? 10e7 : 130;
			amt += healthBase * Math.sqrt(world) * Math.pow(3.265, world / 2);
			amt -= 110;
			if (world == 1 || world == 2 && level < 10){
				amt *= 0.6;
			amt = (amt * 0.25) + ((amt * 0.72) * (level / 100));
			}
			else if (world < 60)
				amt = (amt * 0.4) + ((amt * 0.4) * (level / 110));
			else{
				amt = (amt * 0.5) + ((amt * 0.8) * (level / 100));
				amt *= Math.pow(1.1, world - 59);
			}
			if (world < 60) amt *= 0.75;
			if (world > 5 && game.global.mapsActive) amt *= 1.1;
			amt *= game.badGuys[name].health;
			if (game.global.universe == 2){
				var part1 = (world > 60) ? 60 : world;
				var part2 = (world - 60);
				if (part2 < 0) part2 = 0;
				amt *= Math.pow(1.4, part1);
				amt *= Math.pow(1.32, part2);
			}
			return round ? Math.floor(amt) : amt;
}
function getPotencyMod(howManyMoreGenes) {
    var potencyMod = game.resources.trimps.potency;
    //Add potency (book)
    if (game.upgrades.Potency.done > 0) potencyMod *= Math.pow(1.1, game.upgrades.Potency.done);
    //Add Nurseries
    if (game.buildings.Nursery.owned > 0) potencyMod *= Math.pow(1.01, game.buildings.Nursery.owned);
    //Add Venimp
    if (game.unlocks.impCount.Venimp > 0) potencyMod *= Math.pow(1.003, game.unlocks.impCount.Venimp);
    //Broken Planet
    if (game.global.brokenPlanet) potencyMod /= 10;
    //Pheromones
    potencyMod *= 1+ (game.portal.Pheromones.level * game.portal.Pheromones.modifier);
    //Geneticist
    if (!howManyMoreGenes) howManyMoreGenes=0;
    if (game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(.98, game.jobs.Geneticist.owned + howManyMoreGenes);
    //Quick Trimps
    if (game.unlocks.quickTrimps) potencyMod *= 2;
    //Daily mods
    if (game.global.challengeActive == "Daily"){
        if (typeof game.global.dailyChallenge.dysfunctional !== 'undefined'){
            potencyMod *= dailyModifiers.dysfunctional.getMult(game.global.dailyChallenge.dysfunctional.strength);
        }
        if (typeof game.global.dailyChallenge.toxic !== 'undefined'){
            potencyMod *= dailyModifiers.toxic.getMult(game.global.dailyChallenge.toxic.strength, game.global.dailyChallenge.toxic.stacks);
        }
    }
    if (game.global.challengeActive == "Toxicity" && game.challenges.Toxicity.stacks > 0){
        potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);
    }
    if (game.global.voidBuff == "slowBreed"){
        potencyMod *= 0.2;
    }
    potencyMod = calcHeirloomBonus("Shield", "breedSpeed", potencyMod);
    return potencyMod;
}

function getArmyTime() {
    var breeding = (game.resources.trimps.owned - game.resources.trimps.employed);
    var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
    var adjustedMax = (game.portal.Coordinated.level) ? game.portal.Coordinated.currentSend : game.resources.trimps.maxSoldiers;
    var potencyMod = getPotencyMod();
    var tps = breeding * potencyMod;
    var addTime = adjustedMax / tps;
    return addTime;
}
