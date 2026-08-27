import React from "react";
import { Sparkles, Target, Shield, Zap, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
            <Sparkles size={16} />
            About AI Shorts Generator
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Powerful AI Tools for
            <span className="text-primary-600"> Modern Brands</span>
          </h1>

          <p className="text-lg leading-relaxed text-gray-600">
            AI Shorts Generator helps businesses and creators transform
            ordinary product and model images into professional,
            brand-ready visuals using artificial intelligence.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-600">
              Our Mission
            </p>

            <h2 className="mb-5 text-3xl font-bold text-gray-900">
              Making professional content creation simpler
            </h2>

            <p className="mb-5 leading-relaxed text-gray-600">
              Professional product photography can be expensive, time
              consuming, and difficult to scale. Our platform uses modern AI
              technology to make high-quality visual content accessible to
              businesses of all sizes.
            </p>

            <p className="leading-relaxed text-gray-600">
              Instead of spending hours arranging photoshoots, users can
              upload their assets, describe what they want, and let AI
              generate the visual content.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-primary-50 p-6">
                <Target className="mb-4 text-primary-600" size={28} />
                <h3 className="mb-2 font-semibold text-gray-900">
                  Our Goal
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Make professional visual creation fast and accessible.
                </p>
              </div>

              <div className="rounded-xl bg-primary-50 p-6">
                <Zap className="mb-4 text-primary-600" size={28} />
                <h3 className="mb-2 font-semibold text-gray-900">
                  Innovation
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Use modern AI technology to simplify creative workflows.
                </p>
              </div>

              <div className="rounded-xl bg-primary-50 p-6">
                <Shield className="mb-4 text-primary-600" size={28} />
                <h3 className="mb-2 font-semibold text-gray-900">
                  Reliability
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Build a secure and dependable platform for users.
                </p>
              </div>

              <div className="rounded-xl bg-primary-50 p-6">
                <Users className="mb-4 text-primary-600" size={28} />
                <h3 className="mb-2 font-semibold text-gray-900">
                  For Everyone
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Designed for creators, businesses, and modern brands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Sparkles className="mx-auto mb-4 text-primary-600" size={32} />

            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Built With Modern Technology
            </h2>

            <p className="leading-relaxed text-gray-600">
              AI Shorts Generator combines modern web technologies,
              cloud infrastructure, secure authentication, and AI-powered
              generation into one platform.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["AI Generation", "Create visuals using advanced generative AI."],
              ["Cloud Storage", "Securely store and manage generated assets."],
              ["Secure Platform", "Authentication and protected user data."],
              ["Scalable Architecture", "Designed to support growing workloads."],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="mb-2 font-semibold text-gray-900">
                  {title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-primary-700"
            >
              Start Creating
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;