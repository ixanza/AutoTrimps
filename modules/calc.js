var critCC = 1;
var critDD = 1;
var trimpAA = 1;

//Helium

function getTrimpAttack(stance) {
    let attack = game.global.soldierCurrentAttack;
    if (!stance && game.global.formation !== 0 && game.global.formation != 5) {
        attack /= (game.global.formation == 2) ? 4 : 0.5;
    }
    if (game.global.difs.attack !== 0) {
        let attackTemp = game.resources.trimps.maxSoldiers * game.global.difs.attack * ((game.portal.Power.modifier * getPerkLevel("Power")) + 1);
        if (mutations.Magma.active()) {
            attackTemp *= mutations.Magma.getTrimpDecay();
        }
        if (getPerkLevel("Power_II")) attackTemp *= (1 + (game.portal.Power_II.modifier * getPerkLevel("Power_II")));
        if (stance && game.global.formation !== 0 && game.global.formation != 5) {
            attackTemp *= (game.global.formation == 2) ? 4 : 0.5;
        }
        attack += attackTemp;
    }
    return attack;
}

function calcOurHealth(stance) {
    let health = game.global.soldierHealthMax;
    if (!stance && game.global.formation !== 0 && game.global.formation !== 5) {
        health /= (game.global.formation == 1) ? 4 : 0.5;
    }
    if (game.global.difs.health !== 0) {
        let healthTemp = game.resources.trimps.maxSoldiers * game.global.difs.health * ((game.portal.Toughness.modifier * getPerkLevel("Toughness")) + 1);
        if (mutations.Magma.active()) {
            healthTemp *= mutations.Magma.getTrimpDecay();
        }
        if (getPerkLevel("Toughness_II")) healthTemp *= (1 + (game.portal.Toughness_II.modifier * getPerkLevel("Toughness_II")));
        if (getPerkLevel("Observation") && game.portal.Observation.trinkets > 0) healthTemp *= game.portal.Observation.getMult();
        if (getPerkLevel("Championism")) healthTemp *= game.portal.Championism.getMult();
        if (game.global.mayhemCompletions) healthTemp *= game.challenges.Mayhem.getTrimpMult();
        if (autoBattle.bonuses.Stats.level > 0 && game.global.universe == 2) healthTemp *= autoBattle.bonuses.Stats.getMult();
        if (game.global.challengeActive == "Alchemy") healthTemp *= alchObj.getPotionEffect("Potion of Strength");
        if (game.global.pandCompletions) healthTemp *= game.challenges.Pandemonium.getTrimpMult();
        if (game.talents.mapHealth.purchased && needToVoid) healthTemp *= 2;
        if (Fluffy.isRewardActive("healthy")) healthTemp *= 1.5;
        if (game.jobs.Geneticist.owned > 0) healthTemp *= Math.pow(1.01, game.global.lastLowGen);
        if (game.goldenUpgrades.Battle.currentBonus > 0) healthTemp *= game.goldenUpgrades.Battle.currentBonus + 1;
        if (game.global.universe == 2 && game.buildings.Smithy.owned > 0) healthTemp *= game.buildings.Smithy.getMult();
        if (game.global.challengeActive == "Insanity") healthTemp *= game.challenges.Insanity.getHealthMult();
        if (getPerkLevel("Resilience") > 0) healthTemp *= Math.pow(game.portal.Resilience.modifier + 1, getPerkLevel("Resilience"));
        if (game.global.challengeActive == "Daily" && typeof game.global.dailyChallenge.pressure !== 'undefined') healthTemp *= dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);
        if (stance && game.global.formation !== 0 && game.global.formation !== 5) {
            healthTemp *= (game.global.formation == 1) ? 4 : 0.5;
        }
        if (game.global.totalSquaredReward > 0)
            healthTemp *= ((game.global.totalSquaredReward / 100) + 1);
        if (game.global.challengeActive == "Balance") {
            healthTemp *= game.challenges.Balance.getHealthMult();
        }
        if (game.global.challengeActive == "Revenge") healthTemp *= game.challenges.Revenge.getMult();
        if (game.global.challengeActive == "Life") {
            healthTemp *= game.challenges.Life.getHealthMult();
        }
        if (game.global.challengeActive == "Duel" && game.challenges.Duel.trimpStacks < 20) healthTemp *= game.challenges.Duel.healthMult;
        if (game.global.challengeActive == "Wither") {
            healthTemp *= game.challenges.Wither.getTrimpHealthMult();
        }
        if (game.challenges.Nurture.boostsActive()) healthTemp *= game.challenges.Nurture.getStatBoost();
        healthTemp = calcHeirloomBonus("Shield", "trimpHealth", healthTemp);
        if (game.jobs.Amalgamator.owned > 0)
            healthTemp *= game.jobs.Amalgamator.getHealthMult();
        if (game.global.challengeActive == "Berserk") {
            healthTemp *= game.challenges.Berserk.getHealthMult();
        }
        health += healthTemp;
    }
    return health;
}

function highDamageShield() {
	if (game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name == getPageSetting('highdmg')) {
		critCC = getPlayerCritChance();
		critDD = getPlayerCritDamageMult();
		trimpAA = (calcHeirloomBonus("Shield", "trimpAttack", 1, true)/100);
	}
	if (game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name == getPageSetting('dhighdmg')) {
		critCC = getPlayerCritChance();
		critDD = getPlayerCritDamageMult();
		trimpAA = (calcHeirloomBonus("Shield", "trimpAttack", 1, true)/100);
	}
}

function getCritMulti(high) {

    var critChance = getPlayerCritChance();
    var CritD = getPlayerCritDamageMult();

    if (
	high &&
	(getPageSetting('AutoStance') == 3 && getPageSetting('highdmg') != undefined && game.global.challengeActive != "Daily") ||
	(getPageSetting('use3daily') == true && getPageSetting('dhighdmg') != undefined && game.global.challengeActive == "Daily")
       ) {
	 highDamageShield();
	 critChance = critCC;
	 CritD = critDD;
       }

    var lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
    var highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
    var highTierChance = critChance - Math.floor(critChance)

    return ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * CritD
}

