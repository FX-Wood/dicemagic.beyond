import dispatchToBackground from './dispatch';
import AdvantageListener from './advantage_listener';
import DisplayBox from './display_box';
import ThemeWatcher from './theme_watcher';

import DeathSavesListener from './death_saves_listener';

class InitiativeListener {
    constructor (pollFrequency = 1000) {
        this.pollHandle = null;
        this.pollFrequency = pollFrequency;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.poll = this.poll.bind(this);
        this.roll = this.roll.bind(this);
    }
    start() {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.pollHandle = setInterval(this.poll, this.pollFrequency);
    }
    stop() {
        if (this.pollHandle) {
            clearInterval(this.listenerHandle);
        }
    }
    poll() {
        const initiative = document.querySelector('.ct-initiative-box');
        if (initiative && !initiative.iAmListening) {
            initiative.iAmListening = true;
            initiative.classList.add('simple-mouseover');
            this.listenerHandle = initiative.addEventListener('click', this.roll, true);
        }
    }
    async roll(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            document.getSelection().removeAllRanges() // unselect text

            const creatureName = CHARACTER_SHEET_WATCHER.characterName;
            const rollName = 'Initiative Roll';

            const modifier = e.currentTarget.textContent;
            const advantageState = ADVANTAGE_LISTENER.determineAdvantage(e);

            const roll = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });

            const { first, high, low } = roll;
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
                high,
                low,
                modifier,
                advantageState
            };
            DISPLAY_BOX.renderSimple(props);
        }
    }
}
/** CharacterSheetWatcher polls the DOM until it gathers
 * a character's name and classes and then it stops. */
class CharacterSheetWatcher {
    /** Constructor
     * @param {Integer} pollFrequency interval between polls in ms, defaults to 1000ms
     * @return {CharacterSheetWatcher}
      */
    constructor(pollFrequency = 1000) {
        this.pollFrequency = pollFrequency;
        this.pollHandle = 0;

        this.characterSheet = null;
        this.characterName = '';
        this.characterClasses = '';
        this.spellAttackModifier = 0; // handled in the primary box poll

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.poll = this.poll.bind(this);
    }
    start() {
        this.pollHandle = setInterval(this.poll, this.pollFrequency);
    }
    stop() {
        clearInterval(this.pollHandle);
    }
    poll() {
        if (!this.characterSheet) {
            this.characterSheet = document.getElementById('character-sheet-target');
        }
        if (!this.characterName && this.characterSheet) {
            const nameElement = this.characterSheet.querySelector('.ct-character-tidbits__name');
            if (nameElement) { this.characterName = nameElement.innerText; }
        }
        if (!this.characterClasses && this.characterSheet) {
            const classElement = this.characterSheet.querySelector('.ct-character-tidbits__classes');
            if (classElement) { this.characterClasses = classElement.innerText.split('/'); }
        }

        if (this.characterSheet && this.characterName && this.characterClasses && this.spellAttackModifier) { this.stop(); }
    }
}

// abilities
class AbilityListener {
    constructor (pollFrequency = 1000) {
        this.pollHandle = null;
        this.pollFrequency = pollFrequency;
        this.clickableAbilities = [];

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.poll = this.poll.bind(this);
        this.roll = this.roll.bind(this);
    }
    start() {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.pollHandle = setInterval(this.poll, this.pollFrequency);
    }
    stop() {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.abilitiesBox.forEach((target) => target.removeEventListener('click', this.roll));
        this.clickableAbilities = [];
    }
    poll() {
        // TODO: mobile screen width has a different selector: '.ct-main-mobile__abilities'
        const abilitiesBox = document.querySelector('.ct-quick-info__abilities');
        if (abilitiesBox && !abilitiesBox.dataset.iAmListening) {
            // remove old, detached event listeners
            if (this.clickableAbilities.length) {
                console.log('found old, detached abilities', this.clickableAbilities);
                this.clickableAbilities.forEach((target) => target.removeEventListener('click', this.roll));
                this.clickableAbilities = [];
            }
            abilitiesBox.dataset.iAmListening = true;
            const abilities = abilitiesBox.querySelectorAll('.ct-ability-summary');
            abilities.forEach((ability) => {
                this.clickableAbilities.push(ability);
                ability.addEventListener('click', this.roll);
                ability.classList.add('simple-mouseover');
            });
        }
    }
    async roll(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            document.getSelection().removeAllRanges() // unselect text
            const creatureName = CHARACTER_SHEET_WATCHER.characterName;
            const rollName = {
                'str': 'Strength',
                'dex': 'Dexterity',
                'con': 'Constitution',
                'int': 'Intelligence',
                'wis': 'Wisdom',
                'cha': 'Charisma'
            }[e.currentTarget.innerText.slice(0, 3).toLowerCase()] + ' ability check';
            const modifier = e.currentTarget.querySelector('.ct-signed-number').textContent;
            const advantageState = ADVANTAGE_LISTENER.determineAdvantage(e);
            const { first, high, low } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });
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
                high,
                low,
                modifier,
                advantageState
            };
            DISPLAY_BOX.renderSimple(props);
        }
    }
}

