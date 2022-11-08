import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import type { AppEvent } from '../events';

export class ShipComponent extends Model {
  readonly kind = 'ShipComponent';

  public constructor(public id: string) {
    super();
  }

  public name = '';
  public type = '' as
    | 'ftl'
    | 'thruster'
    | 'generator'
    | 'weapon'
    | 'sensor'
    | 'shield'
    | 'armor'
    | 'augmentation';
  public powerDraw = 0;
  public crewRequirements = 0;
  public structuralStrength = 0;
  public resourceCosts = 0;

  public ftlSpeed = 0;
  public fuelConsumption = 0;

  public evasion = 0;

  public powerGeneration = 0;

  public weaponDamage = '';
  public weaponInitiative = 0;
  public ammoConsumption = 0;

  public sensorRange = 0;

  public shieldStrength = 0;
  public shieldRegeneration = 0;

  public armorStrength = 0;

  public crewCapacity = 0;
  public soldierCapacity = 0;
  public cargoCapacity = 0;
  public lifeSupport = 0;

  public previousComponent?: Promised<ShipComponent>;

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createShipComponent' && event.payload.id === this.id) {
      this.name = event.payload.name;
      this.type = event.payload.type;
      this.powerDraw = event.payload.powerDraw;
      this.crewRequirements = event.payload.crewRequirements;
      this.structuralStrength = event.payload.structuralStrength;
      this.resourceCosts = event.payload.resourceCosts;
      if (event.payload.previousComponentId) {
        this.previousComponent = promisedInstance('ShipComponent', {
          id: event.payload.previousComponentId,
        });
      }

      if (event.payload.type === 'ftl') {
        this.ftlSpeed = event.payload.ftlSpeed;
        this.fuelConsumption = event.payload.fuelConsumption;
      }

      if (event.payload.type === 'thruster') {
        this.evasion = event.payload.evasion;
      }

      if (event.payload.type === 'generator') {
        this.powerGeneration = event.payload.powerGeneration;
      }

      if (event.payload.type === 'weapon') {
        this.weaponDamage = event.payload.weaponDamage;
        this.weaponInitiative = event.payload.weaponInitiative;
        this.ammoConsumption = event.payload.ammoConsumption;
      }

      if (event.payload.type === 'sensor') {
        this.sensorRange = event.payload.sensorRange;
      }

      if (event.payload.type === 'shield') {
        this.shieldStrength = event.payload.shieldStrength;
        this.shieldRegeneration = event.payload.shieldRegeneration;
      }

      if (event.payload.type === 'armor') {
        this.armorStrength = event.payload.armorStrength;
      }

      if (event.payload.type === 'augmentation') {
        this.crewCapacity = event.payload.crewCapacity ?? 0;
        this.soldierCapacity = event.payload.soldierCapacity ?? 0;
        this.cargoCapacity = event.payload.cargoCapacity ?? 0;
        this.lifeSupport = event.payload.lifeSupport ?? 0;
      }
    }
  }
}

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    ShipComponent: ShipComponent;
  }
}

registerModel('ShipComponent', ShipComponent);
