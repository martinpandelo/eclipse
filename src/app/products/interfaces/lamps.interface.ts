export interface LampsResponse {
  lamps: Lamp[];
}

export interface Lamp {
  id:    number;
  name:  string;
  image: string;
}
