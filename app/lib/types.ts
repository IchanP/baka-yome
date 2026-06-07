export type ImmersionKind = "reading" | "listening";

export type Entry = {
  id: string;
  userId: string | null;
  kind: ImmersionKind;
  title: string | null;
  /**  YYYY-MM-DD. */
  occurredOn: string;
  characters: number | null;
  minutes: number | null;
  /** ISO timestamp */
  createdAt: string;
};

export type NewEntry = {
  kind: ImmersionKind;
  title?: string | null;
  occurredOn?: string;
  characters?: number | null;
  minutes?: number | null;
  userId?: string | null;
};
