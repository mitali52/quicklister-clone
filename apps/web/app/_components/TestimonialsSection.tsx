const quotes = [
  '"A quick and easy solution to market your property."',
  '"Fees very reasonable, marketing excellent, and house was sold within days of being on the market. Highly recommended."',
  '"A refreshing change in the lettings market."',
];

function StarRating({ count }: Readonly<{ count: number }>) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {['s1', 's2', 's3', 's4', 's5'].map((key) => (
        <svg
          key={key}
          className="h-4 w-4 text-amber-400"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" />
        </svg>
      ))}
      <span className="ml-1.5 text-sm text-slate-500">{count} reviews</span>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="satisfaction-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left — stat block */}
          <div>
            <span
              id="satisfaction-heading"
              className="text-xs font-semibold uppercase tracking-widest text-slate-400"
            >
              Client Satisfaction
            </span>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">Google</span>
              <StarRating count={66} />
            </div>

            <p className="mt-6 text-7xl font-extrabold tracking-tight text-cyan-500">24hrs</p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Average time our customers have their listing live on Rightmove and Zoopla after
              submission.
            </p>
          </div>

          {/* Right — quotes */}
          <div className="flex flex-col justify-center gap-8">
            {quotes.map((quote) => (
              <blockquote key={quote}>
                <p className="text-lg leading-8 text-slate-700">{quote}</p>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
