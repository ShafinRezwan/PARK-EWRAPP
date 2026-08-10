export type LabourFormRow = {
  id: string;
  classification: string;
  hours: string;
  rate: string;
};

export type EquipmentFormRow = {
  id: string;
  name: string;
  unitNumber: string;
  hours: string;
  rate: string;
};

export type MaterialFormRow = {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  price: string;
};

export type invoices = {
  id: string;
  description: string;
  unit: string;
  quantity: string;
  price: string;
};