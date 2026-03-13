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
