// add event listener

// click handler

// get roll

// send to display

class MonsterStatBlockListener {
    constructor(target) {
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
                            span.innerHTML = skill;
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
            console.log('block', block);
            console.log('length', block.children.length);
            if (block.children.length === 2) {
                // add to actions
                console.log(block.children[0].innerText.toLowerCase());
                if (block.children[0].innerText.toLowerCase() === 'actions') {
                    const actions = Array.from(block.children[1].children);
                    actions.forEach((action) => {
                        if (action.innerText.includes('Melee Weapon Attack')) {
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
            console.log('hit points cmd', cmd);
            const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: cmd });
            console.log(this.monsterName);
            DISPLAY_BOX.renderCustomRoll(roll, { titleText: this.monsterName, subtitleText: 'Hit Points' });
        }
    }
    async rollAbilityCheck(e) {
        if (e.shiftKey) {
            const abilityName = e.currentTarget.children[0].innerText.toUpperCase();
            const name = this.monsterName + ` (${abilityName})`;
            const modifier = parseInt(e.currentTarget.children[1].children[1].innerText.replace(/\(|\)/g, ''), 10);
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
                name,
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
            const saveName = e.currentTarget.innerText.slice(0, 3);
            const name = this.monsterName + ` (${saveName} save)`;
            const modifier = parseInt(e.currentTarget.innerText.slice(3), 10);
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
                name,
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
            console.log(e.currentTarget);
            console.log(e.currentTarget.innerText);
            e.preventDefault();
            e.stopPropagation();
            const skillName = e.currentTarget.children[0].innerText;
            const name = this.monsterName + `(${skillName} check)`;
            console.log('textnode', e.currentTarget.childNodes);
            const modifier = parseInt(e.currentTarget.childNodes[e.currentTarget.childNodes.length - 1].textContent.replace(/ /g, ''), 10);
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
                name,
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

    async rollAttack(e) {
        if (e.shiftKey) {
            const monsterName = this.monsterName;
            const advantageState = determineAdvantage(e);
            const attackName = e.currentTarget.childNodes[0].textContent.replace('.', '');
            console.log({ attackName });
            console.log('rolled action', e);
            const text = e.currentTarget.innerText;
            const hitModifier = parseInt(text.slice(text.indexOf('Melee Weapon Attack: ') + 21, text.indexOf(' to hit')), 10);
            console.log({ hitModifier });
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
                        criticalDice = parseInt(numDamageDice, 10) * 2 + 'd' + numDamageFaces;
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
            console.log({ damages });
            let [toHitRolls, damageRolls] = await Promise.all([
                dispatchToBackground({ type: 'SIMPLE_ROLL', data: null }),
                dispatchToBackground({ type: 'SPECIAL_ROLL', data: damages.map((damage) => damage.damageDice + ',' + damage.criticalDice).reduce((acc, next) => acc + next + ',', '') })
            ]);
            console.log({ toHitRolls });
            console.log({ damageRolls });

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
                        console.log(roll);
                        console.log(a);
                        return a;
                    }
                })
                .filter((roll) => typeof roll !== 'undefined');
            const acc = [];
            let i = 0;
            while (damageRolls.length) {
                console.log(damageRolls.length);
                acc.push(
                    {
                        normalDamage: damageRolls.shift(),
                        criticalDamage: damageRolls.shift(),
                        damageModifier: damages[i].damageModifier,
                        damageType: damages[i].damageType
                    }
                );
                i += 1;
            }
            damageRolls = acc;
            console.log({ damageRolls });
            console.log({ hitAdvantage, hitDisadvantage, hitResult });
            // const props = {
            //     hitResult,
            //     hitNormalVantage,
            //     hitAdvantage,
            //     hitDisadvantage,
            //     hitModifier,
            //     damageModifier,
            //     damageType,
            //     normalDamage,
            //     criticalDamage,
            //     advantageState
            // };

            // DISPLAY_BOX.renderAttack(props)
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
            console.log(mutation);
            // check to see if nodes were added
            if (mutation.addedNodes.length > 0) {
                // check to see if the added nodes are monster stat blocks
                const block = mutation.addedNodes[0].querySelector('.mon-stat-block');
                console.log('block', block);
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

var ENCOUNTER_LISTENER = new EncounterListener();
ENCOUNTER_LISTENER.start();
