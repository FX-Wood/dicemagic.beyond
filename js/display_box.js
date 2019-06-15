// components for renderers
function Row(className) {
    const r = document.createElement('div');
    r.className = 'row';
    if (className) {
        r.classList.add(className);
    }
    return r;
}

function Col(className) {
    const c = document.createElement('div');
    c.className = 'col';
    if (className) {
        c.classList.add(className);
    }
    return c;
}
function TabBtn(text, value) {
    const el = document.createElement('div');
    el.innerText = text;
    el.dataset.value = value;
    el.className = 'display-box-button';
    el.activate = () => el.classList.add('active');
    el.deActivate = () => el.classList.remove('active');
    return el;
}
function FlexSpacer(className) {
    const div = document.createElement('div');
    div.className = 'grow';
    if (className) {
        div.classList.add(className);
    }
    return div;
}
function AttackTitle(text) {
    const el = document.createElement('p');
    el.className = 'subhead--attack';
    el.innerText = text;
    return el;
}
function AttackMeta(text) {
    const el = document.createElement('p');
    el.className = 'subhead--meta';
    el.innerText = text;
    return el;
}

/**
 * makes a span with title styling
 * @param {String} text content
 * @returns {HTMLParagraphElement} <span> [text] </span>
 */
function Title(text) {
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
function Subtitle(text) {
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
function RollInfoContent(text) {
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
function RollInputColumn(labelText, valueText) {
    const root = Col();
    const label = RollInfoLabel(labelText);
    const value = RollInfoInput(valueText);
    root.append(label, value);
    return { root, label, value };
}
/**
 * @typedef {Object} ResultsHeader
 * @property {HTMLDivElement} root container div
 * @property {HTMLSpanElement} text span containing main text
 * @property {HTMLSpanElement} subtext span containing secondary text
 */

/** ResultsHeader
 * @param {String} text main text. Usually the dice that were rolled, e.g, "2d6 + 4"
 * @param {String} subtext secondary text. Usually the type of damage or effect, e.g., "poison damage"
 * @return {ResultsHeader} 
 */
function ResultsHeader(text, subtext) {
    const root = document.createElement('div');
    root.className = 'results-header';
    const span1 = document.createElement('span');
    span1.className = 'results-header__text';
    span1.innerText = text;
    const divider = document.createElement('span');
    divider.className = 'results-header__text';
    divider.innerText = ' \u2022 ';
    const span2 = document.createElement('span');
    span2.className = 'results-header__subtext';
    span2.innerText = subtext;
    root.append(span1, divider, span2);
    return { root, text: span1, subtext: span2 };
}





export default class DisplayBox {
    constructor () {
        this.root = document.createElement('div');
        this.root.id = 'display-box';

        this.contentBox = document.createElement('div');
        this.contentBox.id = 'display-box-content';
        this.contentBox.append(
            Title('Dicemagic.Beyond'),
            Subtitle('Roll: shift-click'),
            Subtitle('Advantage: shift-space-click'),
            Subtitle('Disadvantage: alt-space-click'),
        );
        this.root.append(this.contentBox);

        document.body.append(this.root);

        this.start = this.start.bind(this);
        this.makeDraggable = this.makeDraggable.bind(this);
        this.renderSimple = this.renderSimple.bind(this);
        this.renderAttack = this.renderAttack.bind(this);
        this.renderCustomRoll = this.renderCustomRoll.bind(this);
        this.renderPrimaryBoxSpell = this.renderPrimaryBoxSpell.bind(this);
    }
    start () {
        this.makeDraggable();
    }
    makeDraggable () {
        console.log('makeDraggable')
        const element = this.root;
        let pos1, pos2, pos3, pos4;
        pos1 = pos2 = pos3 = pos4 = 0;
        element.style.top = '100px';
        element.style.left = '100px';
        
        function dragElement(event) {
            console.log('drag')
            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;
            element.style.top = (element.offsetTop - pos2) >= 0 ? (element.offsetTop - pos2) + 'px' : 0 + 'px';
            element.style.left = (element.offsetLeft - pos1) >= 0 ? (element.offsetLeft - pos1) + 'px' : 0 + 'px';
        }

        function stopDragging(event) {
            console.log('stopdrag')
            document.removeEventListener('mouseup', stopDragging);
            document.removeEventListener('mousemove', dragElement);
        }

        function stopClick(event) {
            console.log('stopclick')
            event.preventDefault();
            event.stopPropagation();
            document.removeEventListener('click', stopClick);
        }

        function startDrag(event) {
            console.log('startdrag')
            if (event.button === 0 && event.currentTarget.id === 'display-box') {
                pos3 = event.clientX;
                pos4 = event.clientY;
                document.addEventListener('mouseup', stopDragging);
                document.addEventListener('mousemove', dragElement);
                document.addEventListener('click', stopClick);
            }
        }

        element.addEventListener('mousedown', startDrag);
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
        rollInfoRow.append(modifierColumn.root, FlexSpacer());

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
            rollResult.innerText = parseInt(newRoll, 10) + parseInt(newModifier, 10);
            raw.innerText = newRoll;
            mod.value = parseInt(newModifier, 10);
        }

        // function to toggle advantage buttons
        function advantageToggle (e) {
            if (e.button === 0) {
                btns.forEach((btn) => btn.deActivate());
                e.currentTarget.activate();
                renderText(e.currentTarget.dataset.value, mod.value);
            }
        }
        // first render
        renderText(result, modifier);

        // handle new modifier input
        mod.addEventListener('change', (e) => renderText(parseInt(raw.innerText, 10), e.target.value));
        // handle changes in advantage
        btns.forEach((btn) => btn.addEventListener('mousedown', advantageToggle));

        // order of elements in box
        root.append(title, subtitle);
        root.appendChild(buttonBox);
        root.appendChild(rollInfoRow);

        this.contentBox.innerHTML = '';
        this.contentBox.appendChild(root);
    }

    renderAttack (props) {
        console.log('renderAttack', props)
        const {
            creatureName,
            rollName,
            rollMeta,
            hitResult,
            hitNormalVantage,
            hitAdvantage,
            hitDisadvantage,
            hitModifier,
            damageModifier,
            damageType,
            normalDamage,
            criticalDamage,
            advantageState,
            damageDice,
            criticalDice
        } = props;
        const root = document.createDocumentFragment();

        const title = Title(creatureName);
        const subtitle = AttackTitle(rollName);
        const meta = AttackMeta(rollMeta);

        const hitRow = Row('roll-box');

        const hitColumn = RollResultColumn('hit', hitResult);
        const hitResultValue = hitColumn.value;
        hitRow.append(hitColumn.root);

        // raw hit
        const rawHitColumn = RollInfoColumn('raw', '');
        const rawHit = rawHitColumn.value;
        hitRow.appendChild(rawHitColumn.root);

        // hit modifier number input
        const hitModColumn = RollInputColumn('modifier', 0);
        const hitMod = hitModColumn.value;
        hitRow.append(hitModColumn.root, FlexSpacer());

        const dmgHeader = ResultsHeader('', `${damageType} damage`);
        // flex row for roll info and labels
        const dmgRow = Row('roll-box');

        const dmgColumn = RollResultColumn('damage', 0);
        const dmgResultValue = dmgColumn.value;
        dmgRow.append(dmgColumn.root);

        // raw damage
        const rawDmgColumn = RollInfoColumn('raw', '');
        const dmg = rawDmgColumn.value;
        dmgRow.append(rawDmgColumn.root);

        // damage modifier number input
        const dmgModColumn = RollInputColumn('modifier', 0);
        const dmgMod = dmgModColumn.value;
        dmgRow.append(dmgModColumn.root, FlexSpacer());

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
                btns.forEach((btn) => btn.deActivate());
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
        btns.forEach((btn) => btn.addEventListener('mousedown', advantageToggle));
        // function to update roll
        // encloses all of the above elements
        const renderText = (newHit, newHitModifier, newDamageModifier) => {
            // handle critical hit
            if (parseInt(newHit) === 20) {
                hitResultValue.innerText = 'Crit';
                dmgResultValue.innerText = parseInt(criticalDamage) + parseInt(newDamageModifier);
                dmgHeader.text.innerText = `${criticalDice} ${parseInt(newDamageModifier) < 0 ? '-' : '+'} ${parseInt(newDamageModifier)}`;
                dmg.innerText = criticalDamage;

            // handle critical miss
            } else if (parseInt(newHit) === 1) {
                hitResultValue.innerText = 'Miss';
                dmgResultValue.innerText = parseInt(normalDamage) + parseInt(newDamageModifier);
                dmgHeader.text.innerText = `${damageDice} ${parseInt(newDamageModifier) < 0 ? '-' : '+'} ${parseInt(newDamageModifier)}`;
                dmg.innerText = normalDamage;

            // handle normal hits
            } else {
                hitResultValue.innerText = parseInt(newHit) + parseInt(newHitModifier);
                dmgResultValue.innerText = parseInt(normalDamage) + parseInt(newDamageModifier);
                dmgHeader.text.innerText = `${damageDice} ${parseInt(newDamageModifier) < 0 ? '-' : '+'} ${parseInt(newDamageModifier)}`;
                dmg.innerText = normalDamage;
            }
            // hit
            rawHit.innerText = parseInt(newHit);
            hitMod.value = parseInt(newHitModifier);
            // damage
            dmgMod.value = parseInt(newDamageModifier);
        };
        // first render of text:
        renderText(hitResult, hitModifier, damageModifier);
        // order of elements in display.
        root.append(title, subtitle, meta);
        root.append(buttonBox, hitRow);
        root.append(dmgHeader.root, dmgRow);
        // browser rerenders once
        this.contentBox.innerHTML = '';
        this.contentBox.appendChild(root);
    }

    renderPrimaryBoxSpell(props) {
        const {
            creatureName,
            rollName,
            rollMeta,
            saveDC,
            saveLabel,
            effectType,
            effectResult,
            effectDice,
            effectModifier,
            rawEffect,
            isHeal
        } = props;
        const root = document.createDocumentFragment();

        // string with rolling results
        const title = Title(creatureName);
        const subtitle = AttackTitle(rollName);
        const meta = AttackMeta(rollMeta);
        const header = ResultsHeader('', '');

        const effectRow = Row('roll-box');
        // result
        const effectMagnitudeColumn = RollResultColumn(isHeal ? 'healing' : 'damage', 0);
        effectRow.append(effectMagnitudeColumn.root);
        // raw roll
        const rawEffectColumn = RollInfoColumn('raw', rawEffect);
        effectRow.append(rawEffectColumn.root);
        // modifier
        const effectModifierColumn = RollInputColumn('modifier', 0);
        effectRow.append(effectModifierColumn.root);
        // save
        const effectSaveColumn = RollInfoColumn('save DC', '');
        if (saveDC) {
            effectSaveColumn.value.innerText = `${saveLabel.toUpperCase()} ${saveDC}`;
            effectSaveColumn.root.style.marginLeft = '10px';
            effectRow.append(effectSaveColumn.root);
        }
        effectRow.append(FlexSpacer());

        const renderText = (newModifier) => {
            header.text.innerText = `${effectDice} ${parseInt(newModifier) <= 0 ? '' : '+ ' + parseInt(newModifier)}`;
            header.subtext.innerText = effectType.toLowerCase() + ' damage';
            effectModifierColumn.value.innerText = parseInt(newModifier);
            effectMagnitudeColumn.value.innerText = parseInt(effectResult) + parseInt(newModifier);
        };
        // initial render of text
        renderText(effectModifier || 0);
        
        // allow changing modifier
        effectModifierColumn.value.addEventListener('change', (e) => renderText(e.target.value));
        
        // order of elements in box
        root.append(title, subtitle, meta);
        root.append(header.root, effectRow);
        this.contentBox.innerHTML = '';
        this.contentBox.append(root);
    }

    renderCustomRoll (roll, optionsObject = {}) {
        const { cmd, result } = roll;

        const defaultOptions = {
            titleText: 'Custom Roll',
            subtitleText: 'fingers crossed...'
        };
        const { titleText, subtitleText } = Object.assign(defaultOptions, optionsObject);
        const rolls = result.split('\n');
        const root = document.createDocumentFragment();
        // render header
        const titleEl = Title(titleText + '\n');
        root.appendChild(titleEl);
        const subtitleEl = Subtitle(subtitleText);
        root.appendChild(subtitleEl);
        const header = ResultsHeader('result \u2022 ', cmd);
        root.appendChild(header.root);
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
