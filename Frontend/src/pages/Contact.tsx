import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
            <MessageSquare size={16} />
            Contact Us
          </div>

          <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            Let's Talk
          </h1>

          <p className="text-lg leading-relaxed text-gray-600">
            Have a question, feedback, or need help with the platform?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
                <Mail className="text-primary-600" size={22} />
              </div>

              <h3 className="mb-2 font-semibold text-gray-900">
                Email
              </h3>

              <p className="text-sm text-gray-600">
                support@aishortsgenerator.com
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
                <Clock className="text-primary-600" size={22} />
              </div>

              <h3 className="mb-2 font-semibold text-gray-900">
                Support Hours
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Monday - Friday
                <br />
                9:00 AM - 6:00 PM
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
                <MapPin className="text-primary-600" size={22} />
              </div>

              <h3 className="mb-2 font-semibold text-gray-900">
                Location
              </h3>

              <p className="text-sm text-gray-600">
                Online-first digital platform
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8 lg:col-span-2">
            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle
                    size={32}
                    className="text-green-600"
                  />
                </div>

                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                  Message Sent
                </h2>

                <p className="max-w-md leading-relaxed text-gray-600">
                  Thank you for contacting us. We've received your
                  message and will get back to you soon.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-primary-600">
                    <Sparkles size={18} />
                    <span className="text-sm font-semibold">
                      Get in touch
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Send us a message
                  </h2>

                  <p className="mt-2 text-gray-600">
                    Fill out the form below and we'll get back to you.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Your Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="How can we help?"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      placeholder="Write your message here..."
                      className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-primary-700"
                  >
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;