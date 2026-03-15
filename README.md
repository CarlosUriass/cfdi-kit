# CFDI Kit

Librería para el procesamiento de Comprobantes Fiscales Digitales por Internet (CFDI 4.0) en Node.js y navegadores.

[![npm version](https://img.shields.io/npm/v/cfdi-kit.svg?style=flat-square)](https://www.npmjs.com/package/cfdi-kit)
[![license](https://img.shields.io/github/license/CarlosUriass/cfdi-kit.svg?style=flat-square)](LICENSE)
[![typescript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**cfdi-kit** es una solución diseñada para simplificar la integración de facturación electrónica mexicana en aplicaciones modernas. Proporciona herramientas para el parseo, validación y extracción de datos fiscales de forma eficiente.

---

## Características

- **Procesamiento de CFDI 4.0**: Extracción completa de datos de comprobantes vigentes.
- **Validación SAT**: Consulta de vigencia mediante el servicio SOAP oficial en un solo flujo.
- **Cálculos Fiscales**: Métodos integrados para obtener totales de IVA, ISR y otras retenciones.
- **Compatibilidad**: Funciona en entornos Node.js y navegadores.
- **Persistencia**: Capacidad de exportar datos procesados a formato JSON.

---

## Instalación

```bash
npm install cfdi-kit
```

---

## Integración con NestJS

Ejemplo de implementación en un servicio de NestJS para el procesamiento de facturas:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { processCFDI, CFDIData } from 'cfdi-kit';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  async processInvoice(xmlString: string): Promise<any> {
    try {
      // Procesa y valida ante el SAT
      const cfdi: CFDIData = await processCFDI(xmlString);

      if (cfdi.isPPD()) {
        this.logger.log(`UUID: ${cfdi.timbre.UUID} comercializado como PPD`);
      }

      return {
        uuid: cfdi.timbre.UUID,
        emisor: cfdi.emisor.nombre,
        total: cfdi.info.Total,
        iva: cfdi.getIVA(),
        isr: cfdi.getRetenciones().ISR,
        fecha: cfdi.getFechaEmision(),
        valido: cfdi.validation_sat?.is_valid
      };
    } catch (error) {
      this.logger.error('Error al procesar el CFDI', error.stack);
      throw error;
    }
  }
}
```

---

## Métodos de la API

La clase `CFDIData` incluye métodos de utilidad para agilizar el desarrollo:

### Validación de Comprobante
- `isPUE()`: Indica si es Pago en una sola exhibición.
- `isPPD()`: Indica si es Pago en parcialidades o diferido.
- `isIngreso()`: Determina si el comprobante es de tipo Ingreso.
- `isEgreso()`: Determina si el comprobante es de tipo Egreso (Nota de crédito).

### Datos Fiscales
- `getIVA()`: Retorna el total de IVA trasladado.
- `getRetenciones()`: Retorna un desglose de retenciones (ISR, IVA, otros).
- `getFechaEmision()`: Retorna un objeto `Date` con la fecha del comprobante.

### Persistencia
- `toJSON(directorio, nombreArchivo)`: Guarda el contenido del CFDI en un archivo JSON (solo Node.js).

---

## Funciones Principales

| Función | Descripción |
| :--- | :--- |
| `processCFDI(xml)` | Realiza el parseo y la validación ante el SAT de forma asíncrona. |
| `parseXML(xml)` | Parsea el XML y retorna una instancia de `CFDIData`. |
| `validateSAT(datos)` | Realiza la consulta de vigencia sin parsear el archivo. |

---

## Licencia

MIT © [Carlos Urías](https://github.com/CarlosUriass)
