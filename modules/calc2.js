/**
 * Rewrite game logic as much as possible using in game provided methods,
 * instead of implementing yourself to replace current calc
 * */

const calculateMaxDamage = Function("number", "buildString", "isTrimp", "noCheckAchieve", "cell", "noFluctuation", calculateDamage.toString().substr(calculateDamage.toString().indexOf('{'), calculateDamage.toString().lastIndexOf('}')).replace("var max = Math.ceil(number + (number * maxFluct));", "var max = Math.ceil(number + (number * maxFluct));return max;"))
const calculateMinDamage = Function("number", "buildString", "isTrimp", "noCheckAchieve", "cell", "noFluctuation", calculateDamage.toString().substr(calculateDamage.toString().indexOf('{'), calculateDamage.toString().lastIndexOf('}')).replace("var min = Math.floor(number * (1 - minFluct));", "var min = Math.floor(number * (1 - minFluct));return min;"))
const calculateEnemyCell = Function('cell', startFight.toString().substring(startFight.toString().indexOf('if (cell.maxHealth == -1) {'), startFight.toString().indexOf('else if (game.global.challengeActive == "Nom" && cell.nomStacks)', startFight.toString().indexOf('if (cell.maxHealth == -1) {'))))

const getEnemyAttack = (cell, enemyName, ignoreEnemyStat) => {
    return game.global.getEnemyAttack(cell, enemyName, ignoreEnemyStat);
}

const getEnemyHealth = (cell, enemyName, ignoreEnemyStat) => {
    return game.global.getEnemyHealth(cell, enemyName, ignoreEnemyStat);
}

const getTrimpsHealth = () => {
    return getTrimpsHealthWithStance() / getFormationBonus("health");
}

const getTrimpsHealthWithStance = () => {
    return game.global.soldierHealthMax;
}

const getTrimpsAttack = () => {
    return getTrimpsAttackWithStance() / getFormationBonus("attack");
}

const getTrimpsAttackWithStance = () => {
    return game.global.soldierCurrentAttack;
}

const getTrimpsCritDamage = () => {
    return getPlayerCritDamageMult();
}

const getTrimpsCritChance = () => {
    return getPlayerCritChance();
}

const getTrimpsBlock = () => {
    return getTrimpsBlockWithStance() / getFormationBonus("block");
}

const getTrimpsBlockWithStance = () => {
    return game.global.soldierCurrentBlock;
}

const getTrimpsDamage = (minMaxOrAverage, stance, flucts = true) => {
    let attack = stance ? getTrimpsAttackWithStance() : getTrimpsAttack();
    if (minMaxOrAverage === "min") {
        return calculateMinDamage(attack, false, true, true, false, flucts);
    } else if (minMaxOrAverage === "max") {
        return calculateMaxDamage(attack, false, true, true, false, flucts);
    } else {
        return (getTrimpsDamage("max", stance, flucts) + getTrimpsDamage("min", stance, flucts)) / 2
    }
}

const getEnemyDamage = (enemyAttack, minMaxOrAverage, flucts = true) => {
    if (minMaxOrAverage === "min") {
        return calculateMinDamage(enemyAttack, false, false, true, false, flucts);
    } else if (minMaxOrAverage === "max") {
        return calculateMaxDamage(enemyAttack, false, false, true, false, flucts);
    } else {
        return (getEnemyDamage(enemyAttack, "max", flucts) + getEnemyDamage(enemyAttack, "min", flucts)) / 2
    }
}

// FIXME NO METHOD RETURNS, BAKED IN GAME LOGIC
const getFormationBonus = (what) => {
    let formStrength = 1;
    if (game.global.formation > 0 && game.global.formation !== 5) {
        formStrength = 0.5;
        if ((game.global.formation == 1 && what == "health") ||
            (game.global.formation == 2 && what == "attack") ||
            (game.global.formation == 3 && what == "block")) {
            formStrength = 4
        }
    }
    return formStrength;
}
