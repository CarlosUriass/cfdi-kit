import { parseXML } from "./parser.js";
import { validateSAT } from "./sat-validator.js";
import { CFDIData } from "./models.js";

/**
 * Procesa un XML de CFDI de principio a fin: lo parsea y valida su estado ante el SAT.
 * 
 * @param xmlContent El contenido del XML a procesar.
 * @returns Una promesa con los datos del CFDI y el resultado de la validación SAT incluido.
 */
export async function processCFDI(xmlContent: string): Promise<CFDIData> {
  const cfdi = parseXML(xmlContent);

  try {
    const satResponse = await validateSAT({
      re: cfdi.emisor.rfc,
      rr: cfdi.receptor.rfc,
      tt: cfdi.info.Total,
      id: cfdi.timbre.UUID
    });

    cfdi.validation_sat = {
      status: "success",
      is_valid: satResponse.Estado === "Vigente",
      details: satResponse
    };
  } catch (error) {
    cfdi.validation_sat = {
      status: "error",
      is_valid: false,
      message: error instanceof Error ? error.message : "Error desconocido en validación SAT"
    };
  }

  return cfdi;
}