function calcOurBlock(stance) {
    let block = game.global.soldierCurrentBlock;
    if (!stance && game.global.formation !== 0 && game.global.formation !== 5) {
        block /= (game.global.formation == 3) ? 4 : 0.5;
    }
    if (game.global.difs.block !== 0) {
        let blockTemp = (game.resources.trimps.maxSoldiers * game.global.difs.block * ((game.global.difs.trainers * (calcHeirloomBonus("Shield", "trainerEfficiency", game.jobs.Trainer.modifier) / 100)) + 1));
        if (stance && game.global.formation !== 0 && game.global.formation !== 5) {
            blockTemp *= (game.global.formation == 3) ? 4 : 0.5;
        }
        blockTemp = calcHeirloomBonus("Shield", "trimpBlock", blockTemp);
        block += blockTemp;
    }
    return block;
}

function calcOurDmg(minMaxAvg, incStance, incFlucts, crit = true, map = false) {
    if (needToVoid) map = true;
    let number = getTrimpAttack(incStance);
    let fluctuation = .2;
    let maxFluct = -1;
    let minFluct = -1;
    if (getPerkLevel("Equality")) number *= game.portal.Equality.getMult();
    if (getPerkLevel("Observation") > 0 && game.portal.Observation.trinkets > 0) {
        number *= game.portal.Observation.getMult();
    }
    if (game.global.universe == 2 && game.buildings.Smithy.owned > 0){
        number *= game.buildings.Smithy.getMult();
    }
    if (game.global.challengeActive == "Unbalance"){
        number *= game.challenges.Unbalance.getAttackMult();
    }
    if (game.jobs.Amalgamator.owned > 0){
        number *= game.jobs.Amalgamator.getDamageMult();
    }
    if (game.challenges.Electricity.stacks > 0) { //Electricity
        number *= (1 - (game.challenges.Electricity.stacks * 0.1));
    }
    let antiStacks = game.global.antiStacks;
    if (getPageSetting("45stacks")) {
        antiStacks = game.talents.patience.purchased ? 45 : 30;
    }
    if (antiStacks > 0) {
        number *= ((antiStacks * getPerkLevel("Anticipation") * game.portal.Anticipation.modifier) + 1);
    }
    if (game.global.mapBonus > 0 && !needToVoid && !map){
        let mapBonus = game.global.mapBonus;
        if (game.talents.mapBattery.purchased && mapBonus == 10) mapBonus *= 2;
        number *= ((mapBonus * .2) + 1);
    }
    if (game.global.achievementBonus > 0){
        number *= (1 + (game.global.achievementBonus / 100));
    }
    if (game.global.challengeActive == "Discipline" || game.global.challengeActive == "Unlucky"){
        fluctuation = .995;
    }
    else if (getPerkLevel("Range") > 0){
        minFluct = fluctuation - (.02 * getPerkLevel("Range"));
    }
    if (game.global.challengeActive == "Decay" || game.global.challengeActive == "Melt"){
        let challenge = game.challenges[game.global.challengeActive];
        number *= 5;
        number *= Math.pow(challenge.decayValue, challenge.stacks);
    }
    if (game.global.roboTrimpLevel > 0){
        number *= ((0.2 * game.global.roboTrimpLevel) + 1);
    }
    if (game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)){
        number *= 1.5;
    }
    if (game.goldenUpgrades.Battle.currentBonus > 0){
        number *= game.goldenUpgrades.Battle.currentBonus + 1;
    }
    if (needToVoid && game.talents.voidPower.purchased){
        number *= ((game.talents.voidPower.getTotalVP() / 100) + 1);
    }
    if (game.global.totalSquaredReward > 0){
        number *= ((game.global.totalSquaredReward / 100) + 1)
    }
    if (getEmpowerment() == "Ice"){
        if (getPageSetting("fullice")) {
            number *= Fluffy.isRewardActive('naturesWrath') ? 3 : 2;
        } else {
            number *= 1 + game.empowerments.Ice.getDamageModifier();
        }
    }
    if (game.talents.magmamancer.purchased){
        number *= game.jobs.Magmamancer.getBonusPercent();
    }
    if (game.talents.stillRowing2.purchased){
        number *= ((game.global.spireRows * 0.06) + 1);
    }
    if (game.talents.healthStrength.purchased && mutations.Healthy.active()){
        number *= ((0.15 * mutations.Healthy.cellCount()) + 1);
    }
    if (needToVoid && game.talents.voidMastery.purchased){
        number *= 5;
    }
    if (game.talents.scry.purchased && !needToVoid && !map){
        let corruptedCells = game.global.gridArray.reduce((acc, item) => acc + (item.corrupted != null ? 1 : 0), 0);
        number *= (1 + 0.01 * corruptedCells);
    }
    if (game.talents.daily.purchased && game.global.challengeActive == "Daily"){
        number *= 1.5;
    }
    if (game.global.sugarRush > 0){
        number *= sugarRush.getAttackStrength();
    }
    if (game.global.challengeActive == "Life") {
        number *= game.challenges.Life.getHealthMult();
    }
    if (game.singleRunBonuses.sharpTrimps.owned){
        number *= 1.5;
    }
    if (playerSpireTraps.Strength.owned){
        let strBonus = playerSpireTraps.Strength.getWorldBonus();
        number *= (1 + (strBonus / 100));
    }
    if (getUberEmpowerment() == "Poison"){
        number *= 3;
    }
    if (Fluffy.isRewardActive('voidSiphon') && game.stats.totalVoidMaps.value){
        number *= (1 + (game.stats.totalVoidMaps.value * 0.05));
    }
    if (getPerkLevel("Tenacity")){
        number *= game.portal.Tenacity.getMult();
    }
    if (getPerkLevel("Hunger")){
        number *= game.portal.Hunger.getMult();
    }
    if (getPerkLevel("Frenzy") && game.portal.Frenzy.frenzyStarted != -1){
        number *= game.portal.Frenzy.getAttackMult();
    }
    if (getPerkLevel("Championism")) number *= game.portal.Championism.getMult();
    if (game.talents.herbalist.purchased){
        number *= game.talents.herbalist.getBonus();
    }
    if (game.global.mayhemCompletions){
        number *= game.challenges.Mayhem.getTrimpMult();
    }
    if (autoBattle.bonuses.Stats.level > 0 && game.global.universe == 2) number *= autoBattle.bonuses.Stats.getMult();
    if (game.global.challengeActive == "Alchemy") number *= alchObj.getPotionEffect("Potion of Strength");

    if (game.global.pandCompletions){
        number *= game.challenges.Pandemonium.getTrimpMult();
    }
    if (game.global.challengeActive == "Daily"){
        if (typeof game.global.dailyChallenge.minDamage !== 'undefined'){
            if (minFluct == -1) minFluct = fluctuation;
            minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
        }
        if (typeof game.global.dailyChallenge.maxDamage !== 'undefined'){
            if (maxFluct == -1) maxFluct = fluctuation;
            maxFluct += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
        }
        if (typeof game.global.dailyChallenge.weakness !== 'undefined'){
            number *= dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
        }
        if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1)){
            number *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
        }
        if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0)){
            number *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
        }
        if (typeof game.global.dailyChallenge.rampage !== 'undefined'){
            number *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
        }
    }
    if (game.global.challengeActive == "Revenge") number *= game.challenges.Revenge.getMult();
    if (game.global.challengeActive == "Duel" && game.challenges.Duel.trimpStacks > 50) number *= 3;
    if (game.global.challengeActive == "Quest") number *= game.challenges.Quest.getAttackMult();
    if (game.global.challengeActive == "Quagmire") number *= game.challenges.Quagmire.getExhaustMult();
    if (game.global.challengeActive == "Archaeology") number *= game.challenges.Archaeology.getStatMult("attack");
    if (game.global.challengeActive == "Storm" && needToVoid) number *= game.challenges.Storm.getMapMult();
    if (game.global.challengeActive == "Berserk") number *= game.challenges.Berserk.getAttackMult();
    if (game.challenges.Nurture.boostsActive()) number *= game.challenges.Nurture.getStatBoost();
    number = calcHeirloomBonus("Shield", "trimpAttack", number);
    if (Fluffy.isActive()){
        number *= Fluffy.getDamageModifier();
    }
    let poisonDamage = 0;
    if (getPageSetting("addpoison") && getEmpowerment() == "Poison" && !map) {
        poisonDamage += game.empowerments.Poison.getDamage()
    }

    let min = number;
    let max = number;
    let avg = number;

    if (crit) {
        min *= (getCritMulti(false) * 0.8);
        avg *= getCritMulti(false);
        max *= (getCritMulti(false) * 1.2);
    }

    if (incFlucts) {
        if (minFluct > 1) minFluct = 1;
        if (maxFluct == -1) maxFluct = fluctuation;
        if (minFluct == -1) minFluct = fluctuation;

        min *= (1 - minFluct);
        max *= (1 + maxFluct);
        avg *= 1 + (maxFluct - minFluct) / 2;
    }

    if (minMaxAvg == "min") return min + poisonDamage;
    else if (minMaxAvg == "max") return max + poisonDamage;
    else if (minMaxAvg == "avg") return avg + poisonDamage;
}

