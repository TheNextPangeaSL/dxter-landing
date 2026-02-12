import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "How do I create an account in DxTER?",
    answer:
      "DxTER uses an organizational access model to ensure security and traceability. To register: complete the Contact Us form on our website, our team will validate your request and schedule a technical consultation to understand your needs, a parent organization will be created by our onboarding team, and the administrator designated by your organization will be able to directly create and manage users in DxTER.",
  },
  {
    question: "Is there a free trial or demo available?",
    answer:
      "To experience DxTER, please contact us through the Contact Us form on our website. We'll arrange a personalized demo tailored to your organization's needs.",
  },
  {
    question: "Is my organization data independently secure?",
    answer:
      "Yes, DxTER operates in a multi-tenant environment. Each customer's data is securely stored in a separate database, ensuring complete privacy and security for your organization. Additionally, we understand the strategic importance of your data and intellectual property (IP). Our robust security measures are designed to protect these valuable assets at all times.",
  },
  {
    question: "How is my data protected?",
    answer:
      "We implement industry-leading security practices: data encryption in transit, regular security audits and penetration testing, strict access controls and authentication mechanisms, and continuous monitoring for potential threats. We are currently in the process of obtaining ISO 27001 certification, further demonstrating our commitment to information security management.",
  },
  {
    question: "Do you comply with GDPR policies?",
    answer:
      "Yes, DxTER is 100% compliant with the General Data Protection Regulation (GDPR: regulation (EU) 2016/679). We have implemented comprehensive data protection measures to ensure your data is handled in accordance with EU privacy laws.",
  },
  {
    question: "Where are servers located?",
    answer:
      "All DxTER servers are located in Europe. At this moment, we exclusively use AWS European data centers to ensure data residency compliance and optimal performance for our clients.",
  },
  {
    question: "What are the system/browser requirements?",
    answer:
      "DxTER is a web-based application, with all computations performed in the cloud, meaning there are no specific hardware requirements for your device or laptop. For the best experience, we recommend keeping your browser up to date. DxTER is optimized for modern browsers, including the latest versions of Chrome, Firefox, Safari, and Edge.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item, index) => (
        <div
          key={index}
          className={`faq-item ${openIndex === index ? "!border-[#aeeae7] shadow-[0_4px_16px_rgba(23,123,125,0.06)]" : ""}`}
        >
          <button
            onClick={() => toggle(index)}
            className="flex items-center justify-between w-full px-6 py-5 text-left cursor-pointer"
          >
            <span
              className={`font-semibold text-base pr-4 transition-colors duration-200 ${
                openIndex === index ? "text-[#177b7d]" : "text-slate-800"
              }`}
            >
              {item.question}
            </span>
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                openIndex === index
                  ? "rotate-180 text-[#177b7d]"
                  : "rotate-0 text-slate-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: openIndex === index ? "500px" : "0px",
              opacity: openIndex === index ? 1 : 0,
            }}
          >
            <div className="px-6 pb-5 text-slate-500 leading-relaxed text-[0.95rem]">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
