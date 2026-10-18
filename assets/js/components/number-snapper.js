const numberSnapperCSS = `
:host {
  container-type: inline-size;
  display: block;
}
fieldset {
  border: 0;
  display: grid;
  font-family: var(--number-snapper-ff, ui-sans-serif, system-ui);
  margin: 0;
  padding: 0;
  row-gap: var(--number-snapper-rg, 0.875rem);
  text-align: center;
  user-select: none;
}
input {
  background: #0000;
  grid-area: 1 / 1;
  margin: 0;
}
input:focus-visible { outline: none; }
label {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr min-content;
  position: relative;
  row-gap: var(--number-snapper-label-rg, 0.25rem);
}
label:has(:focus-visible) {
  outline: 1px var(--number-snapper-outline-style, solid) var(--number-snapper-outline-c, #ccc);
  outline-offset: var(--number-snapper-outline-off, 4px);
}
label::after {
  background: var(--number-snapper-indicator-bg, #eee);
  border-radius: var(--number-snapper-indicator-bdrs, 3px);
  content: "";
  display: block;
  grid-area: 1 / 1;
  height: var(--number-snapper-indicator-h, 32px);
  place-self: center;
  pointer-events: none;
  width: var(--number-snapper-indicator-w, 5px);
}
label::before {
  background: var(--number-snapper-triangle-bg, #eee);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  content: "";
  display: block;
  height: var(--number-snapper-triangle-h, 5px);
  place-self: end center;
  pointer-events: none;
  width: var(--number-snapper-triangle-w, 10px);
}
legend {
  color: var(--number-snapper-legend-c, #eee);
  display: contents;
  font-size: var(--number-snapper-legend-fs, 0.875rem);
  font-weight: var(--number-snapper-legend-fw, 400);
}
li {
  background: var(--number-snapper-minor-tick-bg, #ccc);
  border-radius: var(--number-snapper-minor-tick-bdrs, 1px);
  height: var(--number-snapper-minor-tick-h, 70%);
  list-style: none;
  position: relative;
  scroll-snap-align: center;
  width: var(--number-snapper-minor-tick-w, 1px);
  z-index: 1;
}
li[title],
:host([interval="2"]) li:nth-of-type(2n + 1),
:host([interval="3"]) li:nth-of-type(3n + 1),
:host([interval="4"]) li:nth-of-type(4n + 1),
:host([interval="5"]) li:nth-of-type(5n + 1),
:host([interval="10"]) li:nth-of-type(10n + 1) {
  background: var(--number-snapper-major-tick-bg, #ccc);
  border-radius: var(--number-snapper-major-tick-bdrs, 2px);
  height: var(--number-snapper-major-tick-h, 100%);
  width: var(--number-snapper-major-tick-w, 2px);
}
ol { all: unset; }
output {
  color: var(--number-snapper-output-c, #eee);
  font-size: var(--number-snapper-output-fs, 2rem);
  font-variant-numeric: tabular-nums;
  font-weight: var(--number-snapper-output-fw, 600);
}
[data-scroll] {
  cursor: ew-resize;
  display: block;
  grid-area: 1 / 1 / 1 / 1;
  inset: 0;
  mask: var(--number-snapper-mask, linear-gradient(to right, #0000, #000 15%, #000 85%, #0000));
  overflow-x: auto;
  overscroll-behavior: none;
  position: absolute;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
}
[data-scroll].grabbing { cursor: grabbing; }
[data-scroll-bg] {
  display: grid;
  grid-template-columns: 50cqi var(--number-snapper-w, 200cqi) 50cqi;
  height: 100%;
  pointer-events: none;
}
[data-scroll-snap] {
  align-items: end;
  display: flex;
  justify-content: space-between;
  padding-block-end: var(--number-snapper-track-space, 0);
  position: relative;
  scroll-snap-type: x mandatory;
}
[data-scroll-snap]::after {
  background: var(--number-snapper-track-bg, transparent);
  border-radius: var(--number-snapper-track-bdrs, 999px);
  content: "";
  height: var(--number-snapper-track-h, 0);
  inset: auto 0 var(--number-snapper-track-bottom, 0) 0;
  pointer-events: none;
  position: absolute;
}
[data-scroll]::-webkit-scrollbar { display: none; }
:host([data-snap="none"]) [data-scroll-snap] {
  scroll-snap-type: none;
}
:host([snap="none"]) li,
:host([snap="value"]) li:not([title]),
:host([interval="2"][snap="major"]) li:not(:nth-of-type(2n + 1)),
:host([interval="3"][snap="major"]) li:not(:nth-of-type(3n + 1)),
:host([interval="4"][snap="major"]) li:not(:nth-of-type(4n + 1)),
:host([interval="5"][snap="major"]) li:not(:nth-of-type(5n + 1)),
:host([interval="10"][snap="major"]) li:not(:nth-of-type(10n + 1)) {
  scroll-snap-align: none;
}
[type="range"],
[type="range"]::-webkit-slider-runnable-track,
[type="range"]::-webkit-slider-thumb {
  appearance: none;
}
@container (max-width: 400px) {
  fieldset { --number-snapper-w: var(--number-snapper-w-xs, 600cqi); }
}
@container (min-width: 401px) and (max-width: 768px) {
  fieldset { --number-snapper-w: var(--number-snapper-w-md, 400cqi); }
}
@container (min-width: 1400px) {
  fieldset { --number-snapper-w: var(--number-snapper-w-lg, 100cqi); }
}
`;

