export type CustomFieldType = 'TEXT' | 'DATE' | 'SELECT';

export interface CustomFieldDefinition {
  id: number;
  name: string;
  fieldType: CustomFieldType;
  options: string[] | null;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

export type CustomFieldValues = Record<string, string>;