// Saves
class SavesListener {
    constructor(pollFrequency = 1000) {
        this.pollFrequency = pollFrequency;
        this.pollHandle = null;
        this.savesBox = null;
        this.clickableSaves = [];

        this.poll = this.poll.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.roll = this.roll.bind(this);
    }
    poll() {
        const saves = document.querySelector('.ct-saving-throws-summary');
        if (saves && !saves.dataset.iAmListening) {
            saves.dataset.iAmListening = true;
            Array.from(saves.children)
                .forEach((save) => {
                    save.addEventListener('click', this.roll);
                    save.classList.add('saving-throw-mouseover');
                    this.clickableSaves.push(save);
                });
        }
    }
    start() {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.pollHandle = setInterval(this.poll, this.pollFrequency);
    }
    stop() {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.clickableSaves.forEach((save) => save.removeEventListener('click', this.roll));
        this.clickableSaves = [];
    }
    async roll(e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation(); // prevent sidebar from opening
            document.getSelection().removeAllRanges() // unselect text
            const creatureName = CHARACTER_SHEET_WATCHER.characterName;
            const rollName = {
                'str': 'Strength',
                'dex': 'Dexterity',
                'con': 'Constitution',
                'int': 'Intelligence',
                'wis': 'Wisdom',
                'cha': 'Charisma'
            }[e.currentTarget.innerText.slice(0, 3).toLowerCase()] + ' saving throw';
            const modifier = e.currentTarget.querySelector('.ct-saving-throws-summary__ability-modifier').textContent;
            const advantageState = ADVANTAGE_LISTENER.determineAdvantage(e);
            const { first, high, low } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });
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
                high,
                low,
                modifier,
                advantageState
            };
            DISPLAY_BOX.renderSimple(props);
        }
    }
}

// Skills
function addOnClickToSkills() {
    let skills = document.querySelector('.ct-skills__list');
    if (skills && !skills.iAmListening) {
        skills.iAmListening = true;
        skills = skills.querySelectorAll('.ct-skills__item');
        skills.forEach((skill) => {
            skill.addEventListener('click', rollSkillCheck, true);
            skill.classList.add('skills-pane-mouseover');
        });
    }
}

async function rollSkillCheck(e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        document.getSelection().removeAllRanges() // unselect text
        const creatureName = CHARACTER_SHEET_WATCHER.characterName
        const [abilityName, skillName] = e.currentTarget.innerText.split('\n');
        const rollName = `${skillName}(${abilityName})`;
        const modifier = e.currentTarget.querySelector('.ct-signed-number').textContent;
        const advantageState = ADVANTAGE_LISTENER.determineAdvantage(e);
        const { first, high, low } = await dispatchToBackground({ type: 'SIMPLE_ROLL', data: null });
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
            high,
            low,
            modifier,
            advantageState
        };
        DISPLAY_BOX.renderSimple(props);
    }
}

