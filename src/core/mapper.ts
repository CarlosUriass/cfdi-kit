import { CFDIData, Info, Emisor, Receptor, Timbre, Concepto } from "../types.js";

/**
 * Mapea el objeto JSON bruto del parser a la estructura CFDIData limpia.
 */
export function mapCFDI(raw: any): CFDIData {
  const comprobante = raw["cfdi:Comprobante"] || raw["Comprobante"];

  if (!comprobante) {
    throw new Error("No se encontró el nodo principal cfdi:Comprobante");
  }

  const emisorRaw = comprobante["cfdi:Emisor"] || comprobante["Emisor"];
  const receptorRaw = comprobante["cfdi:Receptor"] || comprobante["Receptor"];
  const conceptosRaw = comprobante["cfdi:Conceptos"] || comprobante["Conceptos"];
  const complementoRaw = comprobante["cfdi:Complemento"] || comprobante["Complemento"];

  // Extraer Timbre Fiscal Digital
  let timbreRaw: any = {};
  if (complementoRaw) {
    timbreRaw = complementoRaw["tfd:TimbreFiscalDigital"] || complementoRaw["TimbreFiscalDigital"] || {};
  }

  // Normalizar Conceptos (pueden ser uno o varios)
  let conceptosList: any[] = [];
  if (conceptosRaw) {
    const items = conceptosRaw["cfdi:Concepto"] || conceptosRaw["Concepto"];
    conceptosList = Array.isArray(items) ? items : [items];
  }

  const info: Info = {
    Version: comprobante.Version,
    Serie: comprobante.Serie,
    Folio: comprobante.Folio,
    Fecha: comprobante.Fecha,
    Sello: comprobante.Sello,
    FormaPago: comprobante.FormaPago,
    NoCertificado: comprobante.NoCertificado,
    SubTotal: String(comprobante.SubTotal),
    Moneda: comprobante.Moneda,
    Total: String(comprobante.Total),
    TipoDeComprobante: comprobante.TipoDeComprobante,
    MetodoPago: comprobante.MetodoPago,
    LugarExpedicion: comprobante.LugarExpedicion,
    Exportacion: comprobante.Exportacion,
  };

  const emisor: Emisor = {
    rfc: emisorRaw?.Rfc || emisorRaw?.rfc,
    nombre: emisorRaw?.Nombre || emisorRaw?.nombre,
    RegimenFiscal: emisorRaw?.RegimenFiscal,
  };

  const receptor: Receptor = {
    rfc: receptorRaw?.Rfc || receptorRaw?.rfc,
    nombre: receptorRaw?.Nombre || receptorRaw?.nombre,
    DomicilioFiscalReceptor: receptorRaw?.DomicilioFiscalReceptor,
    RegimenFiscalReceptor: receptorRaw?.RegimenFiscalReceptor,
    UsoCFDI: receptorRaw?.UsoCFDI,
  };

  const timbre: Timbre = {
    UUID: timbreRaw.UUID,
    FechaTimbrado: timbreRaw.FechaTimbrado,
    RfcProvCertif: timbreRaw.RfcProvCertif,
    SelloCFD: timbreRaw.SelloCFD,
    NoCertificadoSAT: timbreRaw.NoCertificadoSAT,
    SelloSAT: timbreRaw.SelloSAT,
  };

  const conceptos: Concepto[] = conceptosList.map((item: any) => ({
    ClaveProdServ: item.ClaveProdServ,
    NoIdentificacion: item.NoIdentificacion,
    Cantidad: String(item.Cantidad),
    ClaveUnidad: item.ClaveUnidad,
    Unidad: item.Unidad,
    Descripcion: item.Descripcion,
    ValorUnitario: String(item.ValorUnitario),
    Importe: String(item.Importe),
    ObjetoImp: item.ObjetoImp,
  }));

  return new CFDIData({
    info,
    emisor,
    receptor,
    timbre,
    conceptos,
  });
}
