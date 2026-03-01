import { useState, useMemo } from "react";

const QUESTIONS = [
  // Governance and Organizational Management
  { id: "GOVORG-01", domain: "Governance & Org Management", title: "AI Risk Classification", content: "Does your organization classify AI systems based on their risk level to guide appropriate controls?", types: [1,2,3], frameworks: "EU AI Act Art. 6-8, NIST RMF Map 1.3, ISO 42001 C.6.1.4" },
  { id: "GOVORG-02", domain: "Governance & Org Management", title: "AI Procurement Policy", content: "Does your organization have specific procurement policy elements for AI-enabled systems that addresses security and ethical considerations?", types: [1,2,3], frameworks: "ISO 42001 C.8.4, NIST RMF Govern 2.2" },
  { id: "GOVORG-03", domain: "Governance & Org Management", title: "AI Inventory Management", content: "Does your organization maintain an inventory of AI-enabled tools and systems?", types: [1,2,3], frameworks: "ISO 42001 C.8.1, NIST RMF Govern 1.2" },
  { id: "GOVORG-04", domain: "Governance & Org Management", title: "AI Development Lifecycle", content: "Is there a documented development lifecycle that incorporates AI-specific security practices?", types: [2,3], frameworks: "ISO 42001 C.8.3, NIST RMF Govern 1.4" },
  { id: "GOVORG-05", domain: "Governance & Org Management", title: "Cross-Functional AI Review", content: "Is there a cross-functional review process (including legal, privacy, and ethics) for new AI implementations?", types: [2,3], frameworks: "ISO 42001 C.7.4, NIST RMF Govern 3.2" },
  { id: "GOVORG-06", domain: "Governance & Org Management", title: "AI Risk Assessment Process", content: "Is there a formalized risk assessment process specific to AI applications?", types: [2,3], frameworks: "ISO 42001 C.6.1, NIST RMF Map 1.1" },
  { id: "GOVORG-07", domain: "Governance & Org Management", title: "AI Governance Committee", content: "Is there a dedicated governance committee overseeing AI development and deployment including accountability for AI outputs and decisions?", types: [3], frameworks: "ISO 42001 C.5.3, NIST RMF Govern 1.1, EU AI Act Art. 16-29" },
  { id: "GOVORG-08", domain: "Governance & Org Management", title: "AI Ethics Board", content: "Is there an AI ethics board that reviews high-risk or potentially controversial AI applications?", types: [3], frameworks: "ISO 42001 C.5.2, NIST RMF Govern 5.1" },
  { id: "GOVORG-09", domain: "Governance & Org Management", title: "Advanced Model Risk Scoring", content: "Does your organization implement risk scoring for models based on use case sensitivity, data types, and potential impact?", types: [3], frameworks: "NIST RMF Map 1.4, ISO 42001 C.6.1" },

  // Risk Management and Compliance
  { id: "RMC-10", domain: "Risk Management & Compliance", title: "Prohibited AI Use Cases", content: "Has your organization identified and prohibited unacceptable AI use cases in accordance with legal requirements and internal policies?", types: [1,2,3], frameworks: "EU AI Act Art. 5, NIST RMF Govern 1.2" },
  { id: "RMC-11", domain: "Risk Management & Compliance", title: "Vendor AI Risk Assessment", content: "Does your organization evaluate AI vendors for security, privacy, and ethical risks before procurement?", types: [1,2,3], frameworks: "ISO 42001 C.8.4, NIST RMF Map 1.5" },
  { id: "RMC-12", domain: "Risk Management & Compliance", title: "AI Contract Requirements", content: "Do vendor contracts include specific terms regarding AI security, privacy, and compliance?", types: [1,2,3], frameworks: "ISO 42001 C.8.4, EU AI Act Art. 16" },
  { id: "RMC-13", domain: "Risk Management & Compliance", title: "AI Supply Chain Security", content: "Does your organization assess security practices throughout the AI supply chain, including model providers?", types: [2,3], frameworks: "ISO 42001 C.8.4, NIST RMF Govern 2.3" },
  { id: "RMC-14", domain: "Risk Management & Compliance", title: "Post-Implementation Review", content: "Does your organization conduct formal reviews after implementing AI systems to assess effectiveness and compliance?", types: [2,3], frameworks: "ISO 42001 C.9.3, NIST RMF Manage 1.3" },
  { id: "RMC-15", domain: "Risk Management & Compliance", title: "Pre-Trained Model Due Diligence", content: "Does your organization perform security and bias assessments on third-party models before integration?", types: [2,3], frameworks: "NIST RMF Govern 6.1, ISO 42001 C.8.3" },
  { id: "RMC-16", domain: "Risk Management & Compliance", title: "Human Rights Impact Assessment", content: "Are human rights impact assessments conducted for high-risk AI applications?", types: [3], frameworks: "EU AI Act Art. 6, ISO 42001 C.6.1" },
  { id: "RMC-17", domain: "Risk Management & Compliance", title: "Algorithmic Impact Assessment", content: "Does your organization conduct algorithmic impact assessments for high-impact AI systems?", types: [3], frameworks: "NIST RMF Map 1.6, ISO 42001 C.6.1" },
  { id: "RMC-18", domain: "Risk Management & Compliance", title: "AI Research Ethics", content: "Does your organization have an ethics review process for AI research and development activities?", types: [3], frameworks: "ISO 42001 C.5.2, NIST RMF Govern 4.1" },
  { id: "RMC-19", domain: "Risk Management & Compliance", title: "AI Research Ethics Governance", content: "Is there a governance process for the use of open-source models in your development?", types: [3], frameworks: "ISO 42001 C.8.4, NIST RMF Govern 1.4" },

  // Data Management and Privacy
  { id: "DMP-20", domain: "Data Management & Privacy", title: "AI Data Protection Impact Assessment", content: "Are data protection impact assessments (or similar) conducted for AI systems that process personal data as appropriate?", types: [1,2,3], frameworks: "EU AI Act Art. 29, ISO 42001 C.8.2" },
  { id: "DMP-21", domain: "Data Management & Privacy", title: "AI Data Quality Framework", content: "Does your organization have a framework to ensure the quality and appropriateness of data used by AI systems?", types: [2,3], frameworks: "EU AI Act Art. 10, NIST RMF Map 2.2" },
  { id: "DMP-22", domain: "Data Management & Privacy", title: "Input Data Validation", content: "Are controls in place to validate inputs to AI systems to prevent adversarial attacks?", types: [2,3], frameworks: "NIST RMF Measure 2.1, ISO 42001 C.8.3" },
  { id: "DMP-23", domain: "Data Management & Privacy", title: "Training and Fine Tuning", content: "Do you or your AI Model or System vendors train on customer data provided to them?", types: [2,3], frameworks: "" },
  { id: "DMP-24", domain: "Data Management & Privacy", title: "Training and Fine Tuning opt-out", content: "Can a customer opt out of having data they share with you trained on or used for fine tuning?", types: [2,3], frameworks: "" },
  { id: "DMP-25", domain: "Data Management & Privacy", title: "Training Data Governance", content: "Does your organization have a governance framework for managing training data, including data quality and representativeness?", types: [3], frameworks: "NIST RMF Map 2.3, EU AI Act Art. 10" },
  { id: "DMP-26", domain: "Data Management & Privacy", title: "Data Lineage Management", content: "Does your organization maintain detailed records of data provenance for all data used in model training?", types: [3], frameworks: "EU AI Act Art. 10, ISO 42001 C.8.2" },
  { id: "DMP-27", domain: "Data Management & Privacy", title: "Dataset Bias Detection Tools", content: "Does your organization employ specialized tools for detecting and mitigating bias in datasets or systems?", types: [3], frameworks: "NIST RMF Manage 2.3, EU AI Act Art. 10" },
  { id: "DMP-28", domain: "Data Management & Privacy", title: "Model Privacy by Design", content: "Are privacy-enhancing technologies (e.g., differential privacy, federated learning) incorporated into model design?", types: [3], frameworks: "ISO 42001 C.8.2, EU AI Act Art. 10" },

  // Security Controls and Operations
  { id: "SEC-29", domain: "Security Controls & Operations", title: "AI System Access Control", content: "Are role-based access controls implemented for AI systems and sensitive training data?", types: [1,2,3], frameworks: "ISO 42001 C.8.2, NIST RMF Govern 4.1" },
  { id: "SEC-30", domain: "Security Controls & Operations", title: "AI Cybersecurity Integration", content: "Are cybersecurity practices integrated into your AI development and deployment processes?", types: [1,2,3], frameworks: "NIST RMF Manage 1.1, ISO 42001 C.8.3" },
  { id: "SEC-31", domain: "Security Controls & Operations", title: "Model Integration Security", content: "Are security assessments conducted when integrating third-party AI models or APIs into your systems?", types: [2,3], frameworks: "ISO 42001 C.8.4, NIST RMF Govern 2.3" },
  { id: "SEC-32", domain: "Security Controls & Operations", title: "AI Behavior Boundaries", content: "Are mechanisms in place to constrain AI system behavior within defined operational boundaries?", types: [2,3], frameworks: "NIST RMF Manage 2.2, ISO 42001 C.8.3" },
  { id: "SEC-33", domain: "Security Controls & Operations", title: "AI Logging and Auditability", content: "Are comprehensive logging and audit trails maintained for AI system operations and decisions?", types: [2,3], frameworks: "EU AI Act Art. 12, ISO 42001 C.9.1" },
  { id: "SEC-34", domain: "Security Controls & Operations", title: "Advanced Adversarial Testing", content: "Does your organization conduct adversarial testing (e.g., red teaming) specifically for AI systems?", types: [3], frameworks: "NIST RMF Measure 2.6, ISO 42001 C.8.3" },
  { id: "SEC-35", domain: "Security Controls & Operations", title: "Continuous Security Testing", content: "Is continuous security testing integrated into the AI development pipeline?", types: [3], frameworks: "NIST RMF Manage 1.2, ISO 42001 C.8.3" },

  // Testing, Monitoring, and Performance Management
  { id: "TMPM-36", domain: "Testing, Monitoring & Performance", title: "AI Tool Performance Monitoring", content: "Is there ongoing monitoring for performance and accuracy of AI tools used in your organization?", types: [1,2,3], frameworks: "ISO 42001 C.9.1, NIST RMF Measure 2.5" },
  { id: "TMPM-37", domain: "Testing, Monitoring & Performance", title: "Third-Party AI Auditing", content: "Does your organization engage third-party auditors to review AI systems for security and compliance?", types: [1,2,3], frameworks: "ISO 42001 C.9.2, EU AI Act Art. 43" },
  { id: "TMPM-38", domain: "Testing, Monitoring & Performance", title: "AI Testing Framework", content: "Is there a formal testing framework specifically for AI models and applications?", types: [2,3], frameworks: "NIST RMF Measure 1.1, ISO 42001 C.8.3" },
  { id: "TMPM-39", domain: "Testing, Monitoring & Performance", title: "Continuous Monitoring for Drift", content: "Are systems in place to continuously monitor AI models for performance degradation and concept drift?", types: [2,3], frameworks: "NIST RMF Measure 2.5, ISO 42001 C.9.1" },
  { id: "TMPM-40", domain: "Testing, Monitoring & Performance", title: "Robustness Testing", content: "Is robustness testing performed to evaluate AI system behavior under edge cases and distribution shifts?", types: [2,3], frameworks: "NIST RMF Measure 2.2, ISO 42001 C.8.3" },
  { id: "TMPM-41", domain: "Testing, Monitoring & Performance", title: "AI Output Verification", content: "Are mechanisms in place to verify AI outputs before they are used in high-stakes decisions?", types: [2,3], frameworks: "EU AI Act Art. 14, NIST RMF Manage 2.4" },
  { id: "TMPM-42", domain: "Testing, Monitoring & Performance", title: "Hallucination Identification", content: "Are there processes to detect and mitigate hallucinations or factual inaccuracies in generative AI outputs?", types: [2,3], frameworks: "NIST RMF Measure 2.1, ISO 42001 C.8.3" },
  { id: "TMPM-43", domain: "Testing, Monitoring & Performance", title: "External Model Validation", content: "Are AI models independently validated by external parties before deployment in critical applications?", types: [3], frameworks: "EU AI Act Art. 40-43, ISO 42001 C.8.3" },
  { id: "TMPM-44", domain: "Testing, Monitoring & Performance", title: "Technical Robustness Certification", content: "Does your organization pursue certifications related to AI technical robustness and reliability?", types: [3], frameworks: "EU AI Act Art. 40, ISO 42001 C.8.3" },
  { id: "TMPM-45", domain: "Testing, Monitoring & Performance", title: "Automated Monitoring Systems", content: "Are automated systems in place for real-time monitoring of AI model performance and anomaly detection?", types: [3], frameworks: "NIST RMF Measure 2.5, ISO 42001 C.9.1" },

  // Transparency, Explainability, Bias, and Fairness
  { id: "TEBF-46", domain: "Transparency, Explainability, Bias & Fairness", title: "AI Transparency Requirements", content: "Does your organization have transparency requirements for AI systems used in customer-facing or high-impact decisions?", types: [1,2,3], frameworks: "EU AI Act Art. 13, NIST RMF Govern 1.5" },
  { id: "TEBF-47", domain: "Transparency, Explainability, Bias & Fairness", title: "Bias and Fairness Assessment", content: "Does your organization conduct bias assessments for AI systems before deployment?", types: [1,2,3], frameworks: "NIST RMF Measure 2.3, ISO 42001 C.8.2" },
  { id: "TEBF-48", domain: "Transparency, Explainability, Bias & Fairness", title: "AI Compute Supply Chain", content: "Does your organization track and assess the environmental and ethical implications of AI compute resources?", types: [2,3], frameworks: "ISO 42001 C.8.4, EU AI Act Art. 10" },
  { id: "TEBF-49", domain: "Transparency, Explainability, Bias & Fairness", title: "Explainability Methods", content: "Are explainability methods implemented to make AI decision-making processes understandable?", types: [2,3], frameworks: "EU AI Act Art. 13, NIST RMF Govern 1.5" },
  { id: "TEBF-50", domain: "Transparency, Explainability, Bias & Fairness", title: "Model Documentation Requirements", content: "Are there requirements for documenting AI model development processes, training data, and key design decisions?", types: [2,3], frameworks: "EU AI Act Art. 11, ISO 42001 C.8.2" },
  { id: "TEBF-51", domain: "Transparency, Explainability, Bias & Fairness", title: "Model Interpretability Requirements", content: "Are there mandatory interpretability requirements for high-risk AI models used in regulated domains?", types: [3], frameworks: "EU AI Act Art. 13, NIST RMF Govern 1.5" },
  { id: "TEBF-52", domain: "Transparency, Explainability, Bias & Fairness", title: "Formal Model Documentation", content: "Does your organization produce and maintain formal model documentation (e.g., data sheets) for all AI models?", types: [3], frameworks: "ISO 42001 C.8.2, NIST RMF Govern 1.5" },
  { id: "TEBF-53", domain: "Transparency, Explainability, Bias & Fairness", title: "AI Model Cards", content: "Are model cards published for AI models to communicate capabilities, limitations, and intended use cases?", types: [3], frameworks: "NIST RMF Govern 1.5, ISO 42001 C.8.2" },

  // Human Oversight and Operational Management
  { id: "HUMOPS-53", domain: "Human Oversight & Ops", title: "AI Use Case Documentation", content: "Does your organization document approved AI use cases and their associated risks and controls?", types: [1,2,3], frameworks: "ISO 42001 C.8.1, NIST RMF Govern 1.2" },
  { id: "HUMOPS-54", domain: "Human Oversight & Ops", title: "User Feedback Mechanisms", content: "Are mechanisms in place for users to provide feedback on AI system outputs and behavior?", types: [1,2,3], frameworks: "EU AI Act Art. 14, NIST RMF Manage 4.1" },
  { id: "HUMOPS-55", domain: "Human Oversight & Ops", title: "Human Oversight Mechanisms", content: "Are human oversight mechanisms implemented for AI systems making high-stakes decisions?", types: [2,3], frameworks: "EU AI Act Art. 14, NIST RMF Manage 2.4" },
  { id: "HUMOPS-56", domain: "Human Oversight & Ops", title: "AI Change Management", content: "Is there a change management process for updates to AI models or significant changes to training data?", types: [2,3], frameworks: "ISO 42001 C.8.3, NIST RMF Manage 3.2" },
  { id: "HUMOPS-57", domain: "Human Oversight & Ops", title: "Model Versioning and Registry", content: "Does your organization maintain a model registry with versioning and metadata for deployed AI models?", types: [3], frameworks: "NIST RMF Manage 3.1, ISO 42001 C.8.3" },
  { id: "HUMOPS-58", domain: "Human Oversight & Ops", title: "Model Retraining Protocols", content: "Are formal protocols established for determining when and how AI models should be retrained?", types: [3], frameworks: "NIST RMF Manage 3.2, ISO 42001 C.8.3" },
  { id: "HUMOPS-59", domain: "Human Oversight & Ops", title: "Model Decommissioning Process", content: "Is there a formal process for decommissioning AI models that are no longer appropriate or safe to use?", types: [3], frameworks: "ISO 42001 C.8.3, NIST RMF Manage 3.3" },
  { id: "HUMOPS-60", domain: "Human Oversight & Ops", title: "Multi-stakeholder Review Process", content: "Is there a multi-stakeholder review process for significant AI system changes or new high-risk deployments?", types: [3], frameworks: "ISO 42001 C.7.4, NIST RMF Govern 3.2" },

  // Incident Management and Business Continuity
  { id: "IRBC-61", domain: "Incident Management & Business Continuity", title: "AI Incident Response - AI Vendors", content: "Does your organization have an incident response process for AI-related failures or misuse by AI vendors?", types: [1,2,3], frameworks: "ISO 42001 C.10.1, NIST RMF Manage 4.2" },
  { id: "IRBC-62", domain: "Incident Management & Business Continuity", title: "AI Incident Response - AI Systems", content: "Does your organization have an incident response process for AI-related failures or misuse of your AI systems?", types: [2,3], frameworks: "ISO 42001 C.10.1, NIST RMF Manage 4.2" },
  { id: "IRBC-63", domain: "Incident Management & Business Continuity", title: "AI Incident Response - AI Developers", content: "If your organization develops AI, is there an incident response process specific to AI model failures?", types: [3], frameworks: "ISO 42001 C.10.1, NIST RMF Manage 4.2" },
  { id: "IRBC-64", domain: "Incident Management & Business Continuity", title: "AI-specific Business Continuity Plans", content: "Does your business continuity planning specifically address AI system failures and dependencies?", types: [3], frameworks: "ISO 42001 C.8.3, NIST RMF Manage 4.1" },

  // Skills and Training
  { id: "ST-65", domain: "Skills & Training", title: "User Training for AI Tools", content: "Are users trained on the responsible and secure use of AI tools deployed in your organization?", types: [1,2,3], frameworks: "ISO 42001 C.7.2, NIST RMF Govern 6.2" },
  { id: "ST-66", domain: "Skills & Training", title: "Skill Development and Maintenance", content: "Does your organization have programs to develop and maintain AI-related skills across relevant teams?", types: [2,3], frameworks: "ISO 42001 C.7.2, NIST RMF Govern 6.2" },
  { id: "ST-67", domain: "Skills & Training", title: "Advanced AI Skill Development", content: "Are specialized training programs in place for AI developers, data scientists, and AI risk professionals?", types: [3], frameworks: "ISO 42001 C.7.2, NIST RMF Govern 6.2" },

  // Reporting and Communication
  { id: "COMMS-68", domain: "Reporting & Communication", title: "AI vendor transparency", content: "Does your organization communicate clearly with customers about which AI vendors you use and how they process data?", types: [1,2,3], frameworks: "EU AI Act Art. 13, ISO 42001 C.7.4" },
  { id: "COMMS-69", domain: "Reporting & Communication", title: "AI data use communication", content: "Are users informed about how their data is used by AI systems in your products or services?", types: [2,3], frameworks: "EU AI Act Art. 13, ISO 42001 C.7.4" },
  { id: "COMMS-70", domain: "Reporting & Communication", title: "AI System Reporting", content: "Does your organization produce regular reports on AI system performance, incidents, and compliance for internal stakeholders?", types: [3], frameworks: "ISO 42001 C.9.1, NIST RMF Govern 1.7" },
  { id: "COMMS-71", domain: "Reporting & Communication", title: "Model Development Standards", content: "Are there public or internal standards published for responsible AI development at your organization?", types: [3], frameworks: "ISO 42001 C.5.2, NIST RMF Govern 1.7" },
];