function calcSpire(cell, name, what) {
	var exitCell = cell;
	if (game.global.challengeActive != "Daily" && isActiveSpireAT() && getPageSetting('ExitSpireCell') > 0 && getPageSetting('ExitSpireCell') <= 100)
		exitCell = (getPageSetting('ExitSpireCell') - 1);
	if (game.global.challengeActive == "Daily" && disActiveSpireAT() && getPageSetting('dExitSpireCell') > 0 && getPageSetting('dExitSpireCell') <= 100)
		exitCell = (getPageSetting('dExitSpireCell') - 1);
	var enemy = cell == 99 ? (exitCell == 99 ? game.global.gridArray[99].name : "Snimp") : name;
	return getSpireStats(exitCell, enemy, what)
}

function calcBadGuyDmg(enemy, daily, maxormin, disableFlucts) {
    // Find enemy
    let number;
    let currentGoals = getCurrentGoals();
    let isVoid = currentGoals.doVoids;
    let currentState = getCurrentState();
    let isSpire = currentState.doingSpire;
    let isRaiding = currentState.raidingMaps;
    if (!enemy) {
        let strongestEnemy = guessStrongestEnemyStat(isRaiding ? "map" : isVoid ? "void" : isSpire ? "spire" : "world", "attack");
        number = strongestEnemy.stat;
        // Dynamic stuff
        if (game.global.challengeActive == "Mayhem") {
            let mayhemMult = game.challenges.Mayhem.getEnemyMult();
            number *= mayhemMult;
        } else if (game.global.challengeActive == "Exterminate") {
            let extMult = game.challenges.Exterminate.getSwarmMult();
            number *= extMult;
        } else if (game.global.challengeActive == "Storm" && !isVoid) {
            number *= game.challenges.Storm.getAttackMult();
        }
    } else {
        number = enemy.attack;
    }
    // Calculate
    let cell;
    if (game.global.mapsActive) {
        cell = game.global.mapGridArray[game.global.lastClearedMapCell + 1];
    } else {
        cell = game.global.gridArray[game.global.lastClearedCell + 1];
    }
    let fluctuation = .2;
    let maxFluct = -1;
    let minFluct = -1;
    if (getPerkLevel("Equality")) number *= game.portal.Equality.getMult();
    if (game.global.universe == 2) fluctuation = 0.5;
    if (game.global.challengeActive) {
        if (game.global.challengeActive == "Nurture") {
            number *= 2;
            number *= game.buildings.Laboratory.getEnemyMult();
        } else if (game.global.challengeActive == "Coordinate") {
            number *= getBadCoordLevel();
        } else if (game.global.challengeActive == "Meditate") {
            number *= 1.5;
        } else if (game.global.challengeActive == "Nom" && typeof cell.nomStacks !== 'undefined') {
            number *= Math.pow(1.25, cell.nomStacks);
        } else if (game.global.challengeActive == "Watch") {
            number *= 1.25;
        } else if (game.global.challengeActive == "Lead") {
            number *= (1 + (Math.min(game.challenges.Lead.stacks, 200) * 0.04));
        } else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) {
            number *= 10;
        } else if (game.global.challengeActive == "Corrupted") {
            number *= 3;
        }
        if (daily && game.global.challengeActive == "Daily") {
            if (typeof game.global.dailyChallenge.badStrength !== 'undefined') {
                number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
            }
            if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && (isVoid || isRaiding)) {
                number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
            }
            if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined') {
                number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks)
            }
            if (typeof game.global.dailyChallenge.empower !== 'undefined' && !(isVoid || isRaiding)) {
                number *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
            }
        }
        if (game.global.challengeActive == "Duel" && game.challenges.Duel.enemyStacks > 50) number *= 3;
        if (game.global.challengeActive == "Wither") number *= game.challenges.Wither.getEnemyAttackMult();
        if (game.global.challengeActive == "Archaeology") number *= game.challenges.Archaeology.getStatMult("enemyAttack");
        if (game.global.challengeActive == "Mayhem") number *= game.challenges.Mayhem.getBossMult();
        if (game.global.challengeActive == "Pandemonium") {
            if (!needToVoid) number *= game.challenges.Pandemonium.getBossMult();
            else number *= game.challenges.Pandemonium.getPandMult();
        }
    }
    if (game.global.usingShriek) {
        number *= game.mapUnlocks.roboTrimp.getShriekValue();
    }
    if (getEmpowerment() == "Ice") {
        number *= game.empowerments.Ice.getCombatModifier();
    }
    if (game.global.world >= getObsidianStart() && !(isVoid || isRaiding)) number = Infinity;
    if (!disableFlucts) {
        if (minFluct > 1) minFluct = 1;
        if (maxFluct == -1) maxFluct = fluctuation;
        if (minFluct == -1) minFluct = fluctuation;
        let min = Math.floor(number * (1 - minFluct));
        let max = Math.ceil(number + (number * maxFluct));
        return maxormin ? max : min;
    } else return number;
}

