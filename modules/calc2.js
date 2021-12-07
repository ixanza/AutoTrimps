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
