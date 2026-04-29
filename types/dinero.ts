// Dinero.dk API models
// Fields marked // TODO: confirm against Dinero docs are inferred from common accounting API patterns.
// Update once you have access to the official OpenAPI spec or Dinero developer docs.

// ─── Shared primitives ────────────────────────────────────────────────────────

export type DineroDate = string; // ISO 8601, e.g. "2026-04-29"
export type DKK = number;        // Always in øre (integer) or decimal DKK — TODO: confirm Dinero's money representation

// ─── Token set (internal) ─────────────────────────────────────────────────────

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp ms
  tokenType: string; // "Bearer"
  scope?: string;
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: number;           // TODO: confirm — Dinero uses numeric org IDs
  name: string;
  cvr?: string;         // Danish company registration number
  address?: Address;
  phone?: string;
  email?: string;
  createdAt?: DineroDate;
  updatedAt?: DineroDate; // TODO: confirm field name
}

export interface Address {
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string; // ISO 3166-1 alpha-2, e.g. "DK"
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export type ContactType = 'Customer' | 'Supplier' | 'Both'; // TODO: confirm exact string values

export interface Contact {
  externalId?: string; // TODO: confirm field name (may be "ContactGuid")
  name: string;
  contactType: ContactType;
  cvr?: string;
  ean?: string;         // EAN for public invoicing (Danish e-invoicing standard)
  email?: string;
  phone?: string;
  address?: Address;
  bankAccount?: BankAccount;
  createdAt?: DineroDate;
  updatedAt?: DineroDate;
}

export interface BankAccount {
  bankRegNo?: string;   // Danish 4-digit bank reg number
  bankAccountNo?: string;
  iban?: string;
  swift?: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Overdue'
  | 'Paid'
  | 'Deleted'; // TODO: confirm all statuses against Dinero docs

export interface Invoice {
  guid?: string;          // TODO: confirm — may be "InvoiceGuid" or "id"
  number?: number;
  status: InvoiceStatus;
  date: DineroDate;
  dueDate?: DineroDate;
  contactId?: string;     // TODO: confirm — reference to Contact
  contactName?: string;
  description?: string;
  currency: string;       // ISO 4217, typically "DKK"
  totalGross: DKK;        // inkl. moms
  totalNet: DKK;          // ekskl. moms
  totalVat: DKK;
  lines: InvoiceLine[];
  createdAt?: DineroDate;
  updatedAt?: DineroDate;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: DKK;
  vatRate: number;        // e.g. 0.25 for 25% Danish VAT
  accountNumber?: string; // TODO: confirm — booking account reference
  unit?: string;          // e.g. "hours", "pieces"
  lineTotal?: DKK;        // computed: quantity * unitPrice * (1 + vatRate)
}

// ─── Voucher ──────────────────────────────────────────────────────────────────

export type VoucherType =
  | 'Purchase'
  | 'Sale'
  | 'Manual'
  | 'OpeningBalance'; // TODO: confirm all types

export interface Voucher {
  guid?: string;        // TODO: confirm field name
  type: VoucherType;
  number?: number;
  date: DineroDate;
  description?: string;
  lines: VoucherLine[];
  attachments?: Attachment[];
  createdAt?: DineroDate;
}

export interface VoucherLine {
  accountNumber: string;
  amount: DKK;
  vatCode?: string;     // TODO: confirm VAT code format (e.g. "M25", "NONE")
  description?: string;
}

export interface Attachment {
  guid: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  url?: string;         // TODO: confirm — may require signed URL request
}

// ─── Account (chart of accounts) ─────────────────────────────────────────────

export type AccountType =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Income'
  | 'Expense'; // TODO: confirm Dinero account type nomenclature

export interface Account {
  number: string;       // Danish standard account numbers, e.g. "1000"
  name: string;
  type: AccountType;
  isActive?: boolean;
  balance?: DKK;
  currency?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  collection: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}

// ─── API response envelopes ───────────────────────────────────────────────────

export interface DineroApiResponse<T> {
  data: T;
  // TODO: confirm — Dinero may wrap responses differently
}