let numberSnapperSheet = null;
try {
  if ('CSSStyleSheet' in window && 'replaceSync' in CSSStyleSheet.prototype && 'adoptedStyleSheets' in Document.prototype) {
    numberSnapperSheet = new CSSStyleSheet();
    numberSnapperSheet.replaceSync(numberSnapperCSS);
  }
} catch (_) {
  numberSnapperSheet = null;
}

class NumberSnapper extends HTMLElement {
  #A;
  #E;
  #boundOnEnd;
  #boundOnMove;
  #isResizing = false;
  #root;
  #scrollRange;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    if (numberSnapperSheet) this.#root.adoptedStyleSheets = [numberSnapperSheet];
    this.#boundOnMove = this.#onMove.bind(this);
    this.#boundOnEnd = this.#onEnd.bind(this);
  }

  connectedCallback() {
    this.#A = {
      currency: this.getAttribute('currency') || 'USD',
      decimals: this.hasAttribute('decimals') ? parseInt(this.getAttribute('decimals'), 10) : 0,
      format: this.getAttribute('format') || 'integer',
      interval: this.getAttribute('interval') || '5',
      label: this.getAttribute('label') || '',
      lang: this.getAttribute('lang') || 'en-US',
      max: this.hasAttribute('max') ? parseFloat(this.getAttribute('max')) : 100,
      min: this.hasAttribute('min') ? parseFloat(this.getAttribute('min')) : 0,
      snap: this.getAttribute('snap') || 'none',
      step: this.hasAttribute('step') ? parseFloat(this.getAttribute('step')) : 1,
      ticks: this.hasAttribute('ticks') ? parseInt(this.getAttribute('ticks'), 10) : 10,
      unit: this.getAttribute('unit') || null,
      value: this.hasAttribute('value') ? parseFloat(this.getAttribute('value')) : 0
    };
    this.#A.range = this.#A.max - this.#A.min;

    this.#root.innerHTML = `
      ${numberSnapperSheet ? '' : `<style>${numberSnapperCSS}</style>`}
      <fieldset>
        <legend>${this.#A.label}</legend>
        <output name="out"></output>
        <label aria-label="${this.#A.label}">
          <input type="range" name="in" min="${this.#A.min}" max="${this.#A.max}" step="${this.#A.step}" value="${this.#A.value}">
          <span data-scroll tabindex="-1">
            <span data-scroll-bg>
              <i></i>
              <ol data-scroll-snap part="scroll-snap">
                ${Array.from({ length: this.#A.ticks + 1 }).map((_, i) => {
                  const tickValue = this.#A.min + ((i * this.#A.range) / this.#A.ticks);
                  return `<li value="${tickValue}"></li>`;
                }).join('')}
              </ol>
              <i></i>
            </span>
          </span>
        </label>
        <slot name="info"></slot>
      </fieldset>
    `;

    this.#E = {
      in: this.#root.querySelector('[name="in"]'),
      out: this.#root.querySelector('[name="out"]'),
      scroll: this.#root.querySelector('[data-scroll]'),
      snap: this.#root.querySelector('[data-scroll-snap]')
    };

    this.#scrollRange = this.#E.scroll.scrollWidth - this.#E.scroll.clientWidth;
    new ResizeObserver(() => {
      this.#isResizing = true;
      this.#scrollRange = this.#E.scroll.scrollWidth - this.#E.scroll.clientWidth;
      requestAnimationFrame(() => this.#update(false));
      setTimeout(() => { this.#isResizing = false; }, 200);
    }).observe(this.#E.scroll);

    this.#E.scroll.addEventListener('pointerdown', this.#onStart.bind(this));
    this.#root.addEventListener('input', () => this.#update());
    this.#E.scroll.addEventListener('scroll', () => this.#update(true));
    requestAnimationFrame(() => {
      this.#scrollRange = this.#E.scroll.scrollWidth - this.#E.scroll.clientWidth;
      this.#update();
    });
  }

  setValue(value) {
    if (!this.#E?.in) return;
    const next = Math.max(this.#A.min, Math.min(this.#A.max, parseFloat(value)));
    this.#E.in.value = next;
    this.#update(false);
  }

  getValue() {
    return this.#E?.in ? parseFloat(this.#E.in.value) : this.#A?.value ?? 0;
  }

  #format(num) {
    if (this.#A.format === 'integer') return String(num);
    const options = {
      style: this.#A.format,
      minimumFractionDigits: this.#A.decimals,
      maximumFractionDigits: this.#A.decimals,
      ...(this.#A.format === 'currency' ? { currency: this.#A.currency } : {}),
      ...(this.#A.format === 'unit' && this.#A.unit ? { unit: this.#A.unit } : {})
    };
    return new Intl.NumberFormat(this.#A.lang, options).format(num).replace(/\u00A0/g, ' ');
  }

  #snapValue(val) {
    const snapped = Math.round(val / this.#A.step) * this.#A.step;
    const clamped = Math.max(this.#A.min, Math.min(this.#A.max, snapped));
    if (this.#A.decimals > 0) return Number(clamped.toFixed(this.#A.decimals));
    return Math.round(clamped);
  }

  #update(fromScroll = false) {
    if (!this.#E?.scroll || !this.#E?.in) return;
    if (this.#isResizing && fromScroll) return;

    const safeScrollRange = Math.max(1, this.#scrollRange);
    const rawValue = fromScroll
      ? this.#A.min + ((this.#E.scroll.scrollLeft / safeScrollRange) * this.#A.range)
      : parseFloat(this.#E.in.value);

    const value = this.#snapValue(rawValue);
    const formattedValue = this.#format(value);

    this.#E.out.value = formattedValue;
    this.#E.in.ariaValueText = formattedValue;

    if (fromScroll) {
      this.#E.in.value = value;
    } else {
      this.#E.scroll.scrollLeft = ((value - this.#A.min) / this.#A.range) * safeScrollRange;
    }

    this.dispatchEvent(new CustomEvent('change', {
      detail: { value, formattedValue },
      bubbles: true,
      composed: true
    }));
  }

  #onMove(e) {
    this.#E.scroll.scrollLeft = this.#E.scroll.dataset.scroll - (e.clientX - this.#E.scroll.dataset.pointer);
  }

  #onEnd(e) {
    this.#E.scroll.classList.remove('grabbing');
    if (e && e.pointerId != null) {
      try { this.#E.scroll.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    document.removeEventListener('pointermove', this.#boundOnMove);
    document.removeEventListener('pointerup', this.#boundOnEnd);
    document.removeEventListener('pointercancel', this.#boundOnEnd);
  }

  #onStart(e) {
    e.stopPropagation();
    this.#E.scroll.dataset.pointer = e.clientX;
    this.#E.scroll.dataset.scroll = this.#E.scroll.scrollLeft;
    this.#E.scroll.classList.add('grabbing');
    this.#E.scroll.setPointerCapture(e.pointerId);
    document.addEventListener('pointermove', this.#boundOnMove);
    document.addEventListener('pointerup', this.#boundOnEnd);
    document.addEventListener('pointercancel', this.#boundOnEnd);
  }
}

customElements.define('number-snapper', NumberSnapper);
