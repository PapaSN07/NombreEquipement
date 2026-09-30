/** Extrait un message lisible d'une erreur FastAPI (detail texte ou liste 422). */
export function messageErreur(err: any): string {
  const d = err?.error?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d) && d.length) return d.map((x) => String(x.msg).replace(/^Value error, /, '')).join(' ');
  if (err?.status === 0) return 'Serveur injoignable. Vérifiez que le backend est démarré.';
  return 'Une erreur est survenue.';
}
