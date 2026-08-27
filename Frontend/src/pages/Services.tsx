
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Image,
  Zap,
  Video,
  ShoppingBag,
  Megaphone,
  Palette,
  ArrowRight,
  Cloud,
} from "lucide-react";

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Sparkles,
      title: "AI Image Generation",
      description:
        "Generate professional product visuals using AI from your uploaded images and creative prompts.",
    },
    {
      icon: Image,
      title: "Product Photography",
      description:
        "Transform ordinary product images into polished visuals suitable for e-commerce and marketing.",
    },
    {
      icon: Palette,
      title: "Creative Visuals",
      description:
        "Describe your desired scene and let AI create a visual that matches your creative direction.",
    },
    {
      icon: Video,
      title: "AI Video Generation",
      description:
        "Create engaging short-form video content from your generated visual assets.",
    },
    {
      icon: Cloud,
      title: "Cloud Asset Management",
      description:
        "Keep your generated projects and visual assets organized and accessible from anywhere.",
    },
    {
      icon: Zap,
      title: "Fast Generation",
      description:
        "Create professional visual content without the time and cost of traditional production.",
    },
  ];

  const useCases = [
    {
      icon: ShoppingBag,
      title: "E-Commerce",
      description: "Create professional product images for your online store.",
    },
    {
      icon: Image,
      title: "Social Media",
      description: "Generate engaging visual content for your social channels.",
    },
    {
      icon: Megaphone,
      title: "Digital Advertising",
      description: "Create campaign-ready visuals for your marketing efforts.",
    },
    {
      icon: Palette,
      title: "Brand Campaigns",
      description: "Produce consistent visuals that match your brand identity.",
    },
    {
      icon: Sparkles,
      title: "Marketing Visuals",
      description: "Turn ideas into polished marketing content with AI.",
    },
    {
      icon: Video,
      title: "Product Presentations",
      description: "Present your products with modern and engaging visuals.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
            <Sparkles size={16} />
            AI-Powered Services
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Everything You Need to Create
            <span className="text-primary-600"> Better Visuals</span>
          </h1>

          <p className="text-lg leading-relaxed text-gray-600">
            From AI-generated product photography to short-form video
            content, AI Shorts Generator gives you the tools to create
            modern visual content faster.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 transition group-hover:bg-primary-600">
                  <Icon
                    size={24}
                    className="text-primary-600 transition group-hover:text-white"
                  />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {service.title}
                </h3>

                <p className="leading-relaxed text-gray-600">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-600">
                Use Cases
              </p>

              <h2 className="mb-5 text-3xl font-bold text-gray-900">
                Built for modern content workflows
              </h2>

              <p className="mb-6 leading-relaxed text-gray-600">
                Whether you run an online store, manage social media, or
                build advertising campaigns, AI Shorts Generator helps you
                create professional visual content faster.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white transition hover:bg-primary-700"
              >
                Start Creating
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Right */}
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-gray-100 bg-gray-50 p-5 transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                      <Icon
                        size={20}
                        className="text-primary-600"
                      />
                    </div>

                    <h3 className="mb-1 font-semibold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Helps */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-600">
            Why AI Shorts Generator
          </p>

          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Create more. Spend less time.
          </h2>

          <p className="mx-auto max-w-2xl text-gray-600">
            Replace complicated production workflows with a simple
            AI-powered creative process.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Zap className="text-primary-600" size={24} />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Save Time
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              Generate professional visuals in moments instead of spending
              hours on traditional production.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Sparkles className="text-primary-600" size={24} />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              AI-Powered
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              Turn your ideas and uploaded assets into polished,
              professional-looking content.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Image className="text-primary-600" size={24} />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Brand Ready
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              Create visual assets suitable for e-commerce, social media,
              advertising, and digital campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary-600 px-6 py-12 text-center md:px-12">
          <Sparkles
            className="mx-auto mb-4 text-white"
            size={32}
          />

          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Create?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
            Start creating professional AI-powered visuals for your brand
            today.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 font-semibold text-primary-600 transition hover:bg-primary-50"
          >
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
