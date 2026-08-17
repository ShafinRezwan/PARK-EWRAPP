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
  amount: string;
  invoiceAttachment: InvoiceAttachment | null;
};

export type InvoiceAttachment = {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  previewUrl: string;
};

export type EWRFormData = {
  recipient: string;
  jobNumber: string;
  date: string;
  jobName: string;
  description: string;
  ewrNumber: string;
  
  labour: LabourFormRow[];
  equipment: EquipmentFormRow[];
  materials: MaterialFormRow[];
  invoices: InvoiceFormRow[];
};

export const divisions = [
  { code: "01", name: "Construction" },
  { code: "03", name: "ARC" },
  { code: "09", name: "Trucking" },
  { code: "10", name: "Snow Removal" },
  { code: "41", name: "Underground" },
  { code: "42", name: "Excavation" },
  { code: "43", name: "Landscaping" },
  { code: "90", name: "RCI" },
];