export type AppEvent = {
  id: string;
  causationId: string;
  correlationId: string;
  type: string;
  version: number;
  payload?: any;
  createdAt: Date;
};
