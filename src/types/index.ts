export interface LabelData {
  count: number;
  mixes: string[];
}

export interface LabelsData {
  labels_count: Record<string, LabelData>;
}