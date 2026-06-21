import { Navbar } from "../components/cinematic-hero/Navbar";

export function NotFoundPage() {
  return (
    <main
      className="site-page site-page--not-found relative min-h-screen overflow-x-clip overflow-y-visible"
      id="top"
    >
      <div className="relative z-[1]">
        <Navbar />
        <section className="content-section grid min-h-[70vh] place-items-center pt-[9rem] text-center">
          <div className="max-w-[36rem]">
            <p className="eyebrow">Error / 404</p>
            <h1 className="type-display mt-5">
              This frame <span className="text-accent-red">doesn't exist.</span>
            </h1>
            <p className="type-body mt-5">
              The page you're looking for has drifted out of range. Head
              back to base or pick a new heading below.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a className="primary-link !mt-0" href="/">
                Return home
              </a>
              <a className="primary-link !mt-0" href="/community">
                Explore community
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
