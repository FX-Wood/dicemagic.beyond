// components for renderers
function Row (className) {
    const r = document.createElement('div');
    r.className = 'row';
    if (className) {
        r.classList.add(className);
    }
    return r;
}

function Col (className) {
    const c = document.createElement('div');
    c.className = 'col';
    if (className) {
        c.classList.add(className);
    }
    return c;
}

function TabBtn (text, value) {
    const el = document.createElement('div');
    el.innerText = text;
    el.dataset.value = value;
    el.className = 'display-box-button';
    el.activate = () => el.classList.add('active');
    el.deActivate = () => el.classList.remove('active');
    return el;
}

function FlexSpacer (className) {
    const div = document.createElement('div');
    div.className = 'grow';
    if (className) {
        div.classList.add(className);
    }
    return div;
}

/**
 * makes a span with title styling
 * @param {String} text content
 * @returns {HTMLParagraphElement} <span> [text] </span>
 */
function Title (text) {
    const el = document.createElement('p');
    el.className = 'headline';
    el.innerText = text;
    return el;
}
/**
 * makes a span with subtitle styling
 * @param {String} text
 * @returns {HTMLParagraphElement}
 */
function Subtitle (text) {
    const el = document.createElement('p');
    el.className = 'subhead';
    el.innerText = text;
    return el;
}

function RollResultContent(text) {
    const el = document.createElement('span');
    el.className = 'roll-result';
    el.innerText = text;
    return el;
}

function RollInfoLabel(text) {
    const el = document.createElement('span');
    el.className = 'roll-label nowrap';
    el.innerText = text;
    return el;
}

function RollInfoContent (text) {
    const el = document.createElement('span');
    el.className = 'roll-info nowrap';
    el.innerText = text;
    return el;
}

function RollInfoInput(value) {
    const el = document.createElement('input');
    el.type = 'number';
    el.name = 'effectModifier';
    el.className = 'ct-health-summary__adjuster-field-input modifier-input';
    el.value = parseInt(value, 10);
    return el;
}

function RollResultColumn(labelText, valueText) {
    const root = Col();
    const label = RollInfoLabel(labelText);
    const value = RollResultContent(valueText);
    root.classList.add('roll-result-column');
    root.append(label, value);
    return { root, label, value };
}

function RollInfoColumn(labelText, valueText) {
    const root = Col();
    const label = RollInfoLabel(labelText);
    const value = RollInfoContent(valueText);
    root.append(label, value);
    return { root, label, value };
}

function RollInputColumn (labelText, valueText) {
    const root = Col();
    const label = RollInfoLabel(labelText);
    const value = RollInfoInput(valueText);
    root.append(label, value);
    return { root, label, value };
}

