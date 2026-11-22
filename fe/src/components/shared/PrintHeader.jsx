/* Kop institusi — hanya tampil saat dicetak */
export default function PrintHeader({ subtitle }) {
  return (
    <div className="print-only mb-4 border-b-2 border-navy-800 pb-3 text-center">
      <p className="text-sm font-bold tracking-wide text-navy-800">KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
      <p className="text-sm font-semibold text-navy-800">DAERAH SULAWESI UTARA</p>
      <p className="text-xs text-navy-800">DIREKTORAT RESERSE KRIMINAL KHUSUS — SUBBID SIBER</p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">{subtitle}</p>
    </div>
  );
}
