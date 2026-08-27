import { Seo } from '../../components/seo/Seo.js';

export function TermsOfUse() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Seo
        title="Terms of Use"
        description="Terms and conditions governing use of the Atlas South Technical Services website, including IP rights, liability limits, and quote/pricing terms."
        path="/legal/terms"
      />
      <h1 className="mb-2 text-4xl font-black text-navy">Terms of Use</h1>
      <p className="mb-8 text-slate-600">Last updated: August 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-navy">1. Agreement to Terms</h2>
          <p>
            By accessing and using this website (the "Service"), you agree to be bound by these Terms of Use. If you do not agree to abide
            by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) from Atlas South Technical
            Services' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
            title, and under this license you may not:
          </p>
          <ul className="ml-6 space-y-2">
            <li>• Modifying or copying the materials</li>
            <li>• Using the materials for any commercial purpose or for any public display</li>
            <li>• Attempting to decompile or reverse engineer any software contained on the website</li>
            <li>• Removing any copyright or other proprietary notations from the materials</li>
            <li>• Transferring the materials to another person or "mirroring" the materials on any other server</li>
            <li>• Scraping or automated downloading of website content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">3. Disclaimer</h2>
          <p>
            The materials on Atlas South Technical Services' website are provided for informational purposes only. We make no warranties,
            expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or
            conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other
            violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">4. Limitations</h2>
          <p>
            In no event shall Atlas South Technical Services or its suppliers be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials
            on the website, even if we or one of our authorized representatives have been notified orally or in writing of the possibility
            of such damage.
          </p>
          <p>
            Our liability is limited to the maximum extent permitted by law. We carry £5 million in Public Liability Insurance covering
            professional services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">5. Accuracy of Materials</h2>
          <p>
            The materials appearing on Atlas South Technical Services' website could include technical, typographical, or photographic
            errors. We do not warrant that any of the materials on the website are accurate, complete, or current. We may make changes to
            the materials contained on the website at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">6. Intellectual Property Rights</h2>
          <p>
            All content on this website, including but not limited to text, graphics, logos, images, audio clips, and software, is the
            property of Atlas South Technical Services or its content suppliers and is protected by United Kingdom and international
            copyright laws.
          </p>
          <p>
            Unless otherwise stated, Atlas South Technical Services grants you a limited license to reproduce materials (content) from
            the website for personal, non-commercial use only. You may not republish, sell, rent, or rent out the content, or host
            content on any other website or networked computer, or broadcast the content, unless otherwise agreed in writing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">7. Quotes</h2>
          <p>
            All quotes provided by Atlas South Technical Services are indicative only and do not constitute a binding contract. Costs are
            subject to change based on specific project requirements, site conditions, and market factors, and are confirmed in writing
            before any work commences.
          </p>
          <p>
            A formal written quote and confirmation is required before any work commences. All quotes are valid for 30 days from issue
            unless otherwise stated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, in no circumstance shall Atlas South Technical Services be liable to you in relation
            to the contents of, or use of, or otherwise in connection with, this website for any indirect, special, or consequential loss,
            or for any business losses, loss of revenue, income, profits, or anticipated savings that is incurred by you or any third
            party, whether arising from breach of contract, tort (including negligence), breach of statutory duty, or otherwise, even if
            we have been advised of the possibility of such loss or damage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">9. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Atlas South Technical Services and its officers, directors, employees,
            agents, and suppliers from any claim, demand, loss, liability, or expense (including reasonable attorneys' fees) arising from
            or related to your use of the website or violation of these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">10. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of England and Wales, and you
            irrevocably submit to the exclusive jurisdiction of the courts located in London.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">11. Severability</h2>
          <p>
            If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force
            and effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">12. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Use, please contact us at:
          </p>
          <div className="mt-4 rounded bg-slate-50 p-4">
            <p className="font-semibold text-navy">Atlas South Technical Services</p>
            <p>Email: start@atlassouthes.com</p>
            <p>Phone: 07778 858278</p>
          </div>
        </section>
      </div>
    </div>
  );
}