function calcEnemyHealth() {
    let currentGoals = getCurrentGoals();
    let isVoid = currentGoals.doVoids;
    let currentState = getCurrentState();
    let isSpire = currentState.doingSpire;
    let isRaiding = currentState.raidingMaps;

    let strongestEnemy = guessStrongestEnemyStat(isRaiding ? "map" : isVoid ? "void" : isSpire ? "spire" : "world", "health");
    let enemyHealth = strongestEnemy.stat;
    // Dynamic Stuff
    if (game.global.challengeActive == "Daily") {
        if (typeof game.global.dailyChallenge.empower !== 'undefined') {
            if (!isVoid) enemyHealth *= dailyModifiers.empower.getMult(game.global.dailyChallenge.empower.strength, game.global.dailyChallenge.empower.stacks);
        }
    } else if (game.global.challengeActive == "Lead" && (game.challenges.Lead.stacks > 0)) {
        enemyHealth *= (1 + (Math.min(game.challenges.Lead.stacks, 200) * 0.04));
    } else if (game.global.challengeActive == "Mayhem") {
        let mayhemMult = game.challenges.Mayhem.getEnemyMult();
        enemyHealth *= mayhemMult;
    } else if (game.global.challengeActive == "Duel") {
        if (game.challenges.Duel.enemyStacks < 20) enemyHealth *= game.challenges.Duel.healthMult;
    } else if (game.global.challengeActive == "Nurture") {
        enemyHealth *= game.buildings.Laboratory.getEnemyMult();
    } else if (game.global.challengeActive == "Storm" && !(isVoid || isRaiding)) {
        enemyHealth *= game.challenges.Storm.getHealthMult();
    }
    let cellNumber = enemyHealth.level;
    if (((game.global.challengeActive == "Mayhem" && cellNumber == 99 && !(isVoid || isRaiding)) || game.global.challengeActive == "Pandemonium")) {
        if (cellNumber == 99 && !isVoid) enemyHealth *= game.challenges[game.global.challengeActive].getBossMult();
        else enemyHealth *= game.challenges.Pandemonium.getPandMult();
    }
    return enemyHealth;
}

function calcHDratio(mapLevel) {
    let ourBaseDamage = calcOurDmg("avg", false, true);
    //Shield
    highDamageShield();
    if (getPageSetting('AutoStance') == 3 && getPageSetting('highdmg') != undefined && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg')) {
	ourBaseDamage /= getCritMulti(false);
        ourBaseDamage *= trimpAA;
	ourBaseDamage *= getCritMulti(true);
    }
    if (getPageSetting('use3daily') == true && getPageSetting('dhighdmg') != undefined && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg')) {
	ourBaseDamage /= getCritMulti(false);
        ourBaseDamage *= trimpAA;
	ourBaseDamage *= getCritMulti(true);
    }
    let enemyHealth;
    if (mapLevel) {
        enemyHealth = getEnemyMaxHealth(mapLevel, game.talents.mapLoot2.purchased ? 20 : 25, "Snimp", true, 0.75, true, false, true);
    } else {
        enemyHealth = calcEnemyHealth();
    }
    return enemyHealth / ourBaseDamage;
}

