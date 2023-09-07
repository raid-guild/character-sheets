export type Metadata = {
  name: string;
  description: string;
  image: string;
};

export type GameMeta = Metadata & {
  id: string;
  uri: string;
  owners: string[];
  masters: string[];
  characters: { id: string }[];
  classes: { id: string }[];
  items: { id: string }[];
  experience: string;
};

export type Game = Metadata & {
  id: string;
  uri: string;
  owners: string[];
  masters: string[];
  characters: Character[];
  classes: Class[];
  items: Item[];
  experience: string;
};

export type Character = Metadata & {
  id: string;
  name: string;
  characterId: string;
  account: string;
  player: string;
  experience: string;
  uri: string;
};

export type Class = {
  id: string;
  classId: string;
  name: string;
};

export type Item = {
  id: string;
  itemId: string;
  name: string;
};
