import { XMLParser, XMLValidator } from "fast-xml-parser";
import { CFDIData } from "./models.js";
import { mapCFDI } from "./mapper.js";

/**
 * Parsea un string XML de un CFDI y devuelve un objeto estructurado.
 * 
 * @param xmlContent El contenido del XML a parsear.
 * @returns Un objeto que cumple con la interfaz CFDIData.
 * @throws Error si el XML no es válido o está mal formado.
 */
export function parseXML(xmlContent: string): CFDIData {
  const validation = XMLValidator.validate(xmlContent);
  if (validation !== true) {
    throw new Error(`Invalid XML: ${validation.err.msg} at line ${validation.err.line}`);
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
  });

  const jsonObj = parser.parse(xmlContent);

  return mapCFDI(jsonObj);
}