// get rolls from background script
function dispatchToBackground ({ type, data }) {
    console.log('dispatching', { type, data });
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type, data }, (response) => {
            resolve(response);
        });
    });
}
class InitiativeListener {
    constructor (pollFrequency = 1000) {
        this.pollHandle = null;
        this.pollFrequency = pollFrequency;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.poll = this.poll.bind(this);
        this.roll = this.roll.bind(this);
    }
    start () {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.pollHandle = setInterval(this.poll.bind(this), this.pollFrequency);
    }
    stop () {
        if (this.pollHandle) {
            clearInterval(this.listenerHandle);
        }
    }
    poll () {
        const initiative = document.querySelector('.ct-initiative-box');
        if (initiative && !initiative.iAmListening) {
            initiative.iAmListening = true;
            initiative.classList.add('simple-mouseover');
            this.listenerHandle = initiative.addEventListener('click', this.roll, true);
        }
    }
    async roll (e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            const creatureName = CHARACTER_SHEET_WATCHER.characterName;
            const rollName = 'Initiative Roll';

            const modifier = e.currentTarget.textContent;
            const advantageState = determineAdvantage(e);

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
        // TODO: implement checking for spell attack modifier onload (in case of sidebar spell attack)
        // if (document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit')) {
        //     SPELL_ATTACK_MOD = document.querySelector('.ct-combat-attack--spell .ct-combat-attack__tohit').textContent;
        // }
        if (!this.characterSheet) {
            this.characterSheet = document.getElementById('character-sheet-target');
        }
        if (!this.characterName) {
            const nameElement = this.characterSheet.querySelector('.ct-character-tidbits__name');
            if (nameElement) { this.characterName = nameElement.innerText; }
        }
        if (!this.characterClasses) {
            const classElement = this.characterSheet.querySelector('.ct-character-tidbits__classes');
            if (classElement) { this.characterClasses = classElement.innerText.split('/'); }
        }
        if (this.characterSheet && this.characterName && this.characterClasses) { this.stop(); }
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
    start () {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.pollHandle = setInterval(this.poll);
    }
    stop () {
        if (this.pollHandle) {
            clearInterval(this.pollHandle);
        }
        this.abilitiesBox.forEach((target) => target.removeEventListener('click', this.roll));
        this.clickableAbilities = []
    }
    poll () {
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
    async roll (e) {
        if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            const creatureName = CHARACTER_SHEET_WATCHER.characterName;
            const rollName = {
                'str': 'Strength',
                'dex': 'Dexterity',
                'con': 'Constitution',
                'int': 'Intelligence',
                'wis': 'Wisdom',
                'cha': 'Charisma'
            }[e.currentTarget.innerText.slice(0, 3).toLowerCase()] + ' skill check';
            const modifier = e.currentTarget.querySelector('.ct-signed-number').textContent;
            const advantageState = determineAdvantage(e);
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
            const advantageState = determineAdvantage(e);
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
function addOnClickToSkills () {
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

async function rollSkillCheck (e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const creatureName = CHARACTER_SHEET_WATCHER.characterName
        const [abilityName, skillName] = e.currentTarget.innerText.split('\n');
        const rollName = `${skillName}(${abilityName})`;
        const modifier = e.currentTarget.querySelector('.ct-signed-number').textContent;
        const advantageState = determineAdvantage(e);
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

async function attackAndDamageRoll (e, type) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Rolling attack', e, type);

        const advantageState = determineAdvantage(e);
        let hitModifier, damage, damageType;
        // handle primary box attacks
        if (!type) {
            hitModifier = e.currentTarget.querySelector('.ct-combat-attack__tohit .ct-signed-number').textContent;
            damage = e.currentTarget.querySelector('.ct-damage__value').textContent;
            damageType = e.currentTarget.querySelector('.ct-tooltip[data-original-title]').dataset.originalTitle.toLowerCase();
        }
        // handle spell attacks from primary box spell tab
        if (type === 'primary-box-spell') {
            hitModifier = e.currentTarget.querySelector('.ct-spells-spell__tohit').textContent;
            damage = e.currentTarget.querySelector('.ct-damage__value').textContent;
            damageType = e.currentTarget.querySelector('.ct-damage__icon .ct-tooltip').title.toLowerCase();
        }
        // handle spell attacks from sidebar
        if (type === 'sidebar-spell') {
            hitModifier = SPELL_ATTACK_MOD;
            damage = e.currentTarget.querySelector('.ct-spell-caster__modifier-amount').textContent;
            damageType = e.currentTarget.querySelector('.ct-tooltip[data-original-title]').dataset.originalTitle.toLowerCase();
        }
        // handle custom weapons
        if (damageType === 'item is customized') {
            damageType = 'non-mundane';
        }
        // parse damage roll into dice and modifier
        damage = damage.split(/(?=[+-])/);
        const damageDice = damage[0];
        const damageModifier = (damage[1] || 0); // handle attacks without modifier

        // parse damage dice into number and type of dice
        const [numDamageDice, numDamageFaces] = damageDice.split('d');
        // determine the roll for advantage
        let damageDiceAdvantage;
        if (numDamageFaces) { // check for attacks with flat damage (like unarmed attack in some cases)
            damageDiceAdvantage = parseInt(numDamageDice, 10) * 2 + 'd' + numDamageFaces;
        } else {
            // handle attacks with flat damage (like unarmed attack in some cases)
            console.log('flat damage');
            damageDiceAdvantage = numDamageDice;
        }
        const cmdString = `1d20,1d20,${damageDice},${damageDiceAdvantage}`;
        let rolls = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: cmdString });
        let damageRolls = rolls.result.match(/[\d, ]+(?=\()/g);
        damageRolls = damageRolls[damageRolls.length - 1];
        rolls = rolls.result.match(/\d+(?=\*)/g);
        // handle to hit
        const hitNormalVantage = rolls[0];
        let hitResult = rolls[0];
        const [hitDisadvantage, hitAdvantage] = rolls.slice(0, 2).sort((a, b) => { return parseInt(a, 10) - parseInt(b, 10); });

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

        const output = {
            hitResult,
            hitNormalVantage,
            hitAdvantage,
            hitDisadvantage,
            hitModifier,
            damageDice,
            numDamageDice,
            damageRolls,
            damageDiceAdvantage,
            damageModifier,
            damageType,
            normalDamage,
            criticalDamage,
            advantageState,
            criticalState
        };
        console.log('output', output);
        DISPLAY_BOX.renderAttack(output);
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
                console.log('Adding listeners to attack table');
                attack.classList.add('primary-box-mouseover');
            }
        });
    // This block executes if the spells tab is active in the primary box
    } else if (document.querySelector('.ct-spells')) {
        const spells = Array.from(document.querySelectorAll('.ct-spells-spell'));

        spells.forEach((spell) => {
            // checks if each spell has a to-Hit roll or a damage roll
            if (spell.querySelector('ct-spells-spell__tohit') || spell.querySelector('.ct-damage__value')) {
                // checks if the spell has a listener yet
                if (!spell.iAmListening) {
                    spell.iAmListening = true;
                    spell.addEventListener('click', rollSpellPrimaryBox, true);
                    console.log('adding listeners to spells');
                    spell.classList.add('primary-box-mouseover');
                }
            }
        });
    }
}

