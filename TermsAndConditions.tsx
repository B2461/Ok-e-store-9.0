
import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';

const TermsAndConditions: React.FC = () => {
    const { t } = useAppContext();
    return (
        <Card className="animate-fade-in max-w-4xl mx-auto text-left">
            <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">नियम और शर्तें (Terms & Conditions)</h2>
            
            <div className="space-y-6 text-purple-200 prose prose-invert prose-p:text-purple-200 prose-h3:text-white prose-h3:font-hindi prose-ul:text-purple-200">
                <p><strong>अंतिम अपडेट:</strong> {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <h3>1. परिचय</h3>
                <p>"Ok-E-store" में आपका स्वागत है। हमारे ऐप से खरीदारी करके, आप नीचे दी गई शर्तों से पूरी तरह सहमत होते हैं।</p>

                <h3>2. उत्पाद और सेवाएं</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>भौतिक उत्पाद (Physical Products):</strong> जैसे पूजा सामग्री, जूते, मोबाइल एक्सेसरीज आदि।</li>
                    <li><strong>डिजिटल उत्पाद (Digital Products):</strong> जैसे ई-बुक्स (PDF) और सॉफ़्टवेयर।</li>
                </ul>

                <h3>3. भुगतान नीति (Payment Policy)</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>सभी भुगतान अग्रिम (Prepaid) स्वीकार किए जाते हैं (UPI/QR कोड)।</li>
                    <li>भुगतान सत्यापन के लिए सही स्क्रीनशॉट और ट्रांजेक्शन आईडी अपलोड करना अनिवार्य है।</li>
                </ul>

                <h3>4. सख्त 'नो रिफंड' नीति (Strict No Refund Policy)</h3>
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                    <p className="font-bold text-red-200 mb-2">महत्वपूर्ण सूचना:</p>
                    <p>कृपया ध्यान दें कि हम <strong>'नो रिफंड' (No Refund)</strong> नीति का कड़ाई से पालन करते हैं।</p>
                </div>
                <ul className="list-disc list-inside space-y-2 mt-4">
                    <li><strong>सभी बिक्री अंतिम हैं (All Sales Are Final):</strong> एक बार भुगतान सफलतापूर्वक हो जाने के बाद, चाहे वह डिजिटल उत्पाद हो या भौतिक उत्पाद, <strong>किसी भी परिस्थिति में पैसे वापस नहीं किए जाएंगे (No Refunds Will Be Issued)।</strong></li>
                    <li><strong>डिजिटल उत्पाद:</strong> ई-बुक्स या डिजिटल फाइलों के लिंक/एक्सेस भेजे जाने के बाद उन्हें वापस, एक्सचेंज या रिफंड नहीं किया जा सकता।</li>
                    <li><strong>भौतिक उत्पाद:</strong> यदि आपको कोई क्षतिग्रस्त (Damaged) या गलत उत्पाद मिलता है, तो हम केवल उसे <strong>बदल देंगे (Replacement Only)</strong>। इसके लिए आपको डिलीवरी के 24 घंटे के भीतर अनबॉक्सिंग वीडियो के साथ सबूत देना होगा। टूटे हुए सामान के बदले पैसे वापस नहीं मिलेंगे, केवल दूसरा सही सामान मिलेगा।</li>
                    <li>ऑर्डर डिस्पैच होने के बाद उसे रद्द नहीं किया जा सकता है।</li>
                </ul>

                <h3>5. डिलीवरी (Shipping)</h3>
                <p>हम भारत भर में डिलीवरी करते हैं। स्थान के आधार पर डिलीवरी में 3 से 7 कार्य दिवस लग सकते हैं। हम डिलीवरी में देरी के लिए जिम्मेदार नहीं हैं जो कूरियर कंपनी या प्राकृतिक कारणों से हो सकती है।</p>

                <h3>6. उपयोगकर्ता की जिम्मेदारी</h3>
                <p>आप सहमत हैं कि आप अपना सही पता और फोन नंबर प्रदान करेंगे। गलत पते के कारण डिलीवरी न होने पर हम जिम्मेदार नहीं होंगे और कोई रिफंड नहीं दिया जाएगा। नकली भुगतान स्क्रीनशॉट अपलोड करने पर आपका खाता ब्लॉक कर दिया जाएगा।</p>

                <h3>7. संपर्क</h3>
                <p>किसी भी प्रश्न के लिए, कृपया ऐप के 'सहायता' (Support) अनुभाग का उपयोग करें।</p>
            </div>
        </Card>
    );
};

export default TermsAndConditions;
