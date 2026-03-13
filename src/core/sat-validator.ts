import { XMLParser, XMLValidator } from "fast-xml-parser";
import { SATValidationRequest, SATValidationResponse } from "../types.js";

const SAT_URL = "https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc";
const SOAP_ACTION = "http://tempuri.org/IConsultaCFDIService/Consulta";

/**
 * Valida un CFDI ante los servidores del SAT usando el servicio SOAP.
 * 
 * @param request Datos de validación (re, rr, tt, id)
 * @returns Promesa con la respuesta detallada del SAT
 */
export async function validateSAT(request: SATValidationRequest): Promise<SATValidationResponse> {
  // Generar la expresión impresa: ?re=Emisor&rr=Receptor&tt=Total&id=UUID
  const expression = `?re=${request.re}&rr=${request.rr}&tt=${request.tt}&id=${request.id}`;

  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:Consulta>
         <tem:expresionImpresa><![CDATA[${expression}]]></tem:expresionImpresa>
      </tem:Consulta>
   </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await fetch(SAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": SOAP_ACTION,
      },
      body: soapEnvelope,
    });

    if (!response.ok) {
      throw new Error(`SAT Service Error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    return parseSOAPResponse(xmlText);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error de conexión con el SAT: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parsea la respuesta XML del SOAP del SAT.
 */
function parseSOAPResponse(xmlContent: string): SATValidationResponse {
  // Validar XML
  if (XMLValidator.validate(xmlContent) !== true) {
    throw new Error("Respuesta del SAT mal formada (Invalid XML)");
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true, // Simplifica el acceso eliminando los 's:', 'a:', etc.
  });

  const jsonObj = parser.parse(xmlContent);
  
  // Navegar hasta el resultado: Envelope -> Body -> ConsultaResponse -> ConsultaResult
  const result = jsonObj?.Envelope?.Body?.ConsultaResponse?.ConsultaResult;

  if (!result) {
    throw new Error("No se encontró el nodo ConsultaResult en la respuesta del SAT");
  }

  return {
    CodigoEstatus: result.CodigoEstatus,
    Estado: result.Estado,
    EsCancelable: result.EsCancelable,
    EstatusCancelacion: result.EstatusCancelacion || null,
    ValidacionSAT: result.ValidacionSAT || null,
  };
}