const DOMAINS = [...new Set(QUESTIONS.map(q => q.domain))];
const DOMAIN_COLORS = {
  "Governance & Org Management": "#3B82F6",
  "Risk Management & Compliance": "#EF4444",
  "Data Management & Privacy": "#8B5CF6",
  "Security Controls & Operations": "#F59E0B",
  "Testing, Monitoring & Performance": "#10B981",
  "Transparency, Explainability, Bias & Fairness": "#EC4899",
  "Human Oversight & Ops": "#6366F1",
  "Incident Management & Business Continuity": "#F97316",
  "Skills & Training": "#14B8A6",
  "Reporting & Communication": "#64748B",
};

export default function App() {
  const [orgType, setOrgType] = useState(null);
  const [answers, setAnswers] = useState({});
  const [details, setDetails] = useState({});
  const [view, setView] = useState("setup"); // setup | assessment | results
  const [activeDomain, setActiveDomain] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);

  const filteredQuestions = useMemo(() => {
    if (!orgType) return [];
    return QUESTIONS.filter(q => q.types.includes(orgType));
  }, [orgType]);

  const domainQuestions = useMemo(() => {
    return DOMAINS.reduce((acc, d) => {
      acc[d] = filteredQuestions.filter(q => q.domain === d);
      return acc;
    }, {});
  }, [filteredQuestions]);

  const activeDomains = useMemo(() => {
    return DOMAINS.filter(d => (domainQuestions[d] || []).length > 0);
  }, [domainQuestions]);

  const score = useMemo(() => {
    const total = filteredQuestions.length;
    const yes = filteredQuestions.filter(q => answers[q.id] === "yes").length;
    const no = filteredQuestions.filter(q => answers[q.id] === "no").length;
    const answered = yes + no;
    return { total, yes, no, answered, pct: answered ? Math.round((yes / answered) * 100) : 0 };
  }, [filteredQuestions, answers]);

  const domainScore = (domain) => {
    const qs = domainQuestions[domain] || [];
    const yes = qs.filter(q => answers[q.id] === "yes").length;
    const ans = qs.filter(q => answers[q.id] === "yes" || answers[q.id] === "no").length;
    return { yes, total: qs.length, ans };
  };

  const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));

  const currentDomainQs = activeDomain ? (domainQuestions[activeDomain] || []) : [];

  if (view === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0D14", color: "#E2E8F0", fontFamily: "'DM Mono', 'Courier New', monospace", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 680, width: "100%" }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, color: "#F8FAFC", margin: "0 0 8px", lineHeight: 1.1, fontFamily: "'DM Sans', sans-serif" }}>AI Security Assessment</h1>
          <p style={{ color: "#64748B", fontSize: 15, marginBottom: 48, lineHeight: 1.6 }}>
            Aligned with NIST AI RMF, ISO 42001, and the EU AI Act. Select your organization profile to begin.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { type: 1, label: "Type 1 — Using AI", desc: "Your org uses AI software products or software built with AI. Basic AI security evaluation.", count: QUESTIONS.filter(q => q.types.includes(1)).length },
              { type: 2, label: "Type 2 — Building with AI", desc: "You provide AI-powered products and services. Evaluates supply chain, training methods, drift, and more.", count: QUESTIONS.filter(q => q.types.includes(2)).length },
              { type: 3, label: "Type 3 — Developing AI", desc: "You develop AI models and train AI systems. Full deep-dive including access controls and risk classification.", count: QUESTIONS.filter(q => q.types.includes(3)).length },
            ].map(({ type, label, desc, count }) => (
              <div key={type}
                onClick={() => setOrgType(type)}
                style={{
                  border: `1px solid ${orgType === type ? "#3B82F6" : "#1E2635"}`,
                  borderRadius: 12,
                  padding: "24px 28px",
                  cursor: "pointer",
                  background: orgType === type ? "rgba(59,130,246,0.08)" : "#0F1420",
                  transition: "all 0.2s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 20,
                }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: orgType === type ? "#93C5FD" : "#CBD5E1", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{desc}</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: orgType === type ? "#3B82F6" : "#1E2A3A", minWidth: 50, textAlign: "right" }}>{count}</div>
              </div>
            ))}
          </div>

          <button
            disabled={!orgType}
            onClick={() => { setActiveDomain(activeDomains[0]); setView("assessment"); }}
            style={{
              marginTop: 32, width: "100%", padding: "16px", borderRadius: 10,
              background: orgType ? "#3B82F6" : "#1E2635", color: orgType ? "#FFF" : "#334155",
              border: "none", fontSize: 15, fontWeight: 600, cursor: orgType ? "pointer" : "not-allowed",
              letterSpacing: 0.5, transition: "background 0.2s",
            }}>
            Begin Assessment →
          </button>
        </div>
      </div>
    );
  }

  if (view === "results") {
    const gaps = filteredQuestions.filter(q => answers[q.id] === "no");
    const unanswered = filteredQuestions.filter(q => !answers[q.id]);
    return (
      <div style={{ minHeight: "100vh", background: "#0A0D14", color: "#E2E8F0", fontFamily: "'DM Mono', 'Courier New', monospace", padding: "40px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
            <button onClick={() => setView("assessment")} style={{ background: "none", border: "1px solid #1E2635", color: "#64748B", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#64748B", textTransform: "uppercase" }}>Results</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#F8FAFC", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>AI Security Assessment Report</h2>
            </div>
          </div>

          {/* Score card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
            {[
              { label: "Compliance Score", val: `${score.pct}%`, color: score.pct >= 80 ? "#10B981" : score.pct >= 50 ? "#F59E0B" : "#EF4444" },
              { label: "Compliant", val: score.yes, color: "#10B981" },
              { label: "Gaps Found", val: score.no, color: "#EF4444" },
              { label: "Unanswered", val: unanswered.length, color: "#64748B" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: "#0F1420", border: "1px solid #1E2635", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 30, fontWeight: 700, color, marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 12, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Domain breakdown */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "#475569", marginBottom: 20 }}>Domain Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeDomains.map(d => {
                const ds = domainScore(d);
                const pct = ds.ans ? Math.round((ds.yes / ds.ans) * 100) : 0;
                const color = DOMAIN_COLORS[d] || "#3B82F6";
                return (
                  <div key={d} style={{ background: "#0F1420", border: "1px solid #1E2635", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 12, color: "#94A3B8", minWidth: 280 }}>{d}</div>
                    <div style={{ flex: 1, height: 6, background: "#1E2635", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color, minWidth: 50, textAlign: "right" }}>{ds.yes}/{ds.ans}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gaps */}
          {gaps.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "#475569", marginBottom: 20 }}>Identified Gaps ({gaps.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {gaps.map(q => (
                  <div key={q.id} style={{ background: "#0F1420", border: "1px solid #EF444422", borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: "#EF4444", letterSpacing: 1, fontFamily: "monospace" }}>{q.id}</span>
                          <span style={{ fontSize: 11, color: "#475569" }}>·</span>
                          <span style={{ fontSize: 11, color: "#475569" }}>{q.domain}</span>
                        </div>
                        <div style={{ fontSize: 14, color: "#CBD5E1", fontWeight: 600 }}>{q.title}</div>
                        {details[q.id] && <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>{details[q.id]}</div>}
                      </div>
                      {q.frameworks && <div style={{ fontSize: 11, color: "#334155", minWidth: 200, textAlign: "right", lineHeight: 1.5 }}>{q.frameworks}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assessment view
  return (
    <div style={{ minHeight: "100vh", background: "#0A0D14", color: "#E2E8F0", fontFamily: "'DM Mono', 'Courier New', monospace", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 260, minHeight: "100vh", background: "#080B12", borderRight: "1px solid #1E2635", padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1E2635" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#334155", textTransform: "uppercase", marginBottom: 4 }}>AI Security</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>Assessment</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
          {activeDomains.map(d => {
            const ds = domainScore(d);
            const color = DOMAIN_COLORS[d] || "#3B82F6";
            const isActive = activeDomain === d;
            return (
              <div key={d}
                onClick={() => setActiveDomain(d)}
                style={{
                  padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                  background: isActive ? `${color}18` : "transparent",
                  border: `1px solid ${isActive ? color + "44" : "transparent"}`,
                  transition: "all 0.15s",
                }}>
                <div style={{ fontSize: 12, color: isActive ? "#F8FAFC" : "#475569", fontWeight: isActive ? 600 : 400, marginBottom: 4, lineHeight: 1.3 }}>{d}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, background: "#1E2635", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: ds.ans ? `${(ds.yes / ds.total) * 100}%` : "0%", background: color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#334155" }}>{ds.ans}/{ds.total}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1E2635" }}>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>
            {score.answered}/{score.total} answered · <span style={{ color: "#10B981" }}>{score.yes} compliant</span>
          </div>
          <button onClick={() => setView("results")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#3B82F6", color: "#FFF", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            View Results →
          </button>
          <button onClick={() => { setView("setup"); setOrgType(null); setAnswers({}); setDetails({}); }} style={{ width: "100%", padding: "8px", marginTop: 8, borderRadius: 8, background: "none", color: "#334155", border: "1px solid #1E2635", fontSize: 12, cursor: "pointer" }}>
            Restart
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {activeDomain && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: DOMAIN_COLORS[activeDomain] || "#3B82F6", display: "inline-block", marginRight: 10, verticalAlign: "middle" }} />
              <span style={{ fontSize: 11, letterSpacing: 3, color: "#475569", textTransform: "uppercase" }}>{activeDomain}</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", margin: "8px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                {currentDomainQs.length} Questions
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentDomainQs.map(q => {
                const ans = answers[q.id];
                const isExpanded = expandedQ === q.id;
                const color = DOMAIN_COLORS[activeDomain] || "#3B82F6";
                return (
                  <div key={q.id} style={{
                    background: "#0F1420",
                    border: `1px solid ${ans === "yes" ? "#10B98130" : ans === "no" ? "#EF444430" : "#1E2635"}`,
                    borderRadius: 12, overflow: "hidden", transition: "border 0.2s",
                  }}>
                    <div style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: color, letterSpacing: 1 }}>{q.id}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#CBD5E1", lineHeight: 1.5, marginBottom: 8 }}>{q.title}</div>
                          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{q.content}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <button onClick={() => setAnswer(q.id, "yes")} style={{
                          padding: "8px 20px", borderRadius: 8, border: `1px solid ${ans === "yes" ? "#10B981" : "#1E2635"}`,
                          background: ans === "yes" ? "#10B98120" : "transparent", color: ans === "yes" ? "#10B981" : "#475569",
                          cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                        }}>✓ Yes</button>
                        <button onClick={() => setAnswer(q.id, "no")} style={{
                          padding: "8px 20px", borderRadius: 8, border: `1px solid ${ans === "no" ? "#EF4444" : "#1E2635"}`,
                          background: ans === "no" ? "#EF444420" : "transparent", color: ans === "no" ? "#EF4444" : "#475569",
                          cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                        }}>✗ No</button>
                        <button onClick={() => setAnswer(q.id, "na")} style={{
                          padding: "8px 20px", borderRadius: 8, border: `1px solid ${ans === "na" ? "#64748B" : "#1E2635"}`,
                          background: ans === "na" ? "#64748B20" : "transparent", color: ans === "na" ? "#94A3B8" : "#334155",
                          cursor: "pointer", fontSize: 13, transition: "all 0.15s",
                        }}>N/A</button>
                        <button onClick={() => setExpandedQ(isExpanded ? null : q.id)} style={{
                          marginLeft: "auto", background: "none", border: "1px solid #1E2635", color: "#334155",
                          borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12,
                        }}>
                          {isExpanded ? "Hide" : "Add note"}
                        </button>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: 12 }}>
                          <textarea
                            value={details[q.id] || ""}
                            onChange={e => setDetails(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Add notes or context for this answer..."
                            style={{ width: "100%", background: "#080B12", border: "1px solid #1E2635", borderRadius: 8, padding: "10px 14px", color: "#94A3B8", fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 80, boxSizing: "border-box" }}
                          />
                        </div>
                      )}

                      {q.frameworks && (
                        <div style={{ marginTop: 10, fontSize: 11, color: "#2D3748" }}>{q.frameworks}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
              {(() => {
                const idx = activeDomains.indexOf(activeDomain);
                return (
                  <>
                    <button disabled={idx === 0} onClick={() => setActiveDomain(activeDomains[idx - 1])}
                      style={{ background: "none", border: "1px solid #1E2635", color: idx === 0 ? "#1E2635" : "#475569", borderRadius: 8, padding: "10px 20px", cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>
                      ← Previous
                    </button>
                    {idx < activeDomains.length - 1 ? (
                      <button onClick={() => setActiveDomain(activeDomains[idx + 1])}
                        style={{ background: "#3B82F6", border: "none", color: "#FFF", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                        Next →
                      </button>
                    ) : (
                      <button onClick={() => setView("results")}
                        style={{ background: "#10B981", border: "none", color: "#FFF", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                        View Results →
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

