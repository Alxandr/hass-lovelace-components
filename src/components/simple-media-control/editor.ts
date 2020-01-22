import { CSSResult, LitElement, TemplateResult, css, customElement, html, property } from 'lit-element';
import { CardConfig, names } from './const';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';

const options = {
  required: {
    icon: 'tune',
    name: 'Required',
    secondary: 'Required options for this card to function',
    show: true,
  },
};

@customElement(names.editor)
export class SimpleMediaControlEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: CardConfig;
  @property() private _toggle?: boolean;

  public setConfig(config: CardConfig): void {
    this._config = config;
  }

  private get _entity(): string {
    if (this._config) {
      return this._config.entity || '';
    }

    return '';
  }

  private get _show_warning(): boolean {
    if (this._config) {
      return this._config.show_warning || false;
    }

    return false;
  }

  private get _show_error(): boolean {
    if (this._config) {
      return this._config.show_error || false;
    }

    return false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.keys(this.hass.states);
    return html`
      <div class="card-config">
        <div class="option" @click=${this._toggleOption} .option=${'required'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.required.icon}`}></ha-icon>
            <div class="title">${options.required.name}</div>
          </div>
          <div class="secondary">${options.required.secondary}</div>
        </div>
        ${options.required.show
          ? html`
              <div class="values">
                <paper-dropdown-menu
                  label="Entity (Required)"
                  @value-changed=${this._valueChanged}
                  .configValue=${'entity'}
                >
                  <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
                    ${entities.map(entity => {
                      return html`
                        <paper-item>${entity}</paper-item>
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _toggleOption(ev: Event): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev: Event, optionList: any): void {
    const show = !optionList[(ev.target! as any).option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[(ev.target! as any).option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target! as any;
    if ((this as any)[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        delete (this._config as any)[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }

      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }

      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }

      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }

      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }

      ha-switch {
        padding-bottom: 8px;
      }
    `;
  }
}
