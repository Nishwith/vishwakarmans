import React, { useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  User,
  CreditCard,
  Ban,
  ShieldAlert,
} from "lucide-react";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600 pt-4 pb-20 px-4">
      <div className="max-w-4xl mx-auto bg-white/50 border border-gray-100 rounded-2xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-8">Last Updated: December 29, 2025</p>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="text-brand-accent" size={20} /> 1. Acceptance
            </h2>
            <p>
              By accessing Vishwakarmans, you agree to these Terms. If you
              disagree, you may not use the Service.
            </p>
          </section>

          {/* LIABILITY SECTION - Normal Styling */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-brand-accent" size={20} /> 2.
              Platform Role (Aggregator)
            </h2>
            <p>
              <strong>
                Vishwakarmans is strictly an intermediary platform.
              </strong>
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm md:text-base">
              <li>
                We connect Homeowners with Designers. We do not perform design
                or construction work.
              </li>
              <li>
                We are <strong>not responsible</strong> for the quality, safety,
                or legality of services provided by Designers.
              </li>
              <li>
                Any contract for design services is strictly between the Client
                and the Designer. Vishwakarmans is not a party to that contract.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="text-brand-accent" size={20} /> 3. User Accounts
            </h2>
            <p>
              You agree to provide accurate information (Name, Phone, City).
              Using fake details allows us to terminate your account
              immediately.
            </p>
          </section>

          {/* PAYMENTS & NO GUARANTEE SECTION - Normal Styling */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="text-brand-accent" size={20} /> 4.
              Membership & Payments
            </h2>
            <p className="mb-2">
              To list your services on Vishwakarmans, you agree to our
              subscription model:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>
                <strong>Subscription Fees:</strong> Designers pay a monthly or
                yearly fee to be listed and featured.
              </li>
              <li>
                <strong>Refunds:</strong> Subscription fees are generally
                non-refundable once the service period has commenced.
              </li>
              <li>
                <strong>No Guarantee of Results:</strong> Payment for "Featured"
                status or Membership guarantees visibility on our platform. It
                does NOT guarantee a specific number of leads, inquiries,
                clients, or signed contracts. Vishwakarmans is a marketing
                platform, not a lead generation agency.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Ban className="text-brand-accent" size={20} /> 5. Termination
            </h2>
            <p>
              We may terminate access immediately if you breach these Terms,
              including failure to pay subscription fees or engaging in
              fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="text-brand-accent" size={20} /> 6.
              Limitation of Liability
            </h2>
            <p>
              In no event shall Vishwakarmans be liable for any indirect,
              incidental, or consequential damages arising from your use of the
              service, including loss of profits or revenue.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Contact:{" "}
              <span className="text-gray-900 font-bold">
                vishwakarmans55@gmail.com
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
