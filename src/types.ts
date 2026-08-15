import type { LovelaceCardConfig } from "custom-card-helpers";

export interface SonosCardConfig extends LovelaceCardConfig {
  type: string;
  entities: string[];
  title?: string;
  volume_step?: number;
}
