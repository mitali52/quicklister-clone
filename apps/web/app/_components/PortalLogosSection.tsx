const portals = [
  { name: 'Zoopla', color: 'text-blue-600', weight: 'font-extrabold' },
  { name: 'rightmove', color: 'text-red-600', weight: 'font-bold' },
  { name: 'OnTheMarket', color: 'text-emerald-700', weight: 'font-bold' },
  { name: 'PrimeLocation', color: 'text-purple-700', weight: 'font-bold' },
  { name: 'Property Redress', color: 'text-slate-700', weight: 'font-semibold' },
];

export function PortalLogosSection() {
  return (
    <section className="bg-white py-10" aria-label="Property portal partners">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500">View our listings on</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {portals.map((portal) => (
            <span
              key={portal.name}
              className={`text-lg ${portal.weight} ${portal.color} tracking-tight`}
            >
              {portal.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
