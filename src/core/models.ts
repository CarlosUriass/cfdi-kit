import { Info, Emisor, Receptor, Timbre, ValidationSat, Impuestos, Traslado, Retencion } from "../types.js";

export interface Concepto {
  ClaveProdServ: string
  NoIdentificacion: string
  Cantidad: string
  ClaveUnidad: string
  Unidad: string
  Descripcion: string
  ValorUnitario: string
  Importe: string
  ObjetoImp: string
}

export class CFDIData {
  info: Info
  emisor: Emisor
  receptor: Receptor
  timbre: Timbre
  conceptos: Concepto[]
  impuestos?: Impuestos
  validation_sat?: ValidationSat

  constructor(data: {
    info: Info;
    emisor: Emisor;
    receptor: Receptor;
    timbre: Timbre;
    conceptos: Concepto[];
    impuestos?: Impuestos;
    validation_sat?: ValidationSat;
  }) {
    this.info = data.info;
    this.emisor = data.emisor;
    this.receptor = data.receptor;
    this.timbre = data.timbre;
    this.conceptos = data.conceptos;
    this.impuestos = data.impuestos;
    this.validation_sat = data.validation_sat;
  }

  /**
   * Guarda los datos del CFDI como un archivo JSON en el directorio especificado.
   * 
   * @param directory Directorio donde se guardará el archivo.
   * @param filename Nombre del archivo (opcional, por defecto usa el UUID o 'cfdi-data.json').
   * @returns La ruta absoluta del archivo guardado.
   * @throws Error si ocurre un problema al guardar o si se ejecuta en un entorno sin sistema de archivos.
   */
  async toJSON(directory?: string, filename?: string): Promise<any> {
    const plainObject = {
      info: this.info,
      emisor: this.emisor,
      receptor: this.receptor,
      timbre: this.timbre,
      conceptos: this.conceptos,
      validation_sat: this.validation_sat
    };

    // Si se llama sin argumentos (como lo haría JSON.stringify), retornar el objeto plano
    if (!directory) {
      return plainObject;
    }

    // Detectar entorno (solo funciona en Node.js para persistencia)
    if (typeof window !== 'undefined' || typeof process === 'undefined') {
      throw new Error('La persistencia en archivo solo está disponible en entornos Node.js');
    }

    const _fs = await import('fs/promises');
    const fs = (_fs as any).mkdir ? _fs : (_fs as any).default;
    const _path = await import('path');
    const path = (_path as any).join ? _path : (_path as any).default;

    const fileName = filename || (this.timbre?.UUID ? `${this.timbre.UUID}.json` : 'cfdi-data.json');
    const targetPath = (path as any).join(directory, fileName);

    // Asegurar que el directorio existe
    await (fs as any).mkdir(directory, { recursive: true });

    // Serializar a JSON
    const data = JSON.stringify(plainObject, null, 2);
    
    await (fs as any).writeFile(targetPath, data, 'utf-8');

    return (path as any).resolve(targetPath);
  }

  /**
   * Devuelve el total de IVA trasladado.
   * Busca en los impuestos globales el impuesto 002 (IVA).
   */
  getIVA(): number {
    if (!this.impuestos?.Traslados) return 0;
    
    return this.impuestos.Traslados
      .filter(t => ['002', '2', 'IVA'].includes(t.Impuesto))
      .reduce((acc, t) => acc + parseFloat(t.Importe || '0'), 0);
  }

  /**
   * Devuelve un desglose de retenciones por tipo (ISR, IVA).
   */
  getRetenciones(): { ISR: number; IVA: number; otros: number } {
    const res = { ISR: 0, IVA: 0, otros: 0 };
    if (!this.impuestos?.Retenciones) return res;

    this.impuestos.Retenciones.forEach(r => {
      const importe = parseFloat(r.Importe || '0');
      if (['001', '1', 'ISR'].includes(r.Impuesto)) {
        res.ISR += importe;
      } else if (['002', '2', 'IVA'].includes(r.Impuesto)) {
        res.IVA += importe;
      } else {
        res.otros += importe;
      }
    });

    return res;
  }
}
