import { LoginForm } from '@/app/(auth)/login/_components/LoginForm';
import { LoginAuthFooter } from './AuthFooter';

export function LoginScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute left-0 top-0 h-[78vh] w-full bg-gradient-to-r from-fuchsia-600 via-indigo-500 to-sky-400 [clip-path:polygon(0_0,100%_0,100%_68%,0_92%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-6 pt-10 sm:px-8 lg:px-10">
        <div className="relative z-10 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(520px,560px)] lg:items-start lg:gap-12">
          <div className="flex flex-col justify-center pt-10 lg:pt-20">
            <div className="max-w-[540px]">
              <p className="mb-5 text-3xl font-black italic tracking-tight text-white drop-shadow-sm lg:text-[3.75rem]">
                QuicklisterPro
              </p>
              <h1 className="max-w-[430px] text-5xl font-extrabold leading-[0.95] tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-[4.25rem]">
                Take control
                <br />
                of your
                <br />
                property
                <br />
                marketing
              </h1>
            </div>
          </div>

          <div className="mt-10 flex justify-center lg:mt-24 lg:justify-end">
            <section className="z-10 w-full max-w-[560px] rounded-xl bg-white p-10 shadow-[0_18px_70px_rgba(15,23,42,0.16)] ring-1 ring-slate-100 sm:p-12 lg:mr-8 lg:mt-0">
              <LoginForm />
            </section>
          </div>
        </div>

        <LoginAuthFooter />
      </div>
    </div>
  );
}
