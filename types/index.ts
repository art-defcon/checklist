export interface Checklist {
  id: string;
  hash: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  checklistId: string;
}