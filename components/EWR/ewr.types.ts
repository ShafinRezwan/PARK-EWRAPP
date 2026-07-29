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

export type InvoiceFormRow = {
  id: string;
  name: string;
  cost: string;
  markup: string;
};

export type EWRFormData = {
  recipient: string;
  jobNumber: string;
  date: string;
  jobName: string;
  description: string;
  labour: LabourFormRow[];
  equipment: EquipmentFormRow[];
  materials: MaterialFormRow[];
  invoices: InvoiceFormRow[];
};