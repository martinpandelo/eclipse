export interface ColorsResponse {
  colors: Color[];
}

export interface Color {
  id:   number;
  name: string;
  hexa: string;
}