function calcCurrentStance() {
    if (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive &&
	(
	 (
	  (game.global.challengeActive != "Daily" && calcHDratio() < getPageSetting('WindStackingMinHD')) ||
	  (game.global.challengeActive == "Daily" && calcHDratio() < getPageSetting('dWindStackingMinHD'))
	 ) &&
	 (
	  (game.global.challengeActive != "Daily" && game.global.world >= getPageSetting('WindStackingMin')) ||
          (game.global.challengeActive == "Daily" && game.global.world >= getPageSetting('dWindStackingMin')))
         ) ||
	 (game.global.uberNature == "Wind" && getEmpowerment() == "Wind" && !game.global.mapsActive && checkIfLiquidZone() && getPageSetting('liqstack') == true)
	)
	{
	return 15;
    }
    else {

    //Base Calc
    var ehealth = 1;
    if (game.global.fighting) {
        ehealth = (getCurrentEnemy().maxHealth - getCurrentEnemy().health);
    }
    var attacklow = calcOurDmg("max", false, true);
    var attackhigh = calcOurDmg("max", false, true);

    //Heirloom Calc
    highDamageShield();
    if (getPageSetting('AutoStance') == 3 && getPageSetting('highdmg') != undefined && game.global.challengeActive != "Daily" && game.global.ShieldEquipped.name != getPageSetting('highdmg')) {
        attackhigh *= trimpAA;
	attackhigh *= getCritMulti(true);
    }
    if (getPageSetting('use3daily') == true && getPageSetting('dhighdmg') != undefined && game.global.challengeActive == "Daily" && game.global.ShieldEquipped.name != getPageSetting('dhighdmg')) {
        attackhigh *= trimpAA;
	attackhigh *= getCritMulti(true);
    }

    //Heirloom Switch
    if (ehealth > 0) {
        var hitslow = (ehealth / attacklow);
        var hitshigh = (ehealth / attackhigh);
        var stacks = 190;
        var usehigh = false;
	var stacksleft = 1;

        if (game.global.challengeActive != "Daily" && getPageSetting('WindStackingMax') > 0) {
            stacks = getPageSetting('WindStackingMax');
	}
        if (game.global.challengeActive == "Daily" && getPageSetting('dWindStackingMax') > 0) {
            stacks = getPageSetting('dWindStackingMax');
	}
	if (game.global.uberNature == "Wind") {
	    stacks += 100;
	}
	if (getEmpowerment() == "Wind") {
	    stacksleft = (stacks - game.empowerments.Wind.currentDebuffPower);
	}

	//Use High
        if (
            (getEmpowerment() != "Wind") ||
            (game.empowerments.Wind.currentDebuffPower >= stacks) ||
            (hitshigh >= stacksleft) ||
            (game.global.mapsActive) ||
            (game.global.challengeActive != "Daily" && game.global.world < getPageSetting('WindStackingMin')) ||
            (game.global.challengeActive == "Daily" && game.global.world < getPageSetting('dWindStackingMin'))
        ) {
            usehigh = true;
	}
        if (
                (getPageSetting('wsmax') > 0 && game.global.world >= getPageSetting('wsmax') && !game.global.mapsActive && getEmpowerment() == "Wind" && game.global.challengeActive != "Daily" && getPageSetting('wsmaxhd') > 0 && calcHDratio() < getPageSetting('wsmaxhd')) ||
                (getPageSetting('dwsmax') > 0 && game.global.world >= getPageSetting('dwsmax') && !game.global.mapsActive && getEmpowerment() == "Wind" && game.global.challengeActive == "Daily" && getPageSetting('dwsmaxhd') > 0 && calcHDratio() < getPageSetting('dwsmaxhd'))
        ) {
	    usehigh = false;
	}

	//Low
        if (!usehigh) {
            if (
                (game.empowerments.Wind.currentDebuffPower >= stacks) ||
                ((hitslow * 4) > stacksleft)
            ) {
                return 2;
	    }
            else if ((hitslow) > stacksleft) {
                return 0;
	    }
            else {
                return 1;
	    }

	//High
        } else if (usehigh) {
	    if (
                (getEmpowerment() != "Wind") ||
                (game.empowerments.Wind.currentDebuffPower >= stacks) ||
                ((hitshigh * 4) > stacksleft) ||
                (game.global.mapsActive) ||
                (game.global.challengeActive != "Daily" && game.global.world < getPageSetting('WindStackingMin')) ||
                (game.global.challengeActive == "Daily" && game.global.world < getPageSetting('dWindStackingMin'))
            ) {
                return 12;
	    }
            else if ((hitshigh) > stacksleft) {
                return 10;
	    }
            else {
                return 11;
	    }
        }
    }
    }
}

//Radon

function RgetCritMulti() {

    var critChance = getPlayerCritChance();
    var CritD = getPlayerCritDamageMult();

    var lowTierMulti = getMegaCritDamageMult(Math.floor(critChance));
    var highTierMulti = getMegaCritDamageMult(Math.ceil(critChance));
    var highTierChance = critChance - Math.floor(critChance)

    return ((1 - highTierChance) * lowTierMulti + highTierChance * highTierMulti) * CritD
}