async function rollSpellPrimaryBox (e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        // if it's a spell attack, use attack renderer
        if (e.currentTarget.querySelector('.ct-spells-spell__tohit')) {
            return attackAndDamageRoll(e, 'primary-box-spell');
        }
        const spellName = e.currentTarget.querySelector('.ct-spell-name').textContent;
        let saveDC = e.currentTarget.querySelector('.ct-spells-spell__save-value');
        let saveLabel;
        if (saveDC) {
            saveDC = saveDC.textContent;
            saveLabel = e.currentTarget.querySelector('.ct-spells-spell__save-label').textContent;
        }
        // get damage or healing
        let effect = e.currentTarget.querySelector('.ct-damage__value');
        let effectType;
        let isHeal = false;
        if (effect) {
            // damage
            effect = effect.innerText;
            effectType = e.currentTarget.querySelector('.ct-spell-damage-effect__damages .ct-tooltip').dataset.originalTitle;
        } else {
            // healing
            effect = e.currentTarget.querySelector('.ct-spell-damage-effect__healing').innerText;
            effectType = 'healing';
            isHeal = true;
        }
        // handle magic missile
        let magicMissileCount = 3;
        if (spellName === 'Magic Missile') {
            const additionalMissiles = e.currentTarget.querySelector('.ct-note-components__component--is-scaled');
            if (additionalMissiles) {
                magicMissileCount += parseInt(additionalMissiles.textContent.split('+')[1], 10);
            }
        }
        const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: effect });
        console.log(roll);
        const [effectDice, effectModifier] = effect.split(/(?=[+-])/);
        console.log({ effectDice, effectModifier });
        const numEffectDice = parseInt(effectDice.split('d')[0], 10);
        console.log({ numEffectDice });
        const effectResult = roll.result.match(/\d+(?=\*)/g)[0];
        console.log({ effectResult });
        const rawEffect = roll.result.match(/[\d, ]+(?=\()/g)[0];
        const spellInfo = {
            spellName,
            saveDC,
            saveLabel,
            effect,
            effectType,
            effectResult,
            effectDice,
            effectModifier,
            numEffectDice,
            rawEffect,
            isHeal,
            magicMissileCount
        };
        console.log(spellInfo);
        renderPrimaryBoxSpells(spellInfo);
    }
}


function renderPrimaryBoxSpells (spellInfo) {
    console.log('rendering primary box spells');
    const {
        spellName,
        saveDC,
        saveLabel,
        effectType,
        effectResult,
        effectDice,
        effectModifier,
        rawEffect,
        isHeal
    } = spellInfo;
    const root = document.createDocumentFragment();
    const headlineTemplate = () => { return `${spellName} ${isHeal ? 'heals for' : 'does'} ${effectResult} ${isHeal ? '' : effectType + ' damage'}\n`; };
    const subHeadTemplate = () => { return `Targets must make a DC${saveDC} ${saveLabel} save`; };

    // string with rolling results
    const title = Title(headlineTemplate(), 'headline-small');
    const subTitle = saveDC ? Subtitle(subHeadTemplate()) : null;

    // flex row for roll info and labels
    const rollBox = Row('roll-box');

    // column for the spell effect dice, e.g., '2d6'
    const effectCol = RollInfoColumn(isHeal ? 'healing' : 'damage', effectDice).root;
    rollBox.appendChild(effectCol);

    // damage rolls
    const effRawCol = RollInfoColumn('roll results', rawEffect).root;
    rollBox.appendChild(effRawCol);
    if (effectModifier) {
        const effectModifierCol = RollInputColumn('modifier', effectModifier).root;
        rollBox.appendChild(effectModifierCol);
    }
    rollBox.appendChild(FlexSpacer());

    // order of elements in box
    root.appendChild(title);
    root.appendChild(subTitle);
    root.appendChild(document.createElement('br'));
    root.appendChild(rollBox);
    DISPLAY_BOX_CONTENT.innerHTML = '';
    DISPLAY_BOX_CONTENT.appendChild(root);
}

// Sidebar
function addOnClickToSidebarSpells () {
    const primaryBoxSpellAttackElement = document.querySelectorAll('.ct-spells-level-casting__info-item')[1];
    // grabs spell attack mod from primary content box
    if (primaryBoxSpellAttackElement && (SPELL_ATTACK_MOD === undefined)) {
        SPELL_ATTACK_MOD = primaryBoxSpellAttackElement.textContent;
        console.log('got spell attack to hit in loop: ' + SPELL_ATTACK_MOD);
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
            console.log('adding event listener to sidebar damage box');
        }
    }
}

// event handler for sidebar box containing damages
async function rollSpellSideBar (e) {
    if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        console.log('rolling from sidebar');
        const target = e.currentTarget;
        const spellName = document.querySelector('.ct-sidebar__heading').textContent;
        const effectDice = target.children[0].textContent;
        const damageType = target.querySelector('.ct-tooltip').dataset.originalTitle.toLowerCase();
        const restriction = target.children[2];
        console.log({ spellName });
        console.log({ effectDice });
        console.log({ damageType });
        console.log({ restriction });

        // if effect is a spell attack, roll spell attack
        if (restriction && restriction.innerText.toLowerCase().includes('on hit')) {
            console.log('found spell attack', e);
            return attackAndDamageRoll(e, 'sidebar-spell');
        }

        // checks if spell has a save, and if so adds it to the spell object

        const roll = await dispatchToBackground({ type: 'SPECIAL_ROLL', data: effectDice });
        console.log(roll.result);
        console.log(roll.result.match(/\d+(?=\*)/g));
        const result = roll.result.match(/\d+(?=\*)/g)[0];
        const raw = roll.result.match(/[\d, ]+(?=\()/g);

        return renderSideBarSpell({ spellName, effectDice, result, raw, damageType }, 'sidebar-spell-effect');
    }
}