async function attackAndDamageRoll(e, type = 'primary-box-attack') {
    if (e.shiftKey) {
        const target = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        document.getSelection().removeAllRanges() // unselect text

        const creatureName = CHARACTER_SHEET_WATCHER.characterName;
        let rollName, rollMeta;
        const advantageState = ADVANTAGE_LISTENER.determineAdvantage(e);
        let hitModifier, damage, damageType;
        // handle primary box attacks
        if (type === 'primary-box-attack') {
            const nameBox = target.querySelector('.ct-combat-attack__name');
            rollName = nameBox.children[0].innerText;
            rollMeta = nameBox.children[1].innerText.replace('Weapon', 'Weapon Attack').replace('\n', ' \u2022 '); // replace newline with bullet character
            hitModifier = target.querySelector('.ct-combat-attack__tohit .ct-signed-number')
            if (hitModifier) { hitModifier = hitModifier.textContent } else { hitModifier = '+0' };
            damage = target.querySelector('.ct-damage__value')
            if (damage) { damage = damage.textContent } else { damage = '0d4 + 0' }
            damageType = target.querySelector('.ct-combat-attack__damage .ct-tooltip[data-original-title]');
            if (damageType) { damageType = damageType.dataset.originalTitle.toLowerCase() } else { damageType = 'unspecified' }
        }
        // handle spell attacks from primary box spell tab
        if (type === 'primary-box-spell') {
            const nameBox = target.querySelector('.ct-spells-spell__name');
            rollName = nameBox.children[0].innerText;
            rollMeta = nameBox.children[1].innerText.replace('\n', '\u2022'); // replace newline with bullet character
            hitModifier = target.querySelector('.ct-spells-spell__tohit').textContent;
            damage = target.querySelector('.ct-damage__value').textContent;
            damageType = target.querySelector('.ct-damage__icon .ct-tooltip').dataset.originalTitle;
        }
        // handle spell attacks from sidebar
        if (type === 'sidebar-spell') {
            const nameBox = target.parentElement.parentElement.parentElement.parentElement.querySelector('.ct-sidebar__header');
            rollName = nameBox.children[1].innerText;
            rollMeta = nameBox.children[0].innerText + ' Spell';

            hitModifier = CHARACTER_SHEET_WATCHER.spellAttackModifier;
            damage = target.querySelector('.ct-spell-caster__modifier-amount').textContent;
            damageType = target.querySelector('.ct-tooltip[data-original-title]').dataset.originalTitle.toLowerCase();
        }
        // parse damage roll into dice and modifier
        damage = damage.split(/(?=[+-])/);
        const damageDice = damage[0];
        const damageModifier = (damage[1] || 0); // handle attacks without modifier

        // parse damage dice into number and type of dice
        const [numDamageDice, numDamageFaces] = damageDice.split('d');
        // determine the roll for advantage
        let criticalDice;
        if (numDamageFaces) { // check for attacks with flat damage (like unarmed attack in some cases)
            criticalDice = parseInt(numDamageDice, 10) * 2 + 'd' + numDamageFaces;
        } else {
            // handle attacks with flat damage (like unarmed attack in some cases)
            criticalDice = numDamageDice;
        }
        const cmdString = `1d20,1d20,${damageDice},${criticalDice}`;
        let rolls = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: cmdString });
        let damageRolls = rolls.result.match(/[\d, ]+(?=\()/g);
        damageRolls = damageRolls[damageRolls.length - 1];
        rolls = rolls.result.match(/\d+(?=\*)/g);
        // handle to hit
        const hitNormalVantage = rolls[0];
        let hitResult = rolls[0];
        const [hitDisadvantage, hitAdvantage] = rolls.slice(0, 2).sort((a, b) => parseInt(a) - parseInt(b));

        // handle advantage
        if (advantageState === 1) {
            hitResult = hitAdvantage;
        }
        // handle disadvantage
        if (advantageState === 2) {
            hitResult = hitDisadvantage;
        }
        // handle critical
        let criticalState = 0;
        if (hitResult === '20') {
            criticalState = 1;
        }
        // damage
        const [normalDamage, criticalDamage] = rolls.slice(2);

        const props = {
            creatureName,
            rollName,
            rollMeta,
            hitResult,
            hitNormalVantage,
            hitAdvantage,
            hitDisadvantage,
            hitModifier,
            damageDice,
            numDamageDice,
            damageRolls,
            criticalDice,
            damageModifier,
            damageType,
            normalDamage,
            criticalDamage,
            advantageState,
            criticalState
        };
        DISPLAY_BOX.renderAttack(props);
    }
}

