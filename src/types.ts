// Las definiciones de CFDIData y Concepto se han movido a ./core/models.ts
// para separar la lógica de las interfaces puras.

export interface ValidationSat {
  status: string;
  is_valid: boolean;
  message?: string;
  details?: SATValidationResponse;
}

export interface SATValidationRequest {
  re: string;
  rr: string;
  tt: string;
  id: string;
}

export interface SATValidationResponse {
  CodigoEstatus: string;
  Estado: string;
  EsCancelable: string;
  EstatusCancelacion?: string;
  ValidacionSAT?: string;
}

export interface Info {
  Version: string
  Serie: string
  Folio: string
  Fecha: string
  Sello: string
  FormaPago: string
  NoCertificado: string
  SubTotal: string
  Moneda: string
  Total: string
  TipoDeComprobante: string
  MetodoPago: string
  LugarExpedicion: string
  Exportacion: string
}

export interface Emisor {
  rfc: string
  nombre: string
  RegimenFiscal: string
}

export interface Receptor {
  rfc: string
  nombre: string
  DomicilioFiscalReceptor: string
  RegimenFiscalReceptor: string
  UsoCFDI: string
}

export interface Timbre {
  UUID: string
  FechaTimbrado: string
  RfcProvCertif: string
  SelloCFD: string
  NoCertificadoSAT: string
  SelloSAT: string
}