function RcalcOurDmg(minMaxAvg, equality) {

    // Base + equipment
    var number = 6;
    var equipmentList = ["Dagger", "Mace", "Polearm", "Battleaxe", "Greatsword", "Arbalest"];
    for(var i = 0; i < equipmentList.length; i++){
        if(game.equipment[equipmentList[i]].locked !== 0) continue;
        var attackBonus = game.equipment[equipmentList[i]].attackCalculated;
        var level       = game.equipment[equipmentList[i]].level;
        number += attackBonus*level;
    }

    // Soldiers
    number *= game.resources.trimps.maxSoldiers;

    // Smithies
    number *= Math.pow(1.25, game.buildings.Smithy.owned);

    // Achievement bonus
    number *= 1 + (game.global.achievementBonus / 100);

    // Power
    number += (number * game.portal.Power.radLevel * game.portal.Power.modifier);

    // Map Bonus
    var mapBonus = game.global.mapBonus;
    if (game.talents.mapBattery.purchased && mapBonus == 10) mapBonus *= 2;
    number *= 1 + (mapBonus * .2);

    // Tenacity
    number *= game.portal.Tenacity.getMult();

    // Hunger
    number *= game.portal.Hunger.getMult();

    // Ob
    number *= game.portal.Observation.getMult();

    // Champ
    number *= game.portal.Championism.getMult();

    // Robotrimp
    number *= 1 + (0.2 * game.global.roboTrimpLevel);

    // Mayhem Completions
    number *= game.challenges.Mayhem.getTrimpMult();

    // Panda Completions
    number *= game.challenges.Pandemonium.getTrimpMult();

    // Heirloom
    number *= 1 + calcHeirloomBonus('Shield','trimpAttack',1,true) / 100;

    // Frenzy perk
    if (getPageSetting('Rcalcfrenzy') == true) {
        number *= 1 + (0.5 * game.portal.Frenzy.radLevel);
    }

    // Golden Upgrade
    number *= 1 + game.goldenUpgrades.Battle.currentBonus;

    // Herbalist Mastery
    if (game.talents.herbalist.purchased) {
        number *= game.talents.herbalist.getBonus();
    }

    // Challenge 2 or 3 reward
    number *= 1 + (game.global.totalSquaredReward / 100);

    // Fluffy Modifier
    number *= Fluffy.getDamageModifier();

    // Pspire Strength Towers
    number *= 1 + (playerSpireTraps.Strength.getWorldBonus() / 100);

    // Sharp Trimps
    if (game.singleRunBonuses.sharpTrimps.owned){
	number *= 1.5;
    }

    // Sugar rush event bonus
    if (game.global.sugarRush) {
	number *= sugarRush.getAttackStrength();
    }

    // Challenges
    if (game.global.challengeActive == "Melt") {number *= 5 * Math.pow(0.99, game.challenges.Melt.stacks);}
    if (game.global.challengeActive == "Unbalance") {number *= game.challenges.Unbalance.getAttackMult();}
    if (game.global.challengeActive == "Quagmire") {number *= game.challenges.Quagmire.getExhaustMult();}
    if (game.global.challengeActive == "Revenge") {number *= game.challenges.Revenge.getMult();}
    if (game.global.challengeActive == "Quest") {number *= game.challenges.Quest.getAttackMult();}
    if (game.global.challengeActive == "Archaeology") {number *= game.challenges.Archaeology.getStatMult("attack");}
    if (game.global.challengeActive == "Berserk") {number *= game.challenges.Berserk.getAttackMult();}
    if (game.challenges.Nurture.boostsActive() == true) {number *= game.challenges.Nurture.getStatBoost();}
    if (game.global.challengeActive == "Alchemy") { number *= alchObj.getPotionEffect("Potion of Strength");}

    // Dailies
    var minDailyMod = 1;
    var maxDailyMod = 1;
    if (game.global.challengeActive == "Daily") {
        // Legs for Days mastery
        if (game.talents.daily.purchased){
            number *= 1.5;
        }

        // Min damage reduced (additive)
	if (typeof game.global.dailyChallenge.minDamage !== 'undefined') {
	    minDailyMod -= dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
        }
        // Max damage increased (additive)
	if (typeof game.global.dailyChallenge.maxDamage !== 'undefined') {
	    maxDailyMod += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
        }

        // Minus attack on odd zones
	if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1)) {
	    number *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
        }
        // Bonus attack on even zones
	if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0)) {
	    number *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
        }
        // Rampage Daily mod
	if (typeof game.global.dailyChallenge.rampage !== 'undefined') {
	    number *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
	}
    }

    // AB
    number *= autoBattle.bonuses.Stats.getMult();

    // Equality
    if (getPageSetting('Rcalcmaxequality') == 1 && !equality) {
        number *= Math.pow(game.portal.Equality.modifier, game.portal.Equality.scalingCount);
    } else if (getPageSetting('Rcalcmaxequality') == 0 && !equality) {
        number *= game.portal.Equality.getMult();
    } else {
        number *= 1;
    }

    // Gamma Burst
    if (getHeirloomBonus("Shield", "gammaBurst") > 0 && (RcalcOurHealth() / (RcalcBadGuyDmg(null, RgetEnemyMaxAttack(game.global.world, 50, 'Snimp', 1.0))) >= 5)) {
        number *= 1 + (getHeirloomBonus("Shield", "gammaBurst") / 100) / 5;
    }

    // Average out crit damage
    number *= RgetCritMulti();

    switch (minMaxAvg) {
        case 'min':
            return number * (game.portal.Range.radLevel * 0.02 + 0.8) * minDailyMod;
        case 'max':
            return number * 1.2 * maxDailyMod;
        case 'avg':
            return number;
    }

    return number;
}

function RcalcOurHealth() {

    //Health

    var health = 50;
    if (game.resources.trimps.maxSoldiers > 0) {
        var equipmentList = ["Shield", "Boots", "Helmet", "Pants", "Shoulderguards", "Breastplate", "Gambeson"];
        for(var i = 0; i < equipmentList.length; i++){
            if(game.equipment[equipmentList[i]].locked !== 0) continue;
            var healthBonus = game.equipment[equipmentList[i]].healthCalculated;
            var level       = game.equipment[equipmentList[i]].level;
            health += healthBonus*level;
        }
    }
    health *= game.resources.trimps.maxSoldiers;
    if (game.buildings.Smithy.owned > 0) {
		health *= Math.pow(1.25, game.buildings.Smithy.owned);
    }
	//Antenna Array
	health *= game.buildings.Antenna.owned >= 10 ? game.jobs.Meteorologist.getExtraMult() : 1;
    if (game.portal.Toughness.radLevel > 0) {
        health *= ((game.portal.Toughness.radLevel * game.portal.Toughness.modifier) + 1);
    }
    if (game.portal.Resilience.radLevel > 0) {
        health *= (Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.radLevel));
    }
    if (game.portal.Observation.radLevel > 0) {
    	health *= game.portal.Observation.getMult();
    }
    if (game.portal.Championism.radLevel > 0) {
        health *= game.portal.Championism.getMult();
    }
    if (Fluffy.isRewardActive("healthy")) {
		health *= 1.5;
    }
    health = calcHeirloomBonus("Shield", "trimpHealth", health);
    if (game.goldenUpgrades.Battle.currentBonus > 0) {
        health *= game.goldenUpgrades.Battle.currentBonus + 1;
    }
    if (game.global.totalSquaredReward > 0) {
        health *= (1 + (game.global.totalSquaredReward / 100));
    }
    if (game.global.challengeActive == "Revenge" && game.challenges.Revenge.stacks > 0) {
	health *= game.challenges.Revenge.getMult();
    }
    if (game.global.challengeActive == "Wither" && game.challenges.Wither.trimpStacks > 0) {
	health *= game.challenges.Wither.getTrimpHealthMult();
    }
    if (game.global.mayhemCompletions > 0) {
	health *= game.challenges.Mayhem.getTrimpMult();
    }
    if (game.global.pandCompletions > 0) {
	health *= game.challenges.Pandemonium.getTrimpMult();
    }
    if (game.global.challengeActive == "Insanity") {
	health *= game.challenges.Insanity.getHealthMult();
    }
    if (game.global.challengeActive == "Berserk") {
	if (game.challenges.Berserk.frenzyStacks > 0) {
	    health *= 0.5;
	}
	if (game.challenges.Berserk.frenzyStacks <= 0) {
	    health *= game.challenges.Berserk.getHealthMult(true);
	}
    }
    if (game.challenges.Nurture.boostsActive() == true) {
	health *= game.challenges.Nurture.getStatBoost();
    }

	//Alchemy Mult
	health *= alchObj.getPotionEffect('Potion of Strength');

	//AutoBattle
	health *= autoBattle.bonuses.Stats.getMult();

    if (typeof game.global.dailyChallenge.pressure !== 'undefined') {
        health *= (dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks));
    }

	//Prismatic Shield and Shield Layer, scales with multiple Scruffy shield layers
	health *= Fluffy.isRewardActive('shieldlayer') ? 1 + (getEnergyShieldMult() * (1 + Fluffy.isRewardActive('shieldlayer'))) : 1 + getEnergyShieldMult();

    return health;
}

