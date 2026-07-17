import { ItemModeracion, Reporte } from "./types";


export class PriorityQueueReportes {
  private heap: ItemModeracion[] = [];

  /*
   - Calcula el nivel de prioridad de un contenido reportado en base a tres factores:
   - 1. Cantidad de reportes acumulados.
   - 2. Rango de los usuarios reportantes (reportes de moderadores pesan más).
   - 3. Gravedad del tipo de motivo de los reportes 
   - "item" representa el grupo de reportes de un contenido específico.
   */
  private calcularPrioridad(item: ItemModeracion): number {
    let puntuacion = 0;

    // Cantidad de reportes 
    puntuacion += item.reportes.length * 5;

    item.reportes.forEach((rep) => {
      // Rango del reportante
      if (rep.reportante.rango === "moderador") {
        puntuacion += 15; 
      } else if (rep.reportante.rango === "alta-reputacion") {
        puntuacion += 5;
      }

      //  Gravedad del tipo de contenido
      if (rep.motivo === "terrorismo" || rep.motivo === "suicidio" || rep.motivo === "sexual") {
        puntuacion += 25; // Gravedad máxima
      } else if (rep.motivo === "odio" || rep.motivo === "acoso" || rep.motivo === "violencia") {
        puntuacion += 15; // Gravedad media-alta
      } else {
        puntuacion += 5;  // Spam, información falsa, discriminación, etc.
      }
    });

    return puntuacion;
  }

  /*
   - Inserta un nuevo reporte en la cola. Si el contenido ya había sido reportado,
   - se agrupa bajo el mismo elemento y se recalcula su prioridad reestructurando el heap.
   - 
   - "nuevoReporte" El reporte individual capturado en la interfaz.
   */
  public insertarReporte(nuevoReporte: Reporte): void {
    const indiceExistente = this.heap.findIndex(item => item.contenidoId === nuevoReporte.contenidoId);

    if (indiceExistente !== -1) {
      // Si el contenido ya existía en la cola de moderación, añadimos el reporte al grupo
      this.heap[indiceExistente].reportes.push(nuevoReporte);
      this.heap[indiceExistente].prioridadAcumulada = this.calcularPrioridad(this.heap[indiceExistente]);
      
      // Dado que la prioridad aumentó, lo empujamos hacia arriba en el árbol
      this.bubbleUp(indiceExistente);
    } else {
      // Si es un contenido reportado por primera vez
      const nuevoItem: ItemModeracion = {
        contenidoId: nuevoReporte.contenidoId,
        tipoContenido: nuevoReporte.tipoContenido,
        reportes: [nuevoReporte],
        prioridadAcumulada: 0
      };
      nuevoItem.prioridadAcumulada = this.calcularPrioridad(nuevoItem);
      
      this.heap.push(nuevoItem);
      this.bubbleUp(this.heap.length - 1);
    }
  }

  /*
   - Extrae y devuelve el elemento con mayor prioridad acumulada (la raíz del heap).
   - Este es el contenido que el moderador verá primero en su panel de administración. 
   - Retorna el ItemModeracion más urgente, o null si la cola está vacía.
   */
  public extraerMaximo(): ItemModeracion | null {
    if (this.heap.length === 0) return null;
    
    const maximo = this.heap[0];
    const ultimo = this.heap.pop();

    if (this.heap.length > 0 && ultimo) {
      // Colocamos el último elemento en la raíz y lo hundimos para mantener la propiedad del heap
      this.heap[0] = ultimo;
      this.bubbleDown(0);
    }

    return maximo;
  }

  // Devuelve el elemento con mayor prioridad sin extraerlo del heap.
  public obtenerMaximo(): ItemModeracion | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  //Realiza la operación de subida para reubicar un nodo tras su inserción o actualización.
   
  private bubbleUp(indice: number): void {
    let actual = indice;
    while (actual > 0) {
      const padre = Math.floor((actual - 1) / 2);
      if (this.heap[actual].prioridadAcumulada <= this.heap[padre].prioridadAcumulada) {
        break;
      }
      this.intercambiar(actual, padre);
      actual = padre;
    }
  }

  // Realiza la operación de bajada (bubble down) para mantener el orden del heap tras una extracción.

  private bubbleDown(indice: number): void {
    let actual = indice;
    const longitud = this.heap.length;

    while (true) {
      let hijoIzquierdo = 2 * actual + 1;
      let hijoDerecho = 2 * actual + 2;
      let mayor = actual;

      if (hijoIzquierdo < longitud && this.heap[hijoIzquierdo].prioridadAcumulada > this.heap[mayor].prioridadAcumulada) {
        mayor = hijoIzquierdo;
      }

      if (hijoDerecho < longitud && this.heap[hijoDerecho].prioridadAcumulada > this.heap[mayor].prioridadAcumulada) {
        mayor = hijoDerecho;
      }

      if (mayor === actual) {
        break;
      }

      this.intercambiar(actual, mayor);
      actual = mayor;
    }
  }

  // Utilidad para intercambiar dos posiciones en el arreglo interno del heap.
   
  private intercambiar(i: number, j: number): void {
    const temporal = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temporal;
  }
}