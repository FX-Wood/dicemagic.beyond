'use strict'
import AdvantageListener from './advantage_listener';
import DisplayBox from './display_box';
import dispatchToBackground from './dispatch';
// add event listener

// click handler

// get roll

// send to display

class MonsterStatBlockListener {
    constructor(target) {
        console.log('target', target)
        this.rollHitPoints = this.rollHitPoints.bind(this);
        this.rollAbilityCheck = this.rollAbilityCheck.bind(this);
        this.rollSave = this.rollSave.bind(this);
        this.rollSkill = this.rollSkill.bind(this);
        this.rollAttack = this.rollAttack.bind(this);

        this.monsterName = target.children[0].children[0].innerText;
        // add to hit points
        this.hitPoints = target.children[1].children[1];
        this.hitPoints.classList.add('simple-mouseover');
        this.hitPoints.addEventListener('click', this.rollHitPoints);
        // add to abilities
        this.abilities = Array.from(target.children[2].children[1].children);
        this.abilities.forEach((ability) => {
            ability.classList.add('simple-mouseover');
            ability.addEventListener('click', this.rollAbilityCheck);
        });
        // add to 'tidbits'
        this.tidbits = Array.from(target.children[3].children);
        this.tidbits.forEach((tidbit) => {
            // handle saving throws
            if (tidbit.children[0].innerText.toLowerCase().includes('saving throws')) {
                tidbit.replaceChild(
                    tidbit.children[1].innerText
                        .split(',')
                        .map((save) => {
                            const span = document.createElement('span');
                            span.innerText = save + ',';
                            span.className = 'text-mouseover';
                            span.addEventListener('click', this.rollSave);
                            return span;
                        })
                        .reduce((acc, next) => {
                            acc.appendChild(next);
                            return acc;
                        },
                        document.createDocumentFragment()
                        ),
                    tidbit.children[1]
                );
            }
            // handle skills
            if (tidbit.children[0].innerText.toLowerCase() === 'skills') {
                tidbit.replaceChild(
                    tidbit.children[1].innerHTML
                        .split(',')
                        .map((skill) => {
                            const span = document.createElement('span');
                            span.innerHTML = skill + ',';
                            span.className = 'text-mouseover';
                            span.addEventListener('click', this.rollSkill);
                            return span;
                        })
                        .reduce((root, nextSpan) => {
                            root.appendChild(nextSpan);
                            return root;
                        },
                        document.createDocumentFragment()
                        ),
                    tidbit.children[1]
                );
            }
        });
        this.descriptionBlocks = Array.from(target.children[5].children);
        this.descriptionBlocks.forEach((block) => {
            // add to first, unnamed description block
            if (block.children.length === 2) {
                // add to actions
                console.log(block.children[0].innerText.toLowerCase());
                if (block.children[0].innerText.toLowerCase() === 'actions') {
                    const actions = Array.from(block.children[1].children);
                    actions.forEach((action) => {
                        if (action.innerText.includes('Melee Weapon Attack') || action.innerText.includes('Ranged Weapon Attack')) {
                            action.classList.add('text-mouseover');
                            action.addEventListener('click', this.rollAttack);
                        }
                    });
                    // Melee weapon attack: + 15 to hit
                    // Hit:
                    // Poison breath `(22d6)`
                    // Spear
                }
                // add to legendary actions
            }
        });
        // add to legendary actions
    }
    async rollHitPoints(e) {
        if (e.shiftKey) {
            const cmd = e.currentTarget.innerText.split('(')[1].replace(')', '');
            const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: cmd });
            DISPLAY_BOX.renderCustomRoll(roll, { titleText: this.monsterName, subtitleText: 'Hit Points' });
        }
    }
    async rollAbilityCheck(e) {
        if (e.shiftKey) {
            const creatureName = this.monsterName;
            const rollName = {
                'str': 'Strength',
                'dex': 'Dexterity',
                'con': 'Constitution',
                'int': 'Intelligence',
                'wis': 'Wisdom',
                'cha': 'Charisma'
            }[e.currentTarget.innerText.slice(0, 3).toLowerCase()] + ' Ability Check';
            const modifier = parseInt(e.currentTarget.innerText.match(/\d+(?=\))/)[0]);
            const advantageState = determineAdvantage(e);
            const { first, low, high } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });
            // handle advantage
            let result = first;
            // handle advantage
            if (advantageState === 1) {
                result = high;
            }
            // handle disadvantage
            if (advantageState === 2) {
                result = low;
            }

            const props = {
                creatureName,
                rollName,
                result,
                first,
                low,
                high,
                modifier,
                advantageState
            };
            console.log('props', props);
            DISPLAY_BOX.renderSimple(props);
        }
    }

    async rollSave(e) {
        if (e.shiftKey) {
            const creatureName = this.monsterName;
            const rollName = {
                'str': 'Strength',
                'dex': 'Dexterity',
                'con': 'Constitution',
                'int': 'Intelligence',
                'wis': 'Wisdom',
                'cha': 'Charisma'
            }[e.currentTarget.innerText.trim().slice(0, 3).toLowerCase()] + ' Saving Throw';
            const modifier = parseInt(e.currentTarget.innerText.trim().slice(3).replace(/,/g, ''));
            const advantageState = determineAdvantage(e);
            const { first, low, high } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });
            // handle advantage
            let result = first;
            // handle advantage
            if (advantageState === 1) {
                result = high;
            }
            // handle disadvantage
            if (advantageState === 2) {
                result = low;
            }
            const props = {
                creatureName,
                rollName,
                result,
                first,
                low,
                high,
                modifier,
                advantageState
            };
            console.log('props', props);
            DISPLAY_BOX.renderSimple(props);
        }
    }

    async rollSkill(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            const creatureName = this.monsterName;
            const [rollName, modifier] = e.currentTarget.innerText.trim().split(' ');
            const advantageState = determineAdvantage(e);
            const { first, high, low } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });
            // handle advantage
            let result = first;
            // handle advantage
            if (advantageState === 1) {
                result = high;
            }
            // handle disadvantage
            if (advantageState === 2) {
                result = low;
            }
            const props = {
                creatureName,
                rollName,
                result,
                first,
                low,
                high,
                modifier,
                advantageState
            };
            DISPLAY_BOX.renderSimple(props);
        }
    }

    async rollAttack(e) {
        if (e.shiftKey) {
            const text = e.currentTarget.innerText;
            
            const creatureName = this.monsterName;
            const rollName = text.match(/.*?(?=[.])/)[0];
            let rollMeta = '';
            if (text.includes('Melee Weapon Attack')) {
                rollMeta = 'Melee Weapon Attack';
            }

            const advantageState = determineAdvantage(e);
            const hitModifier = parseInt(text.slice(text.indexOf('Weapon Attack:') + 15, text.indexOf(' to hit')));
            const damages = Array.from(text.matchAll(/\((.*?)\) (.*?) /g))
                .map(([match, dmg, damageType]) => {
                    let [damageDice, damageModifier] = dmg.split(/(?=[+-])/);
                    if (!damageModifier) {
                        damageModifier = 0;
                    } else {
                        damageModifier = damageModifier.replace(' ', '');
                    }
                    const [numDamageDice, numDamageFaces] = damageDice.split('d');
                    let criticalDice;
                    if (numDamageFaces) {
                        criticalDice = parseInt(numDamageDice) * 2 + 'd' + numDamageFaces;
                    } else {
                        criticalDice = numDamageDice;
                    }
                    return {
                        damageDice,
                        criticalDice,
                        damageModifier,
                        damageType
                    };
                });
            let [toHitRolls, damageRolls] = await Promise.all([
                dispatchToBackground({ type: 'SIMPLE_ROLL', data: null }),
                dispatchToBackground({ type: 'SPECIAL_ROLL', data: damages.map((damage) => damage.damageDice + ',' + damage.criticalDice).reduce((acc, next) => acc + next + ',', '') })
            ]);

            // get toHit rolls out of response
            const { first, high, low } = toHitRolls;
            let hitResult = first;
            const hitNormalVantage = first;
            const hitAdvantage = high;
            const hitDisadvantage = low;

            // handle advantage
            if (advantageState === 1) {
                hitResult = hitAdvantage;
            }
            // handle disadvantage
            if (advantageState === 2) {
                hitResult = hitDisadvantage;
            }

            // get damage rolls out of response
            damageRolls = damageRolls.result
                .split('\n')
                .map((roll) => {
                    if (!roll.includes('Total')) {
                        const a = {
                            cmd: roll.match(/.*(?=\()/)[0],
                            raw: roll.match(/[\d, ]+(?=\))/g)[0],
                            result: roll.match(/\d+(?=\*)/)[0]
                        };
                        return a;
                    }
                })
                .filter((roll) => typeof roll !== 'undefined');
            const acc = [];
            let i = 0;
            while (damageRolls.length) {
                acc.push(
                    {
                        normalDamage: damageRolls.shift().result,
                        criticalDamage: damageRolls.shift().result,
                        damageModifier: damages[i].damageModifier,
                        damageType: damages[i].damageType
                    }
                );
                i += 1;
            }
            damageRolls = acc;
            if (damageRolls.length === 1) {
                const { normalDamage, criticalDamage, damageModifier, damageType } = damageRolls[0];
                const props = {
                    creatureName,
                    rollName,
                    rollMeta,
                    hitResult,
                    hitNormalVantage,
                    hitAdvantage,
                    hitDisadvantage,
                    hitModifier,
                    normalDamage,
                    criticalDamage,
                    damageModifier,
                    damageType,
                    advantageState,
                    damageDice: damages[0].damageDice,
                    criticalDice: damages[0].criticalDice

                };
                DISPLAY_BOX.renderAttack(props);
            }
        }
    }
}

class EncounterListener {
    constructor() {
        this.mutationObserver = null;
        this.monsters = [];
        this.selectorString = 'encounter-builder-root';

        this.start = this.start.bind(this);
        this.handleMutation = this.handleMutation.bind(this);
    }

    handleMutation(mutations, observer) {
        mutations.forEach((mutation) => {
            // check to see if nodes were added
            if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].querySelector) {
                // check to see if the added nodes are monster stat blocks
                const block = mutation.addedNodes[0].querySelector('.mon-stat-block');
                if (block) {
                    this.monsters.push(new MonsterStatBlockListener(block));
                }
            }
        });
    }
    start() {
        this.mutationObserver = new MutationObserver(this.handleMutation);
        const target = document.getElementById(this.selectorString);
        this.mutationObserver.observe(target, { childList: true, subtree: true });
    }
}

function __init__() {
    window.DISPLAY_BOX = new DisplayBox();
    window.ENCOUNTER_LISTENER = new EncounterListener();
    window.ADVANTAGE_LISTENER = new AdvantageListener();
    DISPLAY_BOX.start()
    ENCOUNTER_LISTENER.start();
    ADVANTAGE_LISTENER.start();
}

if (window) {
    __init__()
}