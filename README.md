# cfdi-kit

Libreria minimalista para el procesamiento de Comprobantes Fiscales Digitales por Internet (CFDI) en Node.js y navegadores, escrita íntegramente en TypeScript.

Permite parsear archivos XML de facturación mexicana (SAT) y validar su estado de vigencia a través del servicio SOAP oficial en un solo flujo de trabajo.

## Instalacion

```bash
npm install cfdi-kit
```

## Uso Principal

La forma mas sencilla de utilizar la libreria es a traves de la funcion `processCFDI`. Esta funcion acepta el contenido del XML como un string. Si tienes un archivo en disco, debes leerlo previamente.

```typescript
import { processCFDI } from 'cfdi-kit';
import { readFileSync } from 'fs';

// Lectura de un archivo XML local
const xmlContent = readFileSync('mi_factura.xml', 'utf-8');

async function main() {
  try {
    // Procesa y valida en un solo flujo
    const data = await processCFDI(xmlContent);

    console.log('UUID:', data.timbre.UUID);
    console.log('RFC Emisor:', data.emisor.rfc);
    console.log('RFC Receptor:', data.receptor.rfc);
    console.log('Total:', data.info.Total);

    if (data.validation_sat?.is_valid) {
      console.log('La factura es vigente ante el SAT');
    }
  } catch (error) {
    console.error('Error procesando el CFDI:', error);
  }
}

main();
```

## Uso Modular

Si prefieres realizar los pasos por separado, puedes utilizar las funciones individuales.

### Parsear XML

Convierte el string XML en un objeto estructurado y tipado.

```typescript
import { parseXML } from 'cfdi-kit';

const data = parseXML(xmlContent);
console.log(data.conceptos);
```

### Validar ante el SAT

Consulta el servicio SOAP del SAT para verificar si un comprobante es valido y vigente.

```typescript
import { validateSAT } from 'cfdi-kit';

const response = await validateSAT({
  re: 'RFC_EMISOR',
  rr: 'RFC_RECEPTOR',
  tt: '1234.56',
  id: 'UUID-DE-LA-FACTURA'
});

console.log('Estado:', response.Estado); // Vigente, Cancelado, No Encontrado
```

## Referencia de API

### CFDIData (Interfaz Principal)

Objeto resultante del parseo y procesamiento.

| Campo | Tipo | Descripcion |
| :--- | :--- | :--- |
| `info` | `Info` | Datos generales del comprobante (Version, Total, Moneda, Fecha, etc.) |
| `emisor` | `Emisor` | RFC, Nombre y Regimen Fiscal del emisor |
| `receptor` | `Receptor` | RFC, Nombre y Uso de CFDI del receptor |
| `timbre` | `Timbre` | Datos del Timbre Fiscal Digital (UUID, Fecha, Sellos) |
| `conceptos` | `Concepto[]` | Listado detallado de conceptos facturados |
| `validation_sat` | `ValidationSat` | (Opcional) Resultado de la validacion ante el SAT |

### Detalles de Tipos

#### Info
| Campo | Tipo |
| :--- | :--- |
| `Version` | `string` |
| `Serie` | `string` |
| `Folio` | `string` |
| `Fecha` | `string` |
| `SubTotal` | `string` |
| `Moneda` | `string` |
| `Total` | `string` |
| `TipoDeComprobante` | `string` |
| `MetodoPago` | `string` |
| `LugarExpedicion` | `string` |

#### Emisor
| Campo | Tipo |
| :--- | :--- |
| `rfc` | `string` |
| `nombre` | `string` |
| `RegimenFiscal` | `string` |

#### Receptor
| Campo | Tipo |
| :--- | :--- |
| `rfc` | `string` |
| `nombre` | `string` |
| `DomicilioFiscalReceptor` | `string` |
| `RegimenFiscalReceptor` | `string` |
| `UsoCFDI` | `string` |

#### Timbre
| Campo | Tipo |
| :--- | :--- |
| `UUID` | `string` |
| `FechaTimbrado` | `string` |
| `RfcProvCertif` | `string` |
| `SelloCFD` | `string` |
| `NoCertificadoSAT` | `string` |
| `SelloSAT` | `string` |

#### Concepto
| Campo | Tipo |
| :--- | :--- |
| `ClaveProdServ` | `string` |
| `NoIdentificacion` | `string` |
| `Cantidad` | `string` |
| `ClaveUnidad` | `string` |
| `Unidad` | `string` |
| `Descripcion` | `string` |
| `ValorUnitario` | `string` |
| `Importe` | `string` |
| `ObjetoImp` | `string` |

#### ValidationSat
| Campo | Tipo | Descripcion |
| :--- | :--- | :--- |
| `status` | `string` | Estado de la peticion ('success', 'error', 'pending') |
| `is_valid` | `boolean` | Indica si el comprobante es Vigente ante el SAT |
| `message` | `string` | Mensaje de error en caso de fallo |
| `details` | `SATValidationResponse` | Respuesta completa del servicio SOAP del SAT |

### Funciones

- `parseXML(xml: string): CFDIData`: Analiza el contenido XML y devuelve el objeto estructurado.
- `validateSAT(req: SATValidationRequest): Promise<SATValidationResponse>`: Consulta el estado del CFDI en los servidores del SAT.
- `processCFDI(xml: string): Promise<CFDIData>`: Ejecuta el flujo completo (parseo + validacion).

## Licencia

MIT