function renderSideBarSpell ({ spellName, effectDice, result, raw, damageType }) {
    // then add other things
    const root = document.createDocumentFragment();
    const title = Title(`${spellName}:\n`);
    const subTitle = Subtitle(`${result} ${damageType} damage`);
    root.appendChild(title);
    root.appendChild(subTitle);
    root.appendChild(document.createElement('br'));

    const rollBox = Row('roll-box');
    // show dice to be rolled
    const effDiceCol = RollInfoColumn('dice', effectDice).root;
    // show result
    const resultCol = RollInfoColumn('result', result).root;
    // show raw
    const rawCol = RollInfoColumn('raw', raw).root;

    rollBox.appendChild(effDiceCol);
    rollBox.appendChild(resultCol);
    rollBox.appendChild(rawCol);
    rollBox.appendChild(FlexSpacer());
    root.appendChild(rollBox);

    DISPLAY_BOX_CONTENT.innerHTML = '';
    DISPLAY_BOX_CONTENT.appendChild(root);
}
class ThemeWatcher {
    constructor (pollFrequency = 1000) {
        this.pollFrequency = pollFrequency;
        this.pollTarget = document.getElementsByClassName('ct-character-header-desktop__button');
        this.pollFallbackTarget = document.getElementsByClassName('ct-status-summary-mobile__health');
        this.styleSheet = document.head.appendChild(document.createElement('style')).sheet;
        this.color = '';
        this.darker = '';
        this.intervalHandle = null;

        this.setColor = this.setColor.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.themeWatcherDidConstruct = this.themeWatcherDidConstruct.bind(this);
        this.poll = this.poll.bind(this);
        this.injectNewTheme = this.injectNewTheme.bind(this);

        // default color
        this.setColor('rgb(197,49,49)');
        this.themeWatcherDidConstruct();
    }

    start () {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        this.intervalHandle = setInterval(this.poll, this.pollFrequency);
    }

    stop () {
        clearInterval(this.intervalHandle);
    }

    themeWatcherDidConstruct () {
        console.log('Theme watcher constructed, checking theme');
        chrome.storage.sync.get(['themeColor'], (result) => {
            console.log('storage found', result);
            if (result.themeColor && result.themeColor !== this.color) {
                this.setColor(result.themeColor);
                this.injectNewTheme(result.themeColor);
            }
        });
    }

    setColor(color) {
        this.color = color;
        const [red, green, blue] = this.color.match(/\d+/g)
        this.darker = `rgb(${parseInt(red * .8)},${parseInt(green * .8)},${parseInt(blue * .8)})`;
    }

    poll () {
        let newColor;
        // handle desktop layout
        if (this.pollTarget[0]) {
            newColor = window.getComputedStyle(this.pollTarget[0]).getPropertyValue('border-color').replace(/ /g, '');
        }
        // handle mobile
        if (this.pollFallbackTarget[0]) {
            newColor = window.getComputedStyle(this.pollFallbackTarget[0]).getPropertyValue('border-color').replace(/ /g, '');
        }
        if (newColor && this.color !== newColor) {
            this.setColor(newColor);
            dispatchToBackground({ type: 'THEME_CHANGE', data: newColor });
            this.injectNewTheme(newColor);
        }
    }