// Primary Box
function addOnclickToPrimaryBox () {
    // checks if the actions tab of the primary box is active
    if (document.querySelector('.ct-attack-table__content')) {
        // makes an array of each item on the attack table
        const attacks = Array.from(document.querySelector('.ct-attack-table__content').children);

        // adds an event listener and flags each item in the attack table
        attacks.forEach((attack) => {
            if (!attack.iAmListening) {
                attack.addEventListener('click', attackAndDamageRoll, true);
                attack.iAmListening = true;
                attack.classList.add('primary-box-mouseover');
            }
        });
    // This block executes if the spells tab is active in the primary box
    } else if (document.querySelector('.ct-spells')) {
        const spells = Array.from(document.querySelectorAll('.ct-spells-spell'));

        spells.forEach((spell) => {
            // checks if each spell has a to-Hit roll or a damage roll
            if (spell.querySelector('.ct-spells-spell__tohit') || spell.querySelector('.ct-damage__value')) {
                // checks if the spell has a listener yet
                if (!spell.iAmListening) {
                    spell.iAmListening = true;
                    spell.addEventListener('click', rollSpellPrimaryBox);
                    spell.classList.add('primary-box-mouseover');
                }
            }
        });
    }
}

async function rollSpellPrimaryBox(e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        document.getSelection().empty() // unselect text
        const target = e.currentTarget;
        // if it's a spell attack, use attack renderer
        if (target.querySelector('.ct-spells-spell__tohit')) {
            return attackAndDamageRoll(e, 'primary-box-spell');
        }
        const creatureName = CHARACTER_SHEET_WATCHER.characterName;
        const [spellName, spellClass] = target.querySelector('.ct-spells-spell__name').innerText.split('\n');
        const spellLevel = target.parentElement.parentElement.parentElement.parentElement.children[0].innerText.toLowerCase().split('\n')[0];
        const rollName = spellName;
        const rollMeta = `${spellLevel === 'cantrip' ? 'Cantrip' : spellLevel + ' spell'} \u2022 ${spellClass}`;
        let saveDC = target.querySelector('.ct-spells-spell__save-value');
        let saveLabel;
        if (saveDC) {
            saveDC = saveDC.textContent;
            saveLabel = target.querySelector('.ct-spells-spell__save-label').textContent;
        }
        // get damage or healing
        let effect = target.querySelector('.ct-damage__value');
        let effectType;
        let isHeal = false;
        if (effect) {
            // damage
            effect = effect.innerText;
            effectType = target.querySelector('.ct-spell-damage-effect__damages .ct-tooltip').dataset.originalTitle;
        } else {
            // healing
            effect = target.querySelector('.ct-spell-damage-effect__healing').innerText;
            effectType = 'healing';
            isHeal = true;
        }
        // handle magic missile
        let magicMissileCount = 3;
        if (rollName === 'Magic Missile') {
            const additionalMissiles = target.querySelector('.ct-note-components__component--is-scaled');
            if (additionalMissiles) {
                magicMissileCount += parseInt(additionalMissiles.textContent.split('+')[1], 10);
            }
        }
        const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: effect });
        const [effectDice, effectModifier] = effect.split(/(?=[+-])/);
        const numEffectDice = parseInt(effectDice.split('d')[0], 10);
        const effectResult = roll.result.match(/\d+(?=\*)/g)[0];
        const effectRaw = roll.result.match(/[\d, ]+(?=\()/g)[0];
        const props = {
            creatureName,
            rollName,
            rollMeta,
            saveDC,
            saveLabel,
            effect,
            effectType,
            effectResult,
            effectDice,
            effectModifier,
            numEffectDice,
            effectRaw,
            isHeal,
            magicMissileCount
        };
        console.log(props)
        DISPLAY_BOX.renderSpell(props);
    }
}

// Sidebar
function addOnClickToSidebarSpells() {
    const primaryBoxSpellAttackElement = document.querySelectorAll('.ct-spells-level-casting__info-item')[1];
    // grabs spell attack mod from primary content box
    if (primaryBoxSpellAttackElement && (!CHARACTER_SHEET_WATCHER.spellAttackModifier)) {
        CHARACTER_SHEET_WATCHER.spellAttackModifier = parseInt(primaryBoxSpellAttackElement.textContent)
    }
    // check if sidebar exists
    const sidebarSpell = document.querySelector('.ct-sidebar__portal .ct-spell-caster__modifiers--damages');
    // if sidebar exists
    if (sidebarSpell) {
        // if the sidebar is new
        if (!sidebarSpell.iAmListening) {
            // flag it as listening
            sidebarSpell.iAmListening = true;
            // get all spell damage effects
            const spellDamageEffects = sidebarSpell.querySelectorAll('.ct-spell-caster__modifier--damage');
            // adds click listener to box containing damages
            spellDamageEffects.forEach((item) => {
                item.classList.add('sidebar-damage-box');
                item.addEventListener('click', rollSpellSideBar);
            });
        }
    }
}

