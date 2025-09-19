export function formatValue(value: number): string {    
    return Math.round(Number(value)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });    
}