import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/logo-horizontal.jpg" alt="ImplantCheck" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-body hover:text-navy transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-5 py-2.5 bg-navy text-white rounded font-semibold hover:bg-navy-light transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 50%, #A6893B 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-gold" />
              <span className="text-gold text-sm font-semibold uppercase tracking-widest">
                Treatment Plan Review
              </span>
              <span className="h-px w-8 bg-gold" />
            </div>

            <h1 className="font-[(family-name:var(--font-garamond))] text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-white font-bold">
              Expert Review of Your{" "}
              <span className="text-gold">Implant Plans</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-xl">
              Submit your STL files and CBCT scans. Get detailed feedback from
              Dr. Avik Dandapat — so you can place every implant with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/auth/signup"
                className="px-7 py-3.5 bg-gold text-navy rounded font-semibold text-base hover:bg-gold-light transition-colors text-center shadow-lg shadow-gold/20"
              >
                Submit Your First Case
              </Link>
              <Link
                href="#how-it-works"
                className="px-7 py-3.5 border border-white/20 text-white rounded font-medium text-base hover:bg-white/5 transition-colors text-center"
              >
                How it works
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
                Confidential &amp; secure
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                  />
                </svg>
                Reviewed by an expert implant dentist
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-warm-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              Simple process
            </p>
            <h2 className="font-[(family-name:var(--font-garamond))] text-3xl md:text-4xl text-navy font-bold mb-4">
              How ImplantCheck Works
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
              Three steps from your planning software to expert feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                ),
                title: "Upload Your Plan",
                desc: "Export your STL files and CBCT scans from Blue Sky Bio, coDiagnostiX, or any planning software. Upload them along with your treatment notes and planning screenshots.",
              },
              {
                step: "02",
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                ),
                title: "Expert Reviews",
                desc: "Dr. Avik Dandapat evaluates your implant positions, angulation, and overall treatment plan. Each case receives detailed, actionable feedback.",
              },
              {
                step: "03",
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                ),
                title: "Place with Confidence",
                desc: "Receive your review with clear recommendations. Revise if needed, or proceed to surgery knowing your plan has been verified by an expert.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white p-8 rounded-xl border border-gray-100 hover:border-gold/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-7xl font-bold text-navy/[0.03] leading-none pt-2 pr-4 font-[(family-name:var(--font-garamond))]">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="text-gold mb-5 group-hover:text-gold-light transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-[(family-name:var(--font-garamond))] text-lg text-navy font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-body text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY IMPLANTCHECK ──────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
                Why choose us
              </p>
              <h2 className="font-[(family-name:var(--font-garamond))] text-3xl md:text-4xl text-navy font-bold mb-6">
                Expert Oversight for Every Case
              </h2>
              <p className="text-body text-lg mb-8 leading-relaxed">
                Implant planning software is powerful — but it&apos;s only as good
                as the clinician using it. A second pair of expert eyes can
                catch positioning errors, anatomical risks, and prosthetic
                complications before they happen.
              </p>

              <div className="space-y-5">
                {[
                  {
                    title: "Reduce Surgical Complications",
                    desc: "Catch positioning errors and anatomical risks before surgery — not after.",
                  },
                  {
                    title: "Improve Treatment Outcomes",
                    desc: "Peer-reviewed plans lead to better implant placement and prosthetic results.",
                  },
                  {
                    title: "Build Your Confidence",
                    desc: "Knowing an expert has verified your plan lets you proceed with certainty.",
                  },
                  {
                    title: "Learn & Improve",
                    desc: "Each review is a learning opportunity. Understand the rationale behind every recommendation.",
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-gold"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-navy font-semibold text-sm mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-muted text-sm leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual element — abstract dental illustration */}
            <div className="flex-1 w-full max-w-md">
              <div className="bg-navy rounded-2xl p-8 aspect-[4/5] flex flex-col items-center justify-center relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 50% 50%, #A6893B 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                      />
                    </svg>
                  </div>
                  <p className="text-white/80 text-lg italic font-[(family-name:var(--font-garamond))] mb-2">
                    &ldquo;Plan better. Place better.&rdquo;
                  </p>
                  <p className="text-white/50 text-sm">
                    Every case reviewed with the same care as if it were our
                    own.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-warm-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              Simple pricing
            </p>
            <h2 className="font-[(family-name:var(--font-garamond))] text-3xl md:text-4xl text-navy font-bold mb-4">
              Pay Per Case. No Subscription.
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
              Only pay when you need a review. No monthly fees, no commitments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Basic Check */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-8 text-center">
              <p className="text-muted text-sm mb-2">Basic Check</p>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-4">Single implant</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-navy font-[(family-name:var(--font-garamond))]">
                  £95
                </span>
                <span className="text-muted text-lg"> /case</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[
                  "Full STL and CBCT review",
                  "Written feedback report",
                  "Implant position & angulation analysis",
                  "Revision review included",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-body">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full px-6 py-3 border-2 border-navy text-navy rounded font-semibold hover:bg-navy hover:text-white transition-colors text-center">Get Started</Link>
            </div>

            {/* Standard */}
            <div className="bg-white rounded-2xl border-2 border-gold shadow-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
              <p className="text-muted text-sm mb-2">Standard</p>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-4">2–4 implants with plan</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-navy font-[(family-name:var(--font-garamond))]">
                  £199
                </span>
                <span className="text-muted text-lg"> /case</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[
                  "Everything in Basic Check",
                  "Comprehensive treatment plan review",
                  "Prosthetic considerations analysis",
                  "Detailed plan feedback",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-body">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full px-6 py-3 bg-navy text-white rounded font-semibold hover:bg-navy-light transition-colors text-center">Get Started</Link>
            </div>

            {/* Complex */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-8 text-center">
              <p className="text-muted text-sm mb-2">Complex</p>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-4">4+ implants with Zoom call</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-navy font-[(family-name:var(--font-garamond))]">
                  £295
                </span>
                <span className="text-muted text-lg"> /case</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[
                  "Everything in Standard",
                  "High-complexity case analysis",
                  "Full treatment plan evaluation",
                  "1-on-1 Zoom consultation",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-body">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full px-6 py-3 border-2 border-navy text-navy rounded font-semibold hover:bg-navy hover:text-white transition-colors text-center">Get Started</Link>
            </div>

            {/* Pilot Guide */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-8 text-center">
              <p className="text-muted text-sm mb-2">Pilot Guide</p>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-4">Collaborative surgical guide</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-navy font-[(family-name:var(--font-garamond))]">
                  £399
                </span>
                <span className="text-muted text-lg"> /case</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[
                  "Everything in Complex",
                  "Co-designed surgical pilot guide",
                  "Collaborative planning session",
                  "Downloadable STL for guide ready to print",
                  "In-depth case discussion included",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-body">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full px-6 py-3 border-2 border-navy text-navy rounded font-semibold hover:bg-navy hover:text-white transition-colors text-center">Get Started</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT DR. AVIK ────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 order-2 lg:order-1">
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
                About the reviewer
              </p>
              <h2 className="font-[(family-name:var(--font-garamond))] text-3xl md:text-4xl text-navy font-bold mb-6">
                Dr. Avik Dandapat
              </h2>
              <p className="text-body text-lg mb-6 leading-relaxed">
                Experienced implant dentist and clinical educator. Dr. Dandapat has placed
                thousands of dental implants and trained clinicians across the UK
                through The Implant Diploma programme.
              </p>
              <p className="text-body leading-relaxed mb-8">
                Every treatment plan submitted to ImplantCheck is reviewed
                personally by Dr. Dandapat, applying the same rigorous standards
                he teaches to his diploma delegates. You&apos;re not getting an
                automated report — you&apos;re getting an experienced implant
                dentist&apos;s considered opinion.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="https://theimplantdiploma.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 border border-navy/20 text-navy rounded font-medium text-sm hover:bg-navy hover:text-white transition-colors"
                >
                  The Implant Diploma →
                </Link>
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2 w-full max-w-sm">
              <img src="/logo-square.jpg" alt="ImplantCheck — By BCDIS, British College of Dental Implant Surgery" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ── BLUE SKY BIO + EXAMPLE REPORT ────────────────────── */}
      <section className="py-24 bg-warm-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* BlueSky Bio */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <h3 className="font-[(family-name:var(--font-garamond))] text-xl text-navy font-bold">
                  Recommended: BlueSky Bio
                </h3>
              </div>
              <p className="text-body text-sm leading-relaxed mb-4">
                We recommend BlueSky Bio — free, professional implant planning software
                used in our training programme. Export your STL files and planning
                screenshots directly from BlueSky Bio for submission.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.blueskybio.digital/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
                >
                  Download BlueSky Bio
                </a>
                <a
                  href="https://www.blueskybio.university/surgicalguide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-navy/20 text-navy rounded-lg text-sm font-medium hover:bg-navy hover:text-white transition-colors"
                >
                  Training Videos →
                </a>
              </div>
            </div>

            {/* Example Report */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <h3 className="font-[(family-name:var(--font-garamond))] text-xl text-navy font-bold">
                  Example Report
                </h3>
              </div>
              <p className="text-body text-sm leading-relaxed mb-4">
                See what a completed ImplantCheck review looks like. Our reports
                follow a structured BCDIS format covering implant positioning,
                angulation, anatomical considerations, and treatment recommendations.
              </p>
              <a
                href="/sample-implantcheck-report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
              >
                View example report
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #A6893B 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[(family-name:var(--font-garamond))] text-3xl md:text-4xl text-white font-bold mb-4">
            Ready to Place with Confidence?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Submit your first treatment plan today and get expert feedback from
            Dr. Avik Dandapat.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-gold text-navy rounded font-semibold text-lg hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
          >
            Submit Your First Case
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-white text-muted py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <img src="/logo-horizontal.jpg" alt="ImplantCheck" className="h-10 w-auto" />
            </div>

            <div className="flex gap-8 text-sm">
              <Link
                href="/auth/login"
                className="hover:text-navy transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="mailto:hello@implantcheck.co.uk"
                className="hover:text-navy transition-colors"
              >
                Contact
              </Link>
              <a
                href="https://theimplantdiploma.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-navy transition-colors"
              >
                The Implant Diploma
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-xs text-muted/60">
            <p>
              &copy; {new Date().getFullYear()} ADIMPLANT.COM LTD. All rights
              reserved. Company No. 06431009.
            </p>
            <p className="mt-1">
              IMPLANTCHECK is a trademark (UK00004379448).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
