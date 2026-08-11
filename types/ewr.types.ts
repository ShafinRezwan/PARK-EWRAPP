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
  labour: LabourFormRow[];
  equipment: EquipmentFormRow[];
  materials: MaterialFormRow[];
  invoices: InvoiceFormRow[];
};


export type Jobs = {
  id: string;
  jobNumber: string;
  jobName: string;
  division: string;
  year: number;
};

export type WorkReports = {
  id: number;
  jobNumber: string;
  jobName: string;
  ewrNumber: string;
  dateOfWork: string;
  status: "Sent" | "Pending";
  divisionCode: string;
  year: string;
};

export   const divisions = [
    { code: "01", name: "Construction" },
    { code: "03", name: "ARC" },
    { code: "09", name: "Trucking" },
    { code: "10", name: "Snow Removal" },
    { code: "41", name: "Underground" },
    { code: "42", name: "Excavation" },
    { code: "43", name: "Landscaping" },
    { code: "90", name: "RCI" },
  ];


export type LabourRates = {
  id: number;
  employeeNumber: number;
  baseWorkClass: string;
  baseClassName: string;
  rate: number;
  saturdayRate: number;
  sundayRate: number;
};

export type EquipmentRates = {
  id: number;
  equipmentNumber: number;
  makeModelYear: string;
  description: string;
  rate: number;
  horsePower: number;
};

export type MaterialRates = {
  id: number;
  description: string;
  unit: string;
  rate: string;
};