import { Info, Emisor, Receptor, Timbre, Impuestos, Traslado, Retencion } from "../types.js";
import { CFDIData, Concepto } from "./models.js";

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
  const impuestosRaw = comprobante["cfdi:Impuestos"] || comprobante["Impuestos"];

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

  // Normalizar Impuestos Globales
  let impuestos: Impuestos | undefined = undefined;
  if (impuestosRaw) {
    const trasladosRaw = impuestosRaw["cfdi:Traslados"] || impuestosRaw["Traslados"];
    const retencionesRaw = impuestosRaw["cfdi:Retenciones"] || impuestosRaw["Retenciones"];

    let traslados: Traslado[] = [];
    if (trasladosRaw) {
      const items = trasladosRaw["cfdi:Traslado"] || trasladosRaw["Traslado"];
      const itemsList = Array.isArray(items) ? items : [items];
      traslados = itemsList.map((t: any) => ({
        Base: String(t.Base || ""),
        Impuesto: String(t.Impuesto || ""),
        TipoFactor: String(t.TipoFactor || ""),
        TasaOCuota: String(t.TasaOCuota || ""),
        Importe: String(t.Importe || "")
      }));
    }

    let retenciones: Retencion[] = [];
    if (retencionesRaw) {
      const items = retencionesRaw["cfdi:Retencion"] || retencionesRaw["Retencion"];
      const itemsList = Array.isArray(items) ? items : [items];
      retenciones = itemsList.map((r: any) => ({
        Impuesto: String(r.Impuesto || ""),
        Importe: String(r.Importe || "")
      }));
    }

    impuestos = {
      TotalImpuestosTrasladados: impuestosRaw.TotalImpuestosTrasladados,
      TotalImpuestosRetenidos: impuestosRaw.TotalImpuestosRetenidos,
      Traslados: traslados,
      Retenciones: retenciones
    };
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
    impuestos,
  });
}
