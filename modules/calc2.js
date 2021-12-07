/**
 * Rewrite game logic as much as possible using in game provided methods,
 * instead of implementing yourself to replace current calc
 * */

const getEnemyAttack = (cell, enemyName, ignoreEnemyStat) => {
    return game.global.getEnemyAttack(cell, enemyName, ignoreEnemyStat);
}

const getEnemyHealth = (cell, enemyName, ignoreEnemyStat) => {
    return game.global.getEnemyAttack(cell, enemyName, ignoreEnemyStat);
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
    let buildString = false;
    let noCheckAchievements = false;
    if (minMaxOrAverage === "min") {
        flucts = true;
    } else if (minMaxOrAverage === "max") {
        buildString = true;
        flucts = false;
        noCheckAchievements = true;
    }
    if (minMaxOrAverage === "avg") {
        return (getTrimpsDamage("min", stance, flucts) + getTrimpsDamage("max", stance, flucts)) / 2;
    } else {
        return calculateDamage(attack, buildString, true, noCheckAchievements, false, flucts);
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