// event handler for sidebar box containing damages
async function rollSpellSideBar (e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        document.getSelection().removeAllRanges() // unselect text
        const target = e.currentTarget;
        // gather gray text below spell effect
        let additionalMeta = target.children[2];
        if (additionalMeta) {
            additionalMeta = additionalMeta.textContent 
            // handle spell attacks (e.g., ice knife)
            if (additionalMeta.toLowerCase().includes('on hit')) {
                return attackAndDamageRoll(e, 'sidebar-spell');
            }
        } 
        // if effect is a spell attack, (e.g., Ice Knife) roll spell attack

        const creatureName = CHARACTER_SHEET_WATCHER.characterName
        const nameBox = target.parentElement.parentElement.parentElement.parentElement.querySelector('.ct-sidebar__header');
        const rollName = nameBox.children[1].innerText;
        const rollMeta = `${nameBox.children[0].innerText} Spell ${additionalMeta ? ' \u2022 ' + additionalMeta : '' } `;
        // const damage = target.querySelector('.ct-spell-caster__modifier-amount').textContent;
        // const damageType = target.querySelector('.ct-tooltip[data-original-title]').dataset.originalTitle.toLowerCase();
        const effectDice = target.children[0].textContent;
        const effectModifier = (effectDice.split(/(?=[+-])/)[1] || 0)
        console.log({ effectModifier })
        const effectType = target.querySelector('.ct-tooltip').dataset.originalTitle.toLowerCase();

        const spellPropertiesBox = target.parentElement.parentElement.parentElement.querySelector('.ct-property-list.ct-spell-detail__properties');
        let saveDC, saveType
        if (spellPropertiesBox.innerText.includes('Attack/Save')) {
            const spellProperties = spellPropertiesBox.innerText.split('\n');
            ([saveDC, saveType] = spellProperties[spellProperties.indexOf('Attack/Save:') + 1].split(' '))
            console.log(saveDC, saveType)
        }
        const isHeal = false;

        const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: effectDice });
        const effectResult = roll.result.match(/\d+(?=\*)/g)[0];
        const effectRaw = roll.result.match(/[\d, ]+(?=\()/g);
        const props = {
            creatureName,
            rollName,
            rollMeta,
            saveDC,
            saveType,
            effectType,
            effectResult,
            effectDice,
            effectModifier,
            effectRaw,
            isHeal
        }
        console.log(props)
        DISPLAY_BOX.renderSpell(props);
    }
}

function refreshClicks () {
    addOnClickToSkills();
    addOnclickToPrimaryBox();
    addOnClickToSidebarSpells();
}
let SPELL_ATTACK_MOD; // holds spell attack modifier in case users roll from their sidebar without the primary box spells tab open
function __init__(pollFrequency) {
    window.CHARACTER_SHEET_WATCHER = new CharacterSheetWatcher(pollFrequency);
    window.THEME_WATCHER = new ThemeWatcher(pollFrequency);
    window.ADVANTAGE_LISTENER = new AdvantageListener(pollFrequency);
    window.INITIATIVE_LISTENER = new InitiativeListener(pollFrequency);
    window.ABILITY_LISTENER = new AbilityListener(pollFrequency);
    window.SAVES_LISTENER = new SavesListener(pollFrequency);;
    window.DISPLAY_BOX = new DisplayBox(pollFrequency);
    window.DEATH_SAVES_LISTENER = new DeathSavesListener(pollFrequency)

    window.CHARACTER_SHEET_WATCHER.start();
    window.ADVANTAGE_LISTENER.start();
    window.DISPLAY_BOX.start();
    window.THEME_WATCHER.start();
    window.INITIATIVE_LISTENER.start();
    window.ABILITY_LISTENER.start();
    window.SAVES_LISTENER.start();
    window.DEATH_SAVES_LISTENER.start();
    setInterval(refreshClicks, pollFrequency);
}

if (window) {
    const pollFrequency = 1000 // ms
    __init__(pollFrequency)
}