    injectNewTheme(color = this.color) {
        // clear old rules
        console.log('changing theme color to', color);
        while (this.styleSheet.cssRules.length) {
            this.styleSheet.deleteRule(0);
        }
        // initiative, ability checks
        // TODO: handle mobile
        this.styleSheet.insertRule(`.simple-mouseover:hover span { color: ${color}; }`);
        // saves
        // please note that the svgs have a dynamic fill color off the screen to your right
        const svg = `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20116.1%2034'%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M106.8%200h-22l-.3.2c-1.2.8-2.3%201.7-3.2%202.7H5.7l-.3.4c-.7%201.2-3%204.5-4.9%205.4l-.5.2V25l.5.2c1.8.9%204.1%204.2%204.9%205.4l.3.4h75.6c1%201%202.1%201.9%203.2%202.7l.3.2h21.9l.3-.2c5.6-3.8%209-10%209-16.8s-3.4-13-9-16.8l-.2-.1zm7.3%2017c0%205.8-2.9%2011.2-7.6%2014.5H96.2c-4.7-2.1-11.1-3.2-14.3-3.8-2.3-3-3.7-6.8-3.7-10.7%200-3.9%201.3-7.7%203.7-10.7%203.1-.6%209.5-1.7%2014.3-3.8h10.3c4.8%203.3%207.6%208.7%207.6%2014.5zM69.8%204.6c.8.7%202.5%201.8%205.7%202.1-.9%201.5-3%205.5-3%2010.3s2%208.8%203%2010.3c-3.2.3-4.9%201.4-5.7%202.1H14.4c-3.1-1.1-11.1-4.5-12.9-9.3v-6.2c1.9-4.8%209.9-8.1%2012.9-9.3h55.4zm6.8%202.2h2a20.4%2020.4%200%200%200-2.8%2010.3c0%203.7%201%207.2%202.9%2010.3-.7%200-1.3-.1-2%200-.6-1-3.1-5.2-3.1-10.2s2.4-9.4%203-10.4zm9.3%2024.7c-1.1-.8-2.1-1.7-3-2.6%202.4.5%205.1%201.3%208.3%202.6h-5.3zm-6.7-3.2l.8%201.1h-8.5c1.4-.7%203.8-1.5%207.7-1.1zM6.3%2029.4c-.7-1.1-2.8-4.1-4.9-5.4v-1.9c2.3%203.4%207.1%205.9%2010.4%207.3H6.3zM1.4%2010c2.1-1.3%204.2-4.3%204.9-5.4h5.5C8.5%206%203.8%208.5%201.4%2011.9V10zM80%204.6l-.8%201.1c-3.9.4-6.3-.4-7.7-1.1H80zm2.9.5c.9-1%201.9-1.9%203-2.6h5.3c-3.2%201.3-6%202.1-8.3%202.6z'%20%2F%3E%3C%2Fsvg%3E"`;
        const svgSmall = `"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2088%2028'%3E%3Cpath%20fill%3D'${encodeURI(color)}'%20d%3D'M81.02%200H64.332l-.228.165a13.192%2013.192%200%200%200-2.427%202.23H4.324l-.227.33c-.531.992-2.276%203.717-3.718%204.46L0%207.352V20.65l.38.165c1.365.744%203.11%203.47%203.717%204.46l.227.33h57.352a20.967%2020.967%200%200%200%202.427%202.23l.228.166h16.614l.227-.165A17.166%2017.166%200%200%200%2088%2013.959%2017.166%2017.166%200%200%200%2081.172.083zm5.539%2014.041a15.101%2015.101%200%200%201-5.766%2011.977H72.98c-3.565-1.735-8.42-2.643-10.848-3.139a15.532%2015.532%200%200%201-2.807-8.838%2014.986%2014.986%200%200%201%202.807-8.837c2.352-.496%207.207-1.405%2010.848-3.14h7.814a14.88%2014.88%200%200%201%205.766%2011.977zM52.952%203.8a7.091%207.091%200%200%200%204.324%201.735A18.402%2018.402%200%200%200%2055%2014.04a17.505%2017.505%200%200%200%202.276%208.508%207.091%207.091%200%200%200-4.324%201.734H10.924c-2.352-.909-8.42-3.717-9.786-7.681V11.48c1.441-3.965%207.51-6.69%209.786-7.682h42.028zm5.158%201.817h1.518a18.006%2018.006%200%200%200-2.125%208.508%2017.221%2017.221%200%200%200%202.2%208.507%209.309%209.309%200%200%200-1.517%200%2018.184%2018.184%200%200%201-2.352-8.425%2019.362%2019.362%200%200%201%202.276-8.59zm7.056%2020.402a19.91%2019.91%200%200%201-2.276-2.148%2034.161%2034.161%200%200%201%206.296%202.148zm-5.083-2.643c.227.33.38.578.607.908h-6.45a9.567%209.567%200%200%201%205.842-.908zm-55.304.908a15.79%2015.79%200%200%200-3.717-4.46v-1.57c1.745%202.809%205.386%204.874%207.89%206.03H4.779zM1.062%208.26A15.789%2015.789%200%200%200%204.78%203.8h4.173c-2.504%201.156-6.07%203.22-7.89%206.029v-1.57zM60.69%203.8c-.228.33-.38.578-.607.908a9.566%209.566%200%200%201-5.842-.909zm2.2.412a11.529%2011.529%200%200%201%202.276-2.147h4.02a36.164%2036.164%200%200%201-6.296%202.147z'%2F%3E%3C%2Fsvg%3E"`;
        this.styleSheet.insertRule(`@media (max-width: 1199px) and (min-width: 1024px) { div.saving-throw-mouseover:hover { background-image: url(${svgSmall}); } }`);
        this.styleSheet.insertRule(`.saving-throw-mouseover:hover { background-image: url(${svg})}`);
        this.styleSheet.insertRule(`.saving-throw-mouseover:hover .ct-no-proficiency-icon { border: .5px solid ${color}}`);
        // skills
        this.styleSheet.insertRule(`.skills-pane-mouseover:hover { color: ${color}; font-weight: bolder; }`);
        // primary box
        this.styleSheet.insertRule(`.primary-box-mouseover:hover { color: ${color}; font-weight: bolder; }`);
        // sidebar damage
        this.styleSheet.insertRule(`.sidebar-damage-box:hover { color: ${color}; font-weight: bolder;}`);
        // encounter saves text
        this.styleSheet.insertRule(`.text-mouseover:hover { color: ${color}; font-weight: bolder; }`);
        // display box buttons
        this.styleSheet.insertRule(`.display-box-button.active { background-color: ${color}; }`)
        this.styleSheet.insertRule(`.display-box-button.active:hover { background-color: ${this.darker}; }`)
    }
}

