import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsAndConditionsProps {
  onClose: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Terms and Conditions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6 text-gray-700">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Last Updated:</strong> January 10, 2026
            </p>
          </div>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">1. Acceptance of Terms</h3>
            <p className="leading-relaxed">
              By accessing and using OrchardIntel ("the Service"), you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">2. Service Description</h3>
            <p className="leading-relaxed mb-3">
              OrchardIntel provides:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI-powered apple leaf disease detection for 6 disease classes (Healthy, Apple Scab, Apple Rust, Powdery Mildew, Fire Blight, Black Rot)</li>
              <li>Climate risk prediction and farm health scoring based on environmental data</li>
              <li>Dataset management and model training simulation tools</li>
              <li>Planet satellite imagery integration with WMTS layers</li>
              <li>AOI (Area of Interest) analysis with drawing tools</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">3. User Responsibilities</h3>
            <p className="leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate information when creating an account</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Not misuse the Service or attempt to gain unauthorized access</li>
              <li>Use the Service only for lawful agricultural and educational purposes</li>
              <li>Not upload malicious files or content that violates intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">4. Accuracy Disclaimer</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="leading-relaxed text-amber-900">
                <strong>⚠️ Important:</strong> Disease predictions and climate risk assessments are provided for informational purposes only. 
                Results should not be considered as professional agricultural advice. Always consult with qualified agronomists or plant 
                pathologists for critical decisions. OrchardIntel is not liable for crop losses or damages resulting from reliance on the Service.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">5. Data Usage and Storage</h3>
            <p className="leading-relaxed mb-3">
              When using OrchardIntel:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Uploaded images are stored in Supabase cloud storage</li>
              <li>Prediction results and metadata are saved to our database</li>
              <li>Climate data is fetched from Planet satellite services</li>
              <li>You retain ownership of your uploaded data</li>
              <li>We may use anonymized data to improve model accuracy</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">6. Intellectual Property</h3>
            <p className="leading-relaxed">
              All software, algorithms, models, and content provided by OrchardIntel are protected by intellectual property laws. 
              You may not copy, modify, distribute, or reverse-engineer any part of the Service without express written permission.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">7. Third-Party Services</h3>
            <p className="leading-relaxed">
              OrchardIntel integrates with third-party services including Supabase (authentication and storage) and Planet 
              (satellite imagery). Your use of these services is subject to their respective terms and privacy policies.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">8. Service Availability</h3>
            <p className="leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted service. OrchardIntel may be temporarily 
              unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any losses 
              resulting from service interruptions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">9. Limitation of Liability</h3>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, OrchardIntel and its developers shall not be liable for any indirect, 
              incidental, special, or consequential damages arising from your use of the Service, including but not limited to 
              crop damage, financial losses, or data loss.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">10. Model Training and Datasets</h3>
            <p className="leading-relaxed">
              When uploading datasets for model training, you confirm that you have the right to use the images and that they 
              do not violate any third-party rights. Training features are provided as simulation tools for educational purposes.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">11. Account Termination</h3>
            <p className="leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive behavior. 
              You may delete your account at any time through the user settings.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">12. Changes to Terms</h3>
            <p className="leading-relaxed">
              We may update these Terms and Conditions periodically. Continued use of the Service after changes constitutes 
              acceptance of the updated terms. We will notify users of significant changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">13. Governing Law</h3>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable local and international laws. 
              Any disputes shall be resolved through binding arbitration.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">14. Contact Information</h3>
            <p className="leading-relaxed">
              For questions or concerns about these Terms and Conditions, please contact us through the support channels 
              provided in the application.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
