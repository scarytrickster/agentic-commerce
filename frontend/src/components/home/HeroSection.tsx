import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14 lg:py-20">
      <div className="relative z-10">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9e0d4] bg-[#f1f4ed] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f624c]"><span className="h-1.5 w-1.5 rounded-full bg-[#88a274]" /> Thoughtful finds, made easy</p>
        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#20342b] sm:text-6xl lg:text-[4.5rem]">
          Better things for <span className="font-serif font-normal italic text-[#78916c]">every day.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
          Discover pieces you’ll love, with a little help finding exactly what you’re looking for.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="#shop" className="rounded-full bg-[#243d32] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#243d32]/10 transition hover:-translate-y-0.5 hover:bg-[#182d23]">Explore the collection <span aria-hidden="true" className="ml-2">↓</span></Link>
          <span className="text-sm text-stone-500">A more personal way to shop</span>
        </div>
      </div>

      <div className="relative mx-auto flex aspect-[1.2/1] w-full max-w-[570px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#e9eadf] sm:aspect-[1.35/1]">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#d2d9c4] sm:h-80 sm:w-80" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-[#d5b98f]/60 sm:h-96 sm:w-96" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_40%,rgba(255,255,255,0.72),transparent_48%)]" />
        <div className="relative flex h-[70%] w-[58%] rotate-[-5deg] flex-col items-center justify-center rounded-[42%_42%_28%_28%] border border-white/60 bg-gradient-to-br from-[#fbfaf4] via-[#d7d9c9] to-[#a8af99] shadow-[20px_30px_60px_rgba(49,59,42,0.2)]">
          <div className="absolute inset-x-[18%] top-[13%] h-[17%] rounded-full border border-white/60 bg-[#f6f3e9]/80 shadow-inner" />
          <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/50 bg-[#f8f5ec]/70 text-3xl text-[#56664d] shadow-sm sm:h-28 sm:w-28 sm:text-4xl">✳</div>
          <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#536049] sm:text-[11px]">Everyday edit</span>
        </div>
        <div className="absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-lg shadow-stone-900/5 backdrop-blur sm:bottom-7 sm:left-7 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Picked for you</p>
          <p className="mt-1 text-sm font-semibold text-[#20342b] sm:text-base">The little things, better.</p>
        </div>
        <span className="absolute right-5 top-5 flex h-14 w-14 rotate-12 items-center justify-center rounded-full bg-[#c36d4e] text-center text-[9px] font-bold uppercase leading-3 tracking-wider text-white sm:right-8 sm:top-8 sm:h-[4.5rem] sm:w-[4.5rem]">Find<br />your<br />favorite</span>
      </div>
    </div>
  );
}