// makes a display box
class DisplayBox {
    constructor () {
        this.root = document.createElement('div');
        this.root.id = 'display-box';
        this.root.className = 'ct-box-background ct-box-background--fancy-small';

        this.contentBox = document.createElement('div');
        this.contentBox.id = 'display-box-content';
        this.contentBox.innerText = 'Welcome to Dicemagic.Beyond! \nRoll: shift-click \nAdvantage: shift-space-click \nDisadvantage: shift-alt-click';
        this.root.appendChild(this.contentBox);

        document.body.appendChild(this.root);

        this.start = this.start.bind(this);
        this.makeDraggable = this.makeDraggable.bind(this);
        this.renderSimple = this.renderSimple.bind(this);
        this.renderAttack = this.renderAttack.bind(this);
        this.renderCustomRoll = this.renderCustomRoll.bind(this);
    }
    start () {
        this.makeDraggable();
    }
    makeDraggable () {
        const element = this.root;
        let pos1, pos2, pos3, pos4;
        pos1 = pos2 = pos3 = pos4 = 0;
        element.style.top = '100px';
        element.style.left = '100px';
        element.addEventListener('mousedown', startDrag);

        function startDrag (event) {
            if (event.button === 0 && event.currentTarget.id === 'display-box') {
                console.log('start');
                pos3 = event.clientX;
                pos4 = event.clientY;
                document.addEventListener('mouseup', stopDragging);
                document.addEventListener('mousemove', dragElement);
                document.addEventListener('click', stopClick, true);
            }
        }

        function dragElement (event) {
            console.log('moving');
            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;
            element.style.top = (element.offsetTop - pos2) >= 0 ? (element.offsetTop - pos2) + 'px' : 0 + 'px';
            element.style.left = (element.offsetLeft - pos1) >= 0 ? (element.offsetLeft - pos1) + 'px' : 0 + 'px';
        }

        function stopDragging (event) {
            console.log('stop');
            document.removeEventListener('mouseup', stopDragging);
            document.removeEventListener('mousemove', dragElement);
        }

        function stopClick (event) {
            console.log('stopclick');
            event.preventDefault();
            event.stopPropagation();
            document.removeEventListener('click', stopClick, true);
        }
    }
    renderSimple (props) {
        const { creatureName, rollName, result, first, high, low, modifier, advantageState } = props;
        const root = document.createDocumentFragment();

        // string with rolling results
        const title = Title(creatureName);
        const subtitle = Subtitle(rollName);

        const rollInfoRow = Row('roll-box');

        const rollResultColumn = RollResultColumn('result', result);
        const rollResult = rollResultColumn.value;
        rollInfoRow.append(rollResultColumn.root);
        // raw roll result
        const rawRollColumn = RollInfoColumn('raw', '');
        const raw = rawRollColumn.value;
        rollInfoRow.append(rawRollColumn.root);

        // roll modifier w/input
        const modifierColumn = RollInputColumn('modifier', 0);
        const mod = modifierColumn.value;
        rollInfoRow.append(modifierColumn.root);

        rollInfoRow.append(FlexSpacer());

        // advantage buttons
        // container for advantage buttons
        const buttonBox = Row('button-box');

        // normal
        const norm = TabBtn('normal', first);
        buttonBox.appendChild(norm);
        // advantage
        const adv = TabBtn('advantage', high);
        buttonBox.appendChild(adv);

        // disadvantage
        const dAdv = TabBtn('disadvantage', low);
        buttonBox.appendChild(dAdv);

        const btns = [norm, adv, dAdv];
        btns[advantageState].activate();

        function renderText (newRoll, newModifier) {
            console.log('rendering', newRoll, newModifier);
            rollResult.innerText = parseInt(newRoll, 10) + parseInt(newModifier, 10);
            raw.innerText = newRoll;
            mod.value = parseInt(newModifier, 10);
        }

        // function to toggle advantage buttons
        function advantageToggle (e) {
            if (e.button === 0) {
                btns.forEach((btn) => { return btn.deActivate(); });
                e.currentTarget.activate();
                console.log({ 'roll': e.currentTarget.dataset.value, 'mod': mod.value });
                renderText(e.currentTarget.dataset.value, mod.value);
            }
        }
        // first render
        renderText(result, modifier);

        // handle new modifier input
        mod.addEventListener('change', (e) => { return renderText(parseInt(raw.innerText, 10), e.target.value); });
        // handle changes in advantage
        btns.forEach((btn) => { return btn.addEventListener('mousedown', advantageToggle); });

        // order of elements in box
        root.append(title, subtitle);
        root.appendChild(buttonBox);
        root.appendChild(rollInfoRow);

        this.contentBox.innerHTML = '';
        this.contentBox.appendChild(root);
    }
    renderAttack (props) {
        console.log('rendering attack');
        const {
            hitResult,
            hitNormalVantage,
            hitAdvantage,
            hitDisadvantage,
            hitModifier,
            damageModifier,
            damageType,
            normalDamage,
            criticalDamage,
            advantageState
        } = props;
        const root = document.createDocumentFragment();

        const title = Title('');
        const subTitle = Subtitle('');

        // flex row for roll info and labels
        const rollBox = Row('roll-box');

        // raw hit
        const rawHitColumn = RollInfoColumn('hit', '');
        const rawHit = rawHitColumn.value;
        rollBox.appendChild(rawHitColumn.root);

        // hit modifier number input
        const hitModColumn = RollInputColumn('modifier', 0);
        const hitMod = hitModColumn.value;
        rollBox.appendChild(hitModColumn.root);

        // raw damage
        const rawDmgColumn = RollInfoColumn('damage', '');
        const dmg = rawDmgColumn.value;
        rollBox.appendChild(rawDmgColumn.root);

        // damage modifier number input
        const dmgModColumn = RollInputColumn('modifier', 0);
        const dmgMod = dmgModColumn.value;
        rollBox.appendChild(dmgModColumn.root);

        // advantage buttons
        // container for advantage buttons
        const buttonBox = Row('button-box');
        // normal
        const norm = TabBtn('normal', 0);
        buttonBox.appendChild(norm);
        // advantage
        const adv = TabBtn('advantage', 1);
        buttonBox.appendChild(adv);

        // disadvantage
        const dAdv = TabBtn('disadvantage', 2);
        buttonBox.appendChild(dAdv);

        const btns = [norm, adv, dAdv];
        btns[advantageState].activate();

        // function to toggle advantage buttons
        function advantageToggle (e) {
            if (e.button === 0) {
                btns.forEach((btn) => { return btn.deActivate(); });
                e.currentTarget.activate();
                const i = e.currentTarget.dataset.value;
                const rawOptions = [hitNormalVantage, hitAdvantage, hitDisadvantage];
                // hit, mod, damage, criticalDamage
                console.log('advantageToggle', { newHit: rawOptions[i], newHitMod: hitMod.value, newDmg: dmgMod.value });
                renderText(rawOptions[i], hitMod.value, dmgMod.value);
            }
        }
        // handle new modifier input
        hitMod.addEventListener('change', (e) => {
            console.log({ newHit: rawHit.innerText, newHitMod: e.target.value, newDmg: dmgMod.value });
            renderText(parseInt(rawHit.innerText, 10), e.target.value, dmgMod.value);
        });
        dmgMod.addEventListener('change', (e) => {
            console.log({ newHit: rawHit.innerText, newHitMod: hitMod.value, newDmg: e.target.value });
            renderText(parseInt(rawHit.innerText, 10), hitMod.value, e.target.value);
        });
        // handle changes in advantage
        btns.forEach((btn) => { return btn.addEventListener('mousedown', advantageToggle); });
        // function to update roll
        // encloses all of the above elements
        const renderText = (newHit, newHitModifier, newDamageModifier) => {
            // handle critical hit
            if (parseInt(newHit, 10) === 20) {
                title.innerText = 'Critical hit!\n';
                subTitle.innerText = `If you strike true: ${parseInt(criticalDamage, 10) + parseInt(newDamageModifier, 10)} ${damageType} damage!`;
                dmg.innerText = criticalDamage;

            // handle critical miss
            } else if (parseInt(newHit, 10) === 1) {
                title.innerText = 'Critical miss...\n';
                subTitle.innerText = 'Better Luck next time';
                dmg.innerText = normalDamage;

            // handle normal hits
            } else {
                // title / subtitle
                title.innerText = `You rolled ${parseInt(newHit, 10) + parseInt(newHitModifier, 10)} to hit.\n`;
                subTitle.innerText = `If you strike true: ${parseInt(normalDamage, 10) + parseInt(newDamageModifier, 10)} ${damageType} damage!`;
                dmg.innerText = normalDamage;
            }
            // hit
            rawHit.innerText = newHit;
            hitMod.value = parseInt(newHitModifier, 10);
            // damage
            dmgMod.value = parseInt(newDamageModifier, 10);
        };
        // first render of text:
        renderText(hitResult, hitModifier, damageModifier);
        // order of elements in display.
        root.append(title, subTitle);
        root.appendChild(document.createElement('br'));
        root.appendChild(buttonBox);
        root.appendChild(rollBox);
        // browser rerenders once
        this.contentBox.innerHTML = '';
        this.contentBox.appendChild(root);
    }