function RcalcDailyAttackMod(number) {
    if (game.global.challengeActive == "Daily"){
        if (typeof game.global.dailyChallenge.badStrength !== 'undefined'){
            number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
        }
        if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive){
            number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
        }
        if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined'){
            number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);
        }
    }
    return number;
}

function RcalcBadGuyDmg(enemy, attack, equality) {
    var number;
    if (enemy)
        number = enemy.attack;
    else
        number = attack;
    if (getPageSetting('Rexterminateon') == true && getPageSetting('Rexterminatecalc') == true) {
	number = RgetEnemyMaxAttack(game.global.world, 90, 'Mantimp', 1.0)
    }
    if (game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') == 0 && !equality) {
        number *= game.portal.Equality.getMult();
    }
    else if (game.portal.Equality.radLevel > 0 && getPageSetting('Rcalcmaxequality') >= 1 && game.portal.Equality.scalingCount > 0 && !equality) {
        number *= Math.pow(game.portal.Equality.modifier, game.portal.Equality.scalingCount);
    }
    if (game.global.challengeActive == "Daily") {
        number = RcalcDailyAttackMod(number);
    }
    if (game.global.challengeActive == "Unbalance") {
	number *= 1.5;
    }
    if (game.global.challengeActive == "Wither" && game.challenges.Wither.enemyStacks > 0) {
	number *= game.challenges.Wither.getEnemyAttackMult();
    }
    if (game.global.challengeActive == "Archaeology") {
	number *= game.challenges.Archaeology.getStatMult("enemyAttack");
    }
    if (game.global.challengeActive == "Mayhem") {
	number *= game.challenges.Mayhem.getEnemyMult();
	number *= game.challenges.Mayhem.getBossMult();
    }
    if (game.global.challengeActive == "Pandemonium") {
	number *= game.challenges.Pandemonium.getEnemyMult();
	number *= game.challenges.Pandemonium.getBossMult();
    }
    if (game.global.challengeActive == "Storm") {
	number *= game.challenges.Storm.getAttackMult();
    }
    if (game.global.challengeActive == "Berserk") {
	number *= 1.5;
    }
    if (game.global.challengeActive == "Exterminate") {
	number *= game.challenges.Exterminate.getSwarmMult();
    }
    if (game.global.challengeActive == "Nurture") {
	number *= 2;
	if (game.buildings.Laboratory.owned > 0) {
	    number *= game.buildings.Laboratory.getEnemyMult();
	}
    }
    if (game.global.challengeActive == "Alchemy") {
	number *= ((alchObj.getEnemyStats(false, false)) + 1);
    }
    if (game.global.challengeActive == "Hypothermia") {
	number *= game.challenges.Hypothermia.getEnemyMult();
    }
    if (game.global.challengeActive == "Glass") {
	number *= game.challenges.Glass.attackMult();
    }
    if (!enemy && game.global.usingShriek) {
        number *= game.mapUnlocks.roboTrimp.getShriekValue();
    }
    return number;
}

function RcalcEnemyBaseHealth(world, level, name) {
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
			if (game.global.universe == 2) {
				var part1 = (world > 60) ? 60 : world;
				var part2 = (world - 60);
				if (part2 < 0) part2 = 0;
				amt *= Math.pow(1.4, part1);
				amt *= Math.pow(1.32, part2);
			}
			return Math.floor(amt);
}

function RcalcEnemyHealth(world) {
    if (world == false) world = game.global.world;
    var health = RcalcEnemyBaseHealth(world, 50, "Snimp");
    if (getPageSetting('Rexterminateon') == true && getPageSetting('Rexterminatecalc') == true) {
	health = RcalcEnemyBaseHealth(world, 90, "Beetlimp");
    }
    if (game.global.challengeActive == "Unbalance") {
	health *= 2;
    }
    if (game.global.challengeActive == "Quest"){
	health *= game.challenges.Quest.getHealthMult();
    }
    if (game.global.challengeActive == "Revenge" && game.global.world % 2 == 0) {
	health *= 10;
    }
    if (game.global.challengeActive == "Archaeology") {

    }
    if (game.global.challengeActive == "Mayhem") {
	health *= game.challenges.Mayhem.getEnemyMult();
	health *= game.challenges.Mayhem.getBossMult();
    }
    if (game.global.challengeActive == "Pandemonium") {
	health *= game.challenges.Pandemonium.getBossMult();
    }
    if (game.global.challengeActive == "Storm") {
	health *= game.challenges.Storm.getHealthMult();
    }
    if (game.global.challengeActive == "Berserk") {
	health *= 1.5;
    }
    if (game.global.challengeActive == "Exterminate") {
	health *= game.challenges.Exterminate.getSwarmMult();
    }
    if (game.global.challengeActive == "Nurture") {
	health *= 2;
	if (game.buildings.Laboratory.owned > 0) {
	    health *= game.buildings.Laboratory.getEnemyMult();
	}
    }
    if (game.global.challengeActive == "Alchemy") {
	health *= ((alchObj.getEnemyStats(false, false)) + 1);
    }
    if (game.global.challengeActive == "Hypothermia") {
	health *= game.challenges.Hypothermia.getEnemyMult();
    }
    if (game.global.challengeActive == "Glass") {
	health *= 0.01;
        health *= game.challenges.Glass.healthMult();
    }
    return health;
}

