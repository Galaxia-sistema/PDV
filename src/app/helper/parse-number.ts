export function parseNumber(cell: any): number {
  if (cell === null || cell === undefined) return NaN;
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return NaN;

  // Limpieza básica: quitar espacios y símbolos comunes (puedes ajustar según tu Excel)
  const s = cell.trim();

  // Si contiene tanto '.' como ',' asumimos que '.' es separador de miles y ',' decimal (ej: "1.234,56")
  if (s.indexOf('.') >= 0 && s.indexOf(',') >= 0) {
    const cleaned = s.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d\.-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
  }

  // Si solo tiene ',' lo convertimos a punto decimal
  if (s.indexOf(',') >= 0 && s.indexOf('.') === -1) {
    const cleaned = s.replace(/,/g, '.').replace(/[^\d\.-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
  }

  // Caso general: quitar símbolos no numéricos
  const cleaned = s.replace(/[^\d\.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? NaN : n;
}

export function parseExcelDate(cell: any): Date | null {
  if (cell === null || cell === undefined || cell === '') return null;
  if (cell instanceof Date) return cell;
  if (typeof cell === 'number') {
    // Excel serial date -> JS Date
    // Nota: la conversión más común usa 25569 como offset (diferencia entre epoch Excel y JS)
    // Puede variar según tu archivo (si hay errores de día de base 1900/1904). Ajusta si es necesario.
    const jsDate = new Date(Math.round((cell - 25569) * 86400 * 1000));
    return isNaN(jsDate.getTime()) ? null : jsDate;
  }
  if (typeof cell === 'string') {
    const s = cell.trim();
    // Intento parse estándar
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;

    // Intento dd/mm/yyyy o dd-mm-yyyy
    const parts = s.split(/[\/\-.]/).map(p => p.trim());
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);

      // si el primer grupo tiene 4 dígitos, asumimos yyyy-mm-dd
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }

      const alt = new Date(year, month, day);
      if (!isNaN(alt.getTime())) return alt;
    }
  }
  return null;
}