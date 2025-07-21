export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '--/--/----';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
} 