    renderCustomRoll (roll, optionsObject = {}) {
        const { cmd, result } = roll;

        const defaultOptions = {
            titleText: 'Custom Roll',
            subtitleText: 'fingers crossed...'
        };
        const { titleText, subtitleText } = Object.assign(defaultOptions, optionsObject);
        console.log(titleText);
        const rolls = result.split('\n');
        const root = document.createDocumentFragment();
        // render header
        const titleEl = Title(titleText + '\n');
        console.log(titleEl);
        root.appendChild(titleEl);
        const subtitleEl = Subtitle(subtitleText);
        root.appendChild(subtitleEl);
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'results-command-header';
        resultsHeader.innerText = 'result \u2022 ';
        resultsHeader.style.color = THEME_WATCHER.color;
        const command = document.createElement('span');
        command.className = 'results-command';
        command.innerText = cmd;
        resultsHeader.appendChild(command);
        root.appendChild(resultsHeader);
        // render roll(s)
        const resultCharWidth = rolls.reduce((max, next) => {
            let [raw, result] = next.split(' = '); // eslint-disable-line
            if (result) {
                result = result.replace(/\*/g, '');
                if (result.length > max) {
                    max = result.length;
                    return max;
                }
            }
            return max;
        }, 0);
        rolls.forEach((roll) => {
            const [raw, result] = roll.split(' = ');
            const row = document.createElement('div');
            if (result) {
                const resultSpan = document.createElement('span');
                resultSpan.className = 'roll-result-text';
                resultSpan.style.color = THEME_WATCHER.color;
                resultSpan.innerText = result.replace(/\*/g, '').padStart(resultCharWidth, '\xa0');
                const rawSpan = document.createElement('span');
                rawSpan.className = 'roll-raw-text';
                rawSpan.innerText = raw;
                row.appendChild(resultSpan);
                row.appendChild(rawSpan);
            } else {
                // handle "total: xx" at the end
                const totalSpan = document.createElement('span');
                totalSpan.innerText = roll;
                totalSpan.className = 'roll-total-text';

                row.appendChild(totalSpan);
            }
            root.appendChild(row);
        });
        this.contentBox.innerHTML = '';
        this.contentBox.appendChild(root);
    }
}

// advantage/disadvantage logic
class SpacebarListener {
    constructor () {
        SPACEPRESSED = false;
        this.keydown = null;
        this.keyup = null;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }
    start () {
        if (this.keydown) {
            clearInterval(this.keydown);
        }
        if (this.keyup) {
            clearInterval(this.keyup);
        }
        SPACEPRESSED = false;
        this.keydown = window.addEventListener('keydown', function (e) {
            if (SPACEPRESSED === false && e.key === ' ' && e.shiftKey) {
                e.preventDefault();
                SPACEPRESSED = true;
            }
        });
        this.keyup = window.addEventListener('keyup', function (e) {
            if (e.key === ' ') {
                SPACEPRESSED = false;
            }
        });
    }
    stop () {
        clearInterval(this.keyup);
        clearInterval(this.keydown);
        SPACEPRESSED = false;
    }
}
function determineAdvantage (e) {
    // advantage
    if (SPACEPRESSED) {
        console.log('Advantage!');
        return 1;
    // disadvantage
    } else if (e.altKey) {
        console.log('Disadvantage!');
        return 2;
    }
    // normal
    return 0;
}

function refreshClicks () {
    addOnClickToSkills();
    addOnclickToPrimaryBox();
    addOnClickToSidebarSpells();
}
let CHARACTER_SHEET_WATCHER;
let THEME_WATCHER;
let SPACEBAR_LISTENER;
let SPACEPRESSED;
let INITIATIVE_LISTENER;
let ABILITY_LISTENER;
let SAVES_LISTENER;
let DISPLAY_BOX;
let DISPLAY_BOX_CONTENT;
let SPELL_ATTACK_MOD; // holds spell attack modifier in case users roll from their sidebar without the primary box spells tab open
function onLoad (pollFrequency) {
    CHARACTER_SHEET_WATCHER = new CharacterSheetWatcher(pollFrequency);
    CHARACTER_SHEET_WATCHER.start();

    SPACEBAR_LISTENER = new SpacebarListener(pollFrequency);
    SPACEBAR_LISTENER.start();

    DISPLAY_BOX = new DisplayBox();
    DISPLAY_BOX_CONTENT = DISPLAY_BOX.contentBox;
    DISPLAY_BOX.start();

    THEME_WATCHER = new ThemeWatcher(pollFrequency);
    THEME_WATCHER.start();

    INITIATIVE_LISTENER = new InitiativeListener(pollFrequency);
    INITIATIVE_LISTENER.start();

    ABILITY_LISTENER = new AbilityListener(pollFrequency);
    ABILITY_LISTENER.start();

    SAVES_LISTENER = new SavesListener(pollFrequency);
    SAVES_LISTENER.start();

    setInterval(refreshClicks, pollFrequency);

}
if (typeof window !== 'undefined') {
    const pollFrequency = 1000; // ms
    onLoad(pollFrequency);
} else {
    module.exports = {
        // chrome messaging
        dispatchToBackground,

        // initiative
        InitiativeListener,

        // ability checks
        AbilityListener,

        // saves
        SavesListener,

        // skill checks
        addOnClickToSkills,
        rollSkillCheck,

        // primary box
        addOnclickToPrimaryBox,

        attackAndDamageRoll,

        rollSpellPrimaryBox,
        renderPrimaryBoxSpells,

        // sidebar
        addOnClickToSidebarSpells,
        rollSpellSideBar,
        renderSideBarSpell,

        // classes
        ThemeWatcher,
        DisplayBox,
        SpacebarListener,

        // helper functions
        determineAdvantage,
        refreshClicks
    };
}

