import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Privacy Policy</h2>
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
            <h3 className="text-xl font-bold text-gray-800 mb-3">1. Introduction</h3>
            <p className="leading-relaxed">
              OrchardIntel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our apple disease detection and climate risk 
              prediction service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">2. Information We Collect</h3>
            
            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Account Information</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email address (used for authentication)</li>
              <li>Password (encrypted and securely stored via Supabase)</li>
              <li>Account creation date and last login timestamp</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Uploaded Content</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Apple leaf images uploaded for disease detection</li>
              <li>Dataset images for model training (train/test/validation sets)</li>
              <li>Image metadata (filename, upload date, file size)</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Prediction and Analysis Data</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Disease prediction results and confidence scores</li>
              <li>Climate data (temperature, humidity, rainfall, wind speed)</li>
              <li>Farm health scores and risk assessments</li>
              <li>AOI (Area of Interest) coordinates and boundaries</li>
              <li>Processing times and model performance metrics</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.4 Technical Information</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Device information and screen resolution</li>
              <li>IP address and general location (country/region)</li>
              <li>Usage patterns and feature interaction logs</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">3. How We Use Your Information</h3>
            <p className="leading-relaxed mb-3">We use collected information for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Delivery:</strong> Processing disease predictions and climate risk analysis</li>
              <li><strong>Model Improvement:</strong> Training and refining AI models using anonymized datasets</li>
              <li><strong>Account Management:</strong> Authentication, password resets, and account security</li>
              <li><strong>Performance Optimization:</strong> Analyzing usage patterns to improve user experience</li>
              <li><strong>Communication:</strong> Sending service updates and important notifications</li>
              <li><strong>Research:</strong> Aggregated, anonymized data for agricultural research purposes</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">4. Data Storage and Security</h3>
            
            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Storage Infrastructure</h4>
            <p className="leading-relaxed mb-3">
              Your data is stored using Supabase cloud infrastructure:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Images stored in secure Supabase Storage buckets</li>
              <li>Structured data stored in PostgreSQL database</li>
              <li>Encrypted connections (HTTPS/TLS) for all data transmission</li>
              <li>Regular automated backups</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Security Measures</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Password hashing using industry-standard algorithms</li>
              <li>Row-level security policies on database tables</li>
              <li>JWT-based authentication tokens</li>
              <li>Regular security audits and vulnerability assessments</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> While we implement robust security measures, no method of electronic storage is 100% secure. 
                We cannot guarantee absolute security of your data.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">5. Data Sharing and Disclosure</h3>
            
            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Third-Party Services</h4>
            <p className="leading-relaxed mb-3">We share data with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Supabase:</strong> Authentication, database, and storage services</li>
              <li><strong>Planet:</strong> Satellite imagery and climate data retrieval</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.2 We Do NOT:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sell your personal data to third parties</li>
              <li>Share your images with marketing companies</li>
              <li>Use your data for targeted advertising</li>
              <li>Disclose your farm location without consent</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.3 Legal Requirements</h4>
            <p className="leading-relaxed">
              We may disclose information if required by law, court order, or governmental regulation, or to protect the 
              rights and safety of OrchardIntel, our users, or the public.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">6. Anonymization and Research</h3>
            <p className="leading-relaxed">
              We may use anonymized and aggregated data (with all personally identifiable information removed) for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Improving disease detection algorithms</li>
              <li>Publishing agricultural research findings</li>
              <li>Training machine learning models</li>
              <li>Statistical analysis of disease prevalence</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Anonymized data cannot be traced back to individual users or specific farms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">7. Your Rights and Choices</h3>
            
            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">You have the right to:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your uploaded images and prediction history</li>
              <li><strong>Opt-Out:</strong> Decline participation in research data collection</li>
              <li><strong>Withdraw Consent:</strong> Revoke permissions for data processing</li>
            </ul>

            <p className="leading-relaxed mt-3">
              To exercise these rights, contact us through the application or email support.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">8. Data Retention</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Active Accounts:</strong> Data retained as long as your account is active</li>
              <li><strong>Deleted Accounts:</strong> Data removed within 30 days of account deletion request</li>
              <li><strong>Prediction History:</strong> Stored for up to 2 years for model improvement</li>
              <li><strong>Anonymized Data:</strong> Retained indefinitely for research purposes</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">9. Children's Privacy</h3>
            <p className="leading-relaxed">
              OrchardIntel is not intended for users under 13 years of age. We do not knowingly collect personal information 
              from children. If we discover that a child's data has been collected, we will delete it promptly.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">10. International Data Transfers</h3>
            <p className="leading-relaxed">
              Your data may be processed and stored in servers located in different countries. By using OrchardIntel, you 
              consent to the transfer of your information to countries that may have different data protection laws than 
              your jurisdiction.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">11. Cookies and Tracking</h3>
            <p className="leading-relaxed mb-3">
              OrchardIntel uses minimal cookies and local storage for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Session management and authentication tokens</li>
              <li>User preferences (theme, language settings)</li>
              <li>Analytics to understand feature usage</li>
            </ul>
            <p className="leading-relaxed mt-3">
              You can disable cookies in your browser settings, but this may affect service functionality.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">12. Changes to This Privacy Policy</h3>
            <p className="leading-relaxed">
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify 
              you of significant changes via email or in-app notification. Continued use after updates constitutes acceptance 
              of the revised policy.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">13. Contact Us</h3>
            <p className="leading-relaxed">
              For privacy-related questions, data access requests, or concerns, please contact us through the support 
              channels provided in the application or reach out to our data protection team.
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
