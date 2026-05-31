import Link from 'next/link';

interface Category {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function HomeIcon() {
  return (
    <svg
      className="h-8 w-8 text-blue-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      className="h-8 w-8 text-blue-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}

function BuildingOfficeIcon() {
  return (
    <svg
      className="h-8 w-8 text-blue-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      className="h-8 w-8 text-blue-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
      />
    </svg>
  );
}

const categories: Category[] = [
  {
    label: 'Residential Sale',
    description:
      'Sell your home on Rightmove, Zoopla and more — without paying an estate agent commission.',
    href: '/sales',
    icon: <HomeIcon />,
  },
  {
    label: 'Residential Let',
    description:
      'List your rental property on the UK\'s biggest portals. Packages from as little as £39.',
    href: '/lettings',
    icon: <KeyIcon />,
  },
  {
    label: 'Commercial Sale',
    description:
      'Sell offices, retail units, and industrial premises without a commercial agent.',
    href: '/commercial',
    icon: <BuildingOfficeIcon />,
  },
  {
    label: 'Commercial Let',
    description:
      'Advertise your commercial space to thousands of business tenants across all major portals.',
    href: '/commercial',
    icon: <ClipboardIcon />,
  },
];

export function ListingCategoriesSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="categories-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            What are you listing?
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Choose your listing type and get started in minutes.
          </p>
        </div>

        <ul
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
        >
          {categories.map((cat) => (
            <li key={cat.label}>
              <Link
                href={cat.href}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                {cat.icon}
                <h3 className="mt-4 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                  {cat.label}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{cat.description}</p>
                <span
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700"
                  aria-hidden="true"
                >
                  Learn more
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