function RcalcEnemyHealthMod(world, cell, name) {
    if (world == false) world = game.global.world;
    var health = RcalcEnemyBaseHealth(world, cell, name);
    if (game.global.challengeActive == "Unbalance") {
	health *= 2;
    }
    if (game.global.challengeActive == "Quest"){
	health *= game.challenges.Quest.getHealthMult();
    }
    if (game.global.challengeActive == "Revenge" && game.global.world % 2 == 0) {
	health *= 10;
    }
    if (game.global.challengeActive == "Archaeology") {

    }
    if (game.global.challengeActive == "Mayhem") {
	health *= game.challenges.Mayhem.getEnemyMult();
	health *= game.challenges.Mayhem.getBossMult();
    }
    if (game.global.challengeActive == "Pandemonium") {
	health *= game.challenges.Pandemonium.getBossMult();
    }
    if (game.global.challengeActive == "Storm") {
	health *= game.challenges.Storm.getHealthMult();
    }
    if (game.global.challengeActive == "Berserk") {
	health *= 1.5;
    }
    if (game.global.challengeActive == "Exterminate") {
	health *= game.challenges.Exterminate.getSwarmMult();
    }
    if (game.global.challengeActive == "Nurture") {
	health *= 2;
	if (game.buildings.Laboratory.owned > 0) {
	    health *= game.buildings.Laboratory.getEnemyMult();
	}
    }
    if (game.global.challengeActive == "Alchemy") {
	health *= ((alchObj.getEnemyStats(false, false)) + 1);
    }
    if (game.global.challengeActive == "Hypothermia") {
	health *= game.challenges.Hypothermia.getEnemyMult();
    }
    if (game.global.challengeActive == "Glass") {
	health *= 0.01;
        health *= game.challenges.Glass.healthMult();
    }
    return health;
}

function RcalcHDratio() {
    var ratio = 0;
    var ourBaseDamage = RcalcOurDmg("avg", false, true);

    ratio = RcalcEnemyHealth(game.global.world) / ourBaseDamage;
    return ratio;
}

function getTotalHealthMod() {
    var healthMulti = 1;

    // Smithies
    healthMulti *= game.buildings.Smithy.getMult();

    // Perks
    healthMulti *= 1 + (game.portal.Toughness.radLevel * game.portal.Toughness.modifier);
    healthMulti *= Math.pow(1 + game.portal.Resilience.modifier, game.portal.Resilience.radLevel);
    healthMulti *= game.portal.Observation.getMult();
    healthMulti *= game.portal.Championism.getMult();

    // Scruffy's +50% health bonus
    healthMulti *= (Fluffy.isRewardActive("healthy") ? 1.5 : 1);

    // Heirloom Health bonus
    healthMulti *= 1 + calcHeirloomBonus('Shield', 'trimpHealth',1, true) / 100;

    // Golden Upgrades
    healthMulti *= 1 + game.goldenUpgrades.Battle.currentBonus;

    // C2/3
    healthMulti *= 1 + game.global.totalSquaredReward / 100;

    // Challenge Multis
    healthMulti *= (game.global.challengeActive == 'Revenge') ? game.challenges.Revenge.getMult() : 1;
    healthMulti *= (game.global.challengeActive == 'Wither') ? game.challenges.Wither.getTrimpHealthMult() : 1;
    healthMulti *= (game.global.challengeActive == 'Insanity') ? game.challenges.Insanity.getHealthMult() : 1;
    healthMulti *= (game.global.challengeActive == 'Berserk') ?
        (game.challenges.Berserk.frenzyStacks > 0) ? 0.5 : game.challenges.Berserk.getHealthMult(true)
        : 1;
    healthMulti *= (game.challenges.Nurture.boostsActive() == true) ? game.challenges.Nurture.getStatBoost() : 1;
    healthMulti *= (game.global.challengeActive == 'Alchemy') ? alchObj.getPotionEffect("Potion of Strength") : 1;

    // Daily mod
    healthMulti *= (typeof game.global.dailyChallenge.pressure !== 'undefined') ? dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks) : 1;

    // Mayhem
    healthMulti *= game.challenges.Mayhem.getTrimpMult();

    // Panda
    healthMulti *= game.challenges.Pandemonium.getTrimpMult();

    // AB
    healthMulti *= autoBattle.bonuses.Stats.getMult();

    // Prismatic
    healthMulti *= 1 + getEnergyShieldMult();

    return healthMulti;
}

function stormdynamicHD() {
    var stormzone = 0;
    var stormHD = 0;
    var stormmult = 0;
    var stormHDzone = 0;
    var stormHDmult = 1;
    if (getPageSetting('Rstormon') == true && game.global.world > 5 && (game.global.challengeActive == "Storm" && getPageSetting('Rstormzone') > 0 && getPageSetting('RstormHD') > 0 && getPageSetting('Rstormmult') > 0)) {
        stormzone = getPageSetting('Rstormzone');
        stormHD = getPageSetting('RstormHD');
        stormmult = getPageSetting('Rstormmult');
	stormHDzone = (game.global.world - stormzone);
	stormHDmult = (stormHDzone == 0) ? stormHD : Math.pow(stormmult, stormHDzone) * stormHD;
    }
    return stormHDmult;
}
