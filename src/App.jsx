import { useState, useMemo } from "react";

const QUESTIONS = [
  { id: "GOVORG-01", domain: "Governance & Org Management", title: "AI Risk Classification", content: "Does your organization classify AI systems based on their risk level to guide appropriate controls?", types: [1,2,3], frameworks: "EU AI Act Art. 6-8, NIST RMF Map 1.3, ISO 42001 C.6.1.4" },
  { id: "GOVORG-02", domain: "Governance & Org Management", title: "AI Procurement Policy", content: "Does your organization have specific procurement policy elements for AI-enabled systems that addresses security and ethical considerations?", types: [1,2,3], frameworks: "ISO 42001 C.8.4, NIST RMF Govern 2.2" },
  { id: "GOVORG-03", domain: "Governance & Org Management", title: "AI Inventory Management", content: "Does your organization maintain an inventory of AI-enabled tools and systems?", types: [1,2,3], frameworks: "ISO 42001 C.8.1, NIST RMF Govern 1.2" },
  { id: "GOVORG-04", domain: "Governance & Org Management", title: "AI Development Lifecycle", content: "Is there a documented development lifecycle that incorporates AI-specific security practices?", types: [2,3], frameworks: "ISO 42001 C.8.3, NIST RMF Govern 1.4" },
  { id: "GOVORG-05", domain: "Governance & Org Management", title: "Cross-Functional AI Review", content: "Is there a cross-functional review process (including legal, privacy, and ethics) for new AI implementations?", types: [2,3], frameworks: "ISO 42001 C.7.4, NIST RMF Govern 3.2" },
  { id: "GOVORG-06", domain: "Governance & Org Management", title: "AI Risk Assessment Process", content: "Is there a formalized risk assessment process specific to AI applications?", types: [2,3], frameworks: "ISO 42001 C.6.1, NIST RMF Map 1.1" },
  { id: "GOVORG-07", domain: "Governance & Org Management", title: "AI Governance Committee", content: "Is there a dedicated governance committee overseeing AI development and deployment including accountability for AI outputs and decisions?", types: [3], frameworks: "ISO 42001 C.5.3, NIST RMF Govern 1.1, EU AI Act Art. 16-29" },
  { id: "GOVORG-08", domain: "Governance & Org Management", title: "AI Ethics Board", content: "Is there an AI ethics board that reviews high-risk or potentially controversial AI applications?", types: [3], frameworks: "ISO 42001 C.5.2, NIST RMF Govern 5.1" },
  { id: "GOVORG-09", domain: "Governance & Org Management", title: "Advanced Model Risk Scoring", content: "Does your organization implement risk scoring for models based on use case sensitivity, data types, and potential impact?", types: [3], frameworks: "NIST RMF Map 1.4, ISO 42001 C.6.1" },
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
  { id: "DMP-20", domain: "Data Management & Privacy", title: "AI Data Protection Impact Assessment", content: "Are data protection impact assessments conducted for AI systems that process personal data?", types: [1,2,3], frameworks: "EU AI Act Art. 29, ISO 42001 C.8.2" },
  { id: "DMP-21", domain: "Data Management & Privacy", title: "AI Data Quality Framework", content: "Does your organization have a framework to ensure the quality and appropriateness of data used by AI systems?", types: [2,3], frameworks: "EU AI Act Art. 10, NIST RMF Map 2.2" },
  { id: "DMP-22", domain: "Data Management & Privacy", title: "Input Data Validation", content: "Are controls in place to validate inputs to AI systems to prevent adversarial attacks?", types: [2,3], frameworks: "NIST RMF Measure 2.1, ISO 42001 C.8.3" },
  { id: "DMP-23", domain: "Data Management & Privacy", title: "Training and Fine Tuning", content: "Do you or your AI Model or System vendors train on customer data provided to them?", types: [2,3], frameworks: "" },
  { id: "DMP-24", domain: "Data Management & Privacy", title: "Training and Fine Tuning Opt-out", content: "Can a customer opt out of having data they share with you trained on or used for fine tuning?", types: [2,3], frameworks: "" },
  { id: "DMP-25", domain: "Data Management & Privacy", title: "Training Data Governance", content: "Does your organization have a governance framework for managing training data, including data quality and representativeness?", types: [3], frameworks: "NIST RMF Map 2.3, EU AI Act Art. 10" },
  { id: "DMP-26", domain: "Data Management & Privacy", title: "Data Lineage Management", content: "Does your organization maintain detailed records of data provenance for all data used in model training?", types: [3], frameworks: "EU AI Act Art. 10, ISO 42001 C.8.2" },
  { id: "DMP-27", domain: "Data Management & Privacy", title: "Dataset Bias Detection Tools", content: "Does your organization employ specialized tools for detecting and mitigating bias in datasets or systems?", types: [3], frameworks: "NIST RMF Manage 2.3, EU AI Act Art. 10" },
  { id: "DMP-28", domain: "Data Management & Privacy", title: "Model Privacy by Design", content: "Are privacy-enhancing technologies incorporated into model design?", types: [3], frameworks: "ISO 42001 C.8.2, EU AI Act Art. 10" },
  { id: "SEC-29", domain: "Security Controls & Operations", title: "AI System Access Control", content: "Are role-based access controls implemented for AI systems and sensitive training data?", types: [1,2,3], frameworks: "ISO 42001 C.8.2, NIST RMF Govern 4.1" },
  { id: "SEC-30", domain: "Security Controls & Operations", title: "AI Cybersecurity Integration", content: "Are cybersecurity practices integrated into your AI development and deployment processes?", types: [1,2,3], frameworks: "NIST RMF Manage 1.1, ISO 42001 C.8.3" },
  { id: "SEC-31", domain: "Security Controls & Operations", title: "Model Integration Security", content: "Are security assessments conducted when integrating third-party AI models or APIs into your systems?", types: [2,3], frameworks: "ISO 42001 C.8.4, NIST RMF Govern 2.3" },
  { id: "SEC-32", domain: "Security Controls & Operations", title: "AI Behavior Boundaries", content: "Are mechanisms in place to constrain AI system behavior within defined operational boundaries?", types: [2,3], frameworks: "NIST RMF Manage 2.2, ISO 42001 C.8.3" },
  { id: "SEC-33", domain: "Security Controls & Operations", title: "AI Logging and Auditability", content: "Are comprehensive logging and audit trails maintained for AI system operations and decisions?", types: [2,3], frameworks: "EU AI Act Art. 12, ISO 42001 C.9.1" },
  { id: "SEC-34", domain: "Security Controls & Operations", title: "Advanced Adversarial Testing", content: "Does your organization conduct adversarial testing (e.g., red teaming) specifically for AI systems?", types: [3], frameworks: "NIST RMF Measure 2.6, ISO 42001 C.8.3" },
  { id: "SEC-35", domain: "Security Controls & Operations", title: "Continuous Security Testing", content: "Is continuous security testing integrated into the AI development pipeline?", types: [3], frameworks: "NIST RMF Manage 1.2, ISO 42001 C.8.3" },
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
  { id: "TEBF-46", domain: "Transparency, Explainability & Fairness", title: "AI Transparency Requirements", content: "Does your organization have transparency requirements for AI systems used in customer-facing or high-impact decisions?", types: [1,2,3], frameworks: "EU AI Act Art. 13, NIST RMF Govern 1.5" },
  { id: "TEBF-47", domain: "Transparency, Explainability & Fairness", title: "Bias and Fairness Assessment", content: "Does your organization conduct bias assessments for AI systems before deployment?", types: [1,2,3], frameworks: "NIST RMF Measure 2.3, ISO 42001 C.8.2" },
  { id: "TEBF-48", domain: "Transparency, Explainability & Fairness", title: "AI Compute Supply Chain", content: "Does your organization track and assess the environmental and ethical implications of AI compute resources?", types: [2,3], frameworks: "ISO 42001 C.8.4, EU AI Act Art. 10" },
  { id: "TEBF-49", domain: "Transparency, Explainability & Fairness", title: "Explainability Methods", content: "Are explainability methods implemented to make AI decision-making processes understandable?", types: [2,3], frameworks: "EU AI Act Art. 13, NIST RMF Govern 1.5" },
  { id: "TEBF-50", domain: "Transparency, Explainability & Fairness", title: "Model Documentation Requirements", content: "Are there requirements for documenting AI model development processes, training data, and key design decisions?", types: [2,3], frameworks: "EU AI Act Art. 11, ISO 42001 C.8.2" },
  { id: "TEBF-51", domain: "Transparency, Explainability & Fairness", title: "Model Interpretability Requirements", content: "Are there mandatory interpretability requirements for high-risk AI models used in regulated domains?", types: [3], frameworks: "EU AI Act Art. 13, NIST RMF Govern 1.5" },
  { id: "TEBF-52", domain: "Transparency, Explainability & Fairness", title: "Formal Model Documentation", content: "Does your organization produce and maintain formal model documentation for all AI models?", types: [3], frameworks: "ISO 42001 C.8.2, NIST RMF Govern 1.5" },
  { id: "TEBF-53", domain: "Transparency, Explainability & Fairness", title: "AI Model Cards", content: "Are model cards published for AI models to communicate capabilities, limitations, and intended use cases?", types: [3], frameworks: "NIST RMF Govern 1.5, ISO 42001 C.8.2" },
  { id: "HUMOPS-53", domain: "Human Oversight & Operations", title: "AI Use Case Documentation", content: "Does your organization document approved AI use cases and their associated risks and controls?", types: [1,2,3], frameworks: "ISO 42001 C.8.1, NIST RMF Govern 1.2" },
  { id: "HUMOPS-54", domain: "Human Oversight & Operations", title: "User Feedback Mechanisms", content: "Are mechanisms in place for users to provide feedback on AI system outputs and behavior?", types: [1,2,3], frameworks: "EU AI Act Art. 14, NIST RMF Manage 4.1" },
  { id: "HUMOPS-55", domain: "Human Oversight & Operations", title: "Human Oversight Mechanisms", content: "Are human oversight mechanisms implemented for AI systems making high-stakes decisions?", types: [2,3], frameworks: "EU AI Act Art. 14, NIST RMF Manage 2.4" },
  { id: "HUMOPS-56", domain: "Human Oversight & Operations", title: "AI Change Management", content: "Is there a change management process for updates to AI models or significant changes to training data?", types: [2,3], frameworks: "ISO 42001 C.8.3, NIST RMF Manage 3.2" },
  { id: "HUMOPS-57", domain: "Human Oversight & Operations", title: "Model Versioning and Registry", content: "Does your organization maintain a model registry with versioning and metadata for deployed AI models?", types: [3], frameworks: "NIST RMF Manage 3.1, ISO 42001 C.8.3" },
  { id: "HUMOPS-58", domain: "Human Oversight & Operations", title: "Model Retraining Protocols", content: "Are formal protocols established for determining when and how AI models should be retrained?", types: [3], frameworks: "NIST RMF Manage 3.2, ISO 42001 C.8.3" },
  { id: "HUMOPS-59", domain: "Human Oversight & Operations", title: "Model Decommissioning Process", content: "Is there a formal process for decommissioning AI models that are no longer appropriate or safe to use?", types: [3], frameworks: "ISO 42001 C.8.3, NIST RMF Manage 3.3" },
  { id: "HUMOPS-60", domain: "Human Oversight & Operations", title: "Multi-stakeholder Review Process", content: "Is there a multi-stakeholder review process for significant AI system changes or new high-risk deployments?", types: [3], frameworks: "ISO 42001 C.7.4, NIST RMF Govern 3.2" },
  { id: "IRBC-61", domain: "Incident Management & Continuity", title: "AI Incident Response — Vendors", content: "Does your organization have an incident response process for AI-related failures or misuse by AI vendors?", types: [1,2,3], frameworks: "ISO 42001 C.10.1, NIST RMF Manage 4.2" },
  { id: "IRBC-62", domain: "Incident Management & Continuity", title: "AI Incident Response — Systems", content: "Does your organization have an incident response process for AI-related failures or misuse of your AI systems?", types: [2,3], frameworks: "ISO 42001 C.10.1, NIST RMF Manage 4.2" },
  { id: "IRBC-63", domain: "Incident Management & Continuity", title: "AI Incident Response — Developers", content: "If your organization develops AI, is there an incident response process specific to AI model failures?", types: [3], frameworks: "ISO 42001 C.10.1, NIST RMF Manage 4.2" },
  { id: "IRBC-64", domain: "Incident Management & Continuity", title: "AI Business Continuity Plans", content: "Does your business continuity planning specifically address AI system failures and dependencies?", types: [3], frameworks: "ISO 42001 C.8.3, NIST RMF Manage 4.1" },
  { id: "ST-65", domain: "Skills & Training", title: "User Training for AI Tools", content: "Are users trained on the responsible and secure use of AI tools deployed in your organization?", types: [1,2,3], frameworks: "ISO 42001 C.7.2, NIST RMF Govern 6.2" },
  { id: "ST-66", domain: "Skills & Training", title: "Skill Development and Maintenance", content: "Does your organization have programs to develop and maintain AI-related skills across relevant teams?", types: [2,3], frameworks: "ISO 42001 C.7.2, NIST RMF Govern 6.2" },
  { id: "ST-67", domain: "Skills & Training", title: "Advanced AI Skill Development", content: "Are specialized training programs in place for AI developers, data scientists, and AI risk professionals?", types: [3], frameworks: "ISO 42001 C.7.2, NIST RMF Govern 6.2" },
  { id: "COMMS-68", domain: "Reporting & Communication", title: "AI Vendor Transparency", content: "Does your organization communicate clearly with customers about which AI vendors you use and how they process data?", types: [1,2,3], frameworks: "EU AI Act Art. 13, ISO 42001 C.7.4" },
  { id: "COMMS-69", domain: "Reporting & Communication", title: "AI Data Use Communication", content: "Are users informed about how their data is used by AI systems in your products or services?", types: [2,3], frameworks: "EU AI Act Art. 13, ISO 42001 C.7.4" },
  { id: "COMMS-70", domain: "Reporting & Communication", title: "AI System Reporting", content: "Does your organization produce regular reports on AI system performance, incidents, and compliance for internal stakeholders?", types: [3], frameworks: "ISO 42001 C.9.1, NIST RMF Govern 1.7" },
  { id: "COMMS-71", domain: "Reporting & Communication", title: "Model Development Standards", content: "Are there public or internal standards published for responsible AI development at your organization?", types: [3], frameworks: "ISO 42001 C.5.2, NIST RMF Govern 1.7" },
];

const DOMAINS = [...new Set(QUESTIONS.map(q => q.domain))];

const DOMAIN_META = {
  "Governance & Org Management":            { icon: "🏛️", color: "#1a4fa8" },
  "Risk Management & Compliance":           { icon: "⚖️", color: "#b91c1c" },
  "Data Management & Privacy":              { icon: "🔐", color: "#6c3483" },
  "Security Controls & Operations":         { icon: "🛡️", color: "#1a6b3a" },
  "Testing, Monitoring & Performance":      { icon: "📊", color: "#b45309" },
  "Transparency, Explainability & Fairness":{ icon: "🔍", color: "#0e6fa8" },
  "Human Oversight & Operations":           { icon: "👥", color: "#1a5276" },
  "Incident Management & Continuity":       { icon: "🚨", color: "#922b21" },
  "Skills & Training":                      { icon: "🎓", color: "#1e8449" },
  "Reporting & Communication":              { icon: "📋", color: "#4a235a" },
};

const C = {
  navy: "#0d2d6e", navyDk: "#081c4a", navyLt: "#1a4fa8",
  accent: "#00a8e8", accentLt: "#e8f6fd",
  white: "#ffffff", offWhite: "#f4f7fb",
  gray50: "#f8fafc", gray100: "#f0f4f8", gray200: "#dce4ef",
  gray400: "#8fa3be", gray600: "#4a6080", gray800: "#1e2d40",
  green: "#1e8449", greenLt: "#eafaf1",
  red: "#b91c1c", redLt: "#fef2f2",
  yellow: "#b45309",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Source+Sans+3:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Source Sans 3',sans-serif;background:${C.offWhite};}

  .nav{background:${C.navyDk};height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,0.3);}
  .nav-brand{display:flex;align-items:center;gap:12px;}
  .nav-logo{width:38px;height:38px;background:${C.accent};border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:800;font-size:14px;color:#fff;letter-spacing:-0.5px;}
  .nav-co{font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;color:#fff;}
  .nav-tag{font-size:11px;color:${C.accent};letter-spacing:0.5px;}
  .nav-pill{border:1px solid rgba(0,168,232,0.4);background:rgba(0,168,232,0.1);color:${C.accent};font-size:11px;padding:5px 14px;border-radius:20px;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;}

  .hero{background:linear-gradient(135deg,${C.navyDk} 0%,${C.navy} 55%,${C.navyLt} 100%);padding:72px 24px 96px;text-align:center;position:relative;overflow:hidden;}
  .hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 65% 40%,rgba(0,168,232,0.13) 0%,transparent 65%);}
  .hero-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(0,168,232,0.12);border:1px solid rgba(0,168,232,0.3);color:${C.accent};font-size:11px;padding:5px 16px;border-radius:20px;letter-spacing:2px;text-transform:uppercase;margin-bottom:22px;font-family:'Montserrat',sans-serif;font-weight:700;position:relative;z-index:1;}
  .hero-h1{font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(26px,4vw,44px);color:#fff;line-height:1.15;margin-bottom:16px;position:relative;z-index:1;}
  .hero-h1 em{color:${C.accent};font-style:normal;}
  .hero-p{font-size:16px;color:rgba(255,255,255,0.6);max-width:540px;margin:0 auto 40px;line-height:1.7;position:relative;z-index:1;}
  .hero-fws{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;position:relative;z-index:1;}
  .hero-fw{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.65);font-size:12px;padding:5px 14px;border-radius:20px;}

  .setup-wrap{max-width:800px;margin:-44px auto 0;padding:0 24px 60px;position:relative;z-index:2;}
  .setup-label{text-align:center;font-family:'Montserrat',sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.gray400};margin-bottom:18px;}
  .type-card{background:#fff;border:2px solid ${C.gray200};border-radius:16px;padding:24px 28px;margin-bottom:14px;cursor:pointer;display:grid;grid-template-columns:52px 1fr 60px;align-items:center;gap:18px;box-shadow:0 2px 8px rgba(13,45,110,0.06);transition:all 0.2s;}
  .type-card:hover{border-color:${C.navyLt};box-shadow:0 8px 24px rgba(13,45,110,0.12);transform:translateY(-2px);}
  .type-card.sel{border-color:${C.accent};background:${C.accentLt};box-shadow:0 8px 24px rgba(0,168,232,0.15);}
  .type-icon{width:52px;height:52px;border-radius:13px;background:${C.navy};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
  .type-card.sel .type-icon{background:${C.navyLt};}
  .type-name{font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;color:${C.navy};margin-bottom:5px;}
  .type-desc{font-size:13.5px;color:${C.gray600};line-height:1.55;}
  .type-count{font-family:'Montserrat',sans-serif;font-weight:800;font-size:30px;color:${C.gray200};text-align:center;transition:color 0.2s;}
  .type-card.sel .type-count{color:${C.navyLt};}
  .btn-start{width:100%;padding:18px;border-radius:12px;background:${C.navyLt};color:#fff;border:none;font-family:'Montserrat',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.5px;margin-top:4px;}
  .btn-start:hover:not(:disabled){background:${C.navy};box-shadow:0 6px 20px rgba(13,45,110,0.28);}
  .btn-start:disabled{background:${C.gray200};color:${C.gray400};cursor:not-allowed;}

  .layout{display:flex;min-height:calc(100vh - 64px);}
  .sidebar{width:272px;background:#fff;border-right:1px solid ${C.gray200};display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:64px;height:calc(100vh - 64px);overflow-y:auto;}
  .sb-head{padding:18px 18px 14px;border-bottom:1px solid ${C.gray100};}
  .sb-prog-lbl{font-size:10px;font-family:'Montserrat',sans-serif;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.gray400};margin-bottom:8px;}
  .sb-bar{height:6px;background:${C.gray100};border-radius:4px;overflow:hidden;margin-bottom:6px;}
  .sb-fill{height:100%;background:linear-gradient(90deg,${C.navyLt},${C.accent});border-radius:4px;transition:width 0.4s;}
  .sb-stat{font-size:12px;color:${C.gray600};}
  .sb-stat strong{color:${C.green};}
  .sb-list{flex:1;padding:10px 10px;overflow-y:auto;}
  .sb-item{padding:9px 11px;border-radius:10px;margin-bottom:3px;cursor:pointer;transition:all 0.15s;border:1px solid transparent;}
  .sb-item:hover{background:${C.gray50};}
  .sb-item.act{background:${C.accentLt};border-color:rgba(0,168,232,0.22);}
  .sb-item-top{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
  .sb-item-name{font-size:12px;color:${C.gray800};font-weight:600;flex:1;line-height:1.3;}
  .sb-item.act .sb-item-name{color:${C.navy};}
  .sb-track{height:4px;background:${C.gray100};border-radius:2px;overflow:hidden;}
  .sb-track-fill{height:100%;border-radius:2px;transition:width 0.3s;}
  .sb-item-ct{font-size:10px;color:${C.gray400};margin-top:3px;text-align:right;}
  .sb-foot{padding:14px;border-top:1px solid ${C.gray100};}
  .btn-res{width:100%;padding:11px;background:${C.navyLt};color:#fff;border:none;border-radius:10px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;cursor:pointer;margin-bottom:8px;transition:background 0.2s;}
  .btn-res:hover{background:${C.navy};}
  .btn-rst{width:100%;padding:8px;background:none;color:${C.gray400};border:1px solid ${C.gray200};border-radius:10px;font-size:12px;cursor:pointer;transition:all 0.15s;}
  .btn-rst:hover{border-color:${C.gray400};color:${C.gray600};}

  .main{flex:1;padding:32px 36px;max-width:820px;}
  .dom-hd{margin-bottom:26px;padding-bottom:18px;border-bottom:2px solid ${C.gray100};}
  .dom-hd-top{display:flex;align-items:center;gap:12px;margin-bottom:5px;}
  .dom-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
  .dom-title{font-family:'Montserrat',sans-serif;font-weight:800;font-size:22px;color:${C.navy};}
  .dom-sub{font-size:13px;color:${C.gray400};margin-left:56px;}

  .qcard{background:#fff;border:1px solid ${C.gray200};border-radius:14px;margin-bottom:12px;overflow:hidden;transition:box-shadow 0.2s,border-color 0.2s;box-shadow:0 1px 4px rgba(13,45,110,0.05);}
  .qcard:hover{box-shadow:0 4px 16px rgba(13,45,110,0.1);}
  .qcard.y{border-left:4px solid ${C.green};}
  .qcard.n{border-left:4px solid ${C.red};}
  .qcard.na{border-left:4px solid ${C.gray400};}
  .qbody{padding:20px 22px;}
  .qid{display:inline-block;font-size:11px;font-family:'Montserrat',sans-serif;font-weight:700;color:${C.gray600};background:${C.gray100};padding:2px 9px;border-radius:6px;margin-bottom:7px;letter-spacing:0.5px;}
  .qtitle{font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;color:${C.navy};margin-bottom:6px;line-height:1.35;}
  .qtext{font-size:14px;color:${C.gray600};line-height:1.65;}
  .qfw{font-size:11.5px;color:${C.gray400};margin-top:8px;font-style:italic;}
  .qbtns{display:flex;align-items:center;gap:8px;margin-top:15px;flex-wrap:wrap;}
  .byn{padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;border:2px solid ${C.gray200};background:#fff;color:${C.gray600};font-family:'Montserrat',sans-serif;}
  .byn:hover,.byn.ay{border-color:${C.green};background:${C.greenLt};color:${C.green};}
  .bnn:hover,.bnn.an{border-color:${C.red};background:${C.redLt};color:${C.red};}
  .bna:hover,.bna.ana{border-color:${C.gray400};background:${C.gray100};color:${C.gray800};}
  .bnote{margin-left:auto;background:none;border:1px solid ${C.gray200};color:${C.gray400};border-radius:8px;padding:6px 13px;font-size:12px;cursor:pointer;transition:all 0.15s;}
  .bnote:hover{border-color:${C.navyLt};color:${C.navyLt};}
  .qnote{margin-top:13px;}
  .qnote textarea{width:100%;background:${C.gray50};border:1px solid ${C.gray200};border-radius:8px;padding:10px 13px;font-size:13px;color:${C.gray800};font-family:'Source Sans 3',sans-serif;resize:vertical;min-height:68px;outline:none;transition:border-color 0.15s;}
  .qnote textarea:focus{border-color:${C.navyLt};}
  .qnav{display:flex;justify-content:space-between;margin-top:30px;padding-top:22px;border-top:1px solid ${C.gray100};}
  .bnav{padding:11px 22px;border-radius:10px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.2s;border:2px solid;}
  .bprev{border-color:${C.gray200};background:#fff;color:${C.gray600};}
  .bprev:hover:not(:disabled){border-color:${C.navy};color:${C.navy};}
  .bprev:disabled{opacity:0.3;cursor:not-allowed;}
  .bnext{border-color:${C.navyLt};background:${C.navyLt};color:#fff;}
  .bnext:hover{background:${C.navy};border-color:${C.navy};}
  .bfin{border-color:${C.green};background:${C.green};color:#fff;}
  .bfin:hover{background:#166534;border-color:#166534;}

  .rhero{background:linear-gradient(135deg,${C.navyDk} 0%,${C.navy} 100%);padding:44px 40px;color:#fff;}
  .rhero-top{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:32px;}
  .rh1{font-family:'Montserrat',sans-serif;font-weight:800;font-size:26px;margin-bottom:4px;}
  .rh2{font-size:13px;color:rgba(255,255,255,0.5);}
  .rbk{background:none;border:1px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.75);border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;transition:all 0.15s;}
  .rbk:hover{background:rgba(255,255,255,0.1);}
  .rstats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
  .rstat{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.11);border-radius:13px;padding:18px 22px;}
  .rstat-v{font-family:'Montserrat',sans-serif;font-weight:800;font-size:32px;margin-bottom:4px;}
  .rstat-l{font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;}
  .rbody{max-width:960px;margin:0 auto;padding:36px 40px;}
  .rsect{font-family:'Montserrat',sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:${C.gray400};margin-bottom:16px;}
  .drow{display:grid;grid-template-columns:200px 1fr 70px;align-items:center;gap:14px;padding:13px 18px;background:#fff;border:1px solid ${C.gray200};border-radius:10px;margin-bottom:8px;box-shadow:0 1px 3px rgba(13,45,110,0.04);}
  .drow-name{font-size:13px;font-weight:600;color:${C.gray800};display:flex;align-items:center;gap:7px;}
  .drow-bar{height:7px;background:${C.gray100};border-radius:4px;overflow:hidden;}
  .drow-fill{height:100%;border-radius:4px;}
  .drow-sc{font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;text-align:right;}
  .gcard{background:#fff;border:1px solid ${C.gray200};border-left:4px solid ${C.red};border-radius:10px;padding:16px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start;gap:18px;box-shadow:0 1px 3px rgba(13,45,110,0.04);}
  .gid{display:inline-block;font-size:11px;font-family:'Montserrat',sans-serif;font-weight:700;color:${C.red};background:${C.redLt};padding:2px 8px;border-radius:5px;margin-bottom:5px;}
  .gtitle{font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;color:${C.navy};}
  .gdom{font-size:12px;color:${C.gray400};margin-top:2px;}
  .gfw{font-size:11px;color:${C.gray400};font-style:italic;text-align:right;max-width:210px;line-height:1.5;flex-shrink:0;}

  .footer{background:${C.navyDk};color:rgba(255,255,255,0.38);text-align:center;font-size:12px;padding:20px;border-top:1px solid rgba(255,255,255,0.07);}
  .footer a{color:${C.accent};text-decoration:none;}
`;

export default function App() {
  const [orgType, setOrgType] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [view, setView] = useState("setup");
  const [activeDomain, setActiveDomain] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);

  const filteredQs = useMemo(() => orgType ? QUESTIONS.filter(q => q.types.includes(orgType)) : [], [orgType]);
  const activeDomains = useMemo(() => DOMAINS.filter(d => filteredQs.some(q => q.domain === d)), [filteredQs]);
  const dqs = (d) => filteredQs.filter(q => q.domain === d);

  const score = useMemo(() => {
    const total = filteredQs.length;
    const yes = filteredQs.filter(q => answers[q.id] === "yes").length;
    const no = filteredQs.filter(q => answers[q.id] === "no").length;
    const answered = yes + no;
    return { total, yes, no, answered, pct: answered ? Math.round((yes / answered) * 100) : 0 };
  }, [filteredQs, answers]);

  const ds = (d) => {
    const qs = dqs(d);
    const yes = qs.filter(q => answers[q.id] === "yes").length;
    const ans = qs.filter(q => answers[q.id] === "yes" || answers[q.id] === "no").length;
    return { yes, ans, total: qs.length };
  };

  const setAns = (id, v) => setAnswers(p => ({ ...p, [id]: v }));
  const currentQs = activeDomain ? dqs(activeDomain) : [];
  const scoreColor = (p) => p >= 80 ? C.green : p >= 50 ? C.yellow : C.red;

  return (
    <>
      <style>{css}</style>
      <div>
        {/* NAV */}
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-logo">ADI</div>
            <div>
              <div className="nav-co">ADI Infocon LLC</div>
              <div className="nav-tag">Cloud · AI · Cybersecurity</div>
            </div>
          </div>
          <div className="nav-pill">AI Security Assessment</div>
        </nav>

        {/* SETUP */}
        {view === "setup" && (
          <>
            <div className="hero">
              <div className="hero-chip">🤖 AI Security</div>
              <h1 className="hero-h1">Evaluate Your <em>AI Security Posture</em></h1>
              <p className="hero-p">A structured assessment tool to understand and strengthen your organization's AI compliance and security practices.</p>
              <div className="hero-fws">
                {["NIST AI RMF", "ISO 42001", "EU AI Act"].map(f => <span key={f} className="hero-fw">{f}</span>)}
              </div>
            </div>
            <div className="setup-wrap">
              <div className="setup-label">Select your organization profile</div>
              {[
                { type: 1, icon: "💼", label: "Type 1 — Using AI", desc: "Your organization uses AI software products or software built with AI. Covers foundational AI security controls." },
                { type: 2, icon: "⚙️", label: "Type 2 — Building with AI", desc: "You provide AI-powered products and services. Evaluates supply chain, model training, drift monitoring, and more." },
                { type: 3, icon: "🧠", label: "Type 3 — Developing AI", desc: "You develop and train AI models. Full deep-dive including ethics governance, access controls, and risk classification." },
              ].map(({ type, icon, label, desc }) => (
                <div key={type} className={`type-card ${orgType === type ? "sel" : ""}`} onClick={() => setOrgType(type)}>
                  <div className="type-icon">{icon}</div>
                  <div>
                    <div className="type-name">{label}</div>
                    <div className="type-desc">{desc}</div>
                  </div>
                  <div className="type-count">{QUESTIONS.filter(q => q.types.includes(type)).length}</div>
                </div>
              ))}
              <button className="btn-start" disabled={!orgType} onClick={() => { setActiveDomain(activeDomains[0]); setView("assessment"); }}>
                Begin Assessment →
              </button>
            </div>
          </>
        )}

        {/* ASSESSMENT */}
        {view === "assessment" && (
          <div className="layout">
            <div className="sidebar">
              <div className="sb-head">
                <div className="sb-prog-lbl">Overall Progress</div>
                <div className="sb-bar"><div className="sb-fill" style={{ width: `${score.total ? (score.answered / score.total) * 100 : 0}%` }} /></div>
                <div className="sb-stat">{score.answered}/{score.total} answered · <strong>{score.yes} compliant</strong></div>
              </div>
              <div className="sb-list">
                {activeDomains.map(d => {
                  const meta = DOMAIN_META[d] || { icon: "📋", color: C.navyLt };
                  const s = ds(d);
                  return (
                    <div key={d} className={`sb-item ${activeDomain === d ? "act" : ""}`} onClick={() => setActiveDomain(d)}>
                      <div className="sb-item-top">
                        <span>{meta.icon}</span>
                        <span className="sb-item-name">{d}</span>
                      </div>
                      <div className="sb-track"><div className="sb-track-fill" style={{ width: `${s.total ? (s.yes / s.total) * 100 : 0}%`, background: meta.color }} /></div>
                      <div className="sb-item-ct">{s.ans}/{s.total}</div>
                    </div>
                  );
                })}
              </div>
              <div className="sb-foot">
                <button className="btn-res" onClick={() => setView("results")}>View Results →</button>
                <button className="btn-rst" onClick={() => { setView("setup"); setOrgType(null); setAnswers({}); setNotes({}); }}>← Restart</button>
              </div>
            </div>

            <div className="main">
              {activeDomain && (() => {
                const meta = DOMAIN_META[activeDomain] || { icon: "📋", color: C.navyLt };
                const idx = activeDomains.indexOf(activeDomain);
                return (
                  <>
                    <div className="dom-hd">
                      <div className="dom-hd-top">
                        <div className="dom-icon" style={{ background: meta.color + "18" }}>{meta.icon}</div>
                        <div className="dom-title">{activeDomain}</div>
                      </div>
                      <div className="dom-sub">{currentQs.length} questions · {ds(activeDomain).ans} answered</div>
                    </div>

                    {currentQs.map(q => {
                      const ans = answers[q.id];
                      return (
                        <div key={q.id} className={`qcard ${ans === "yes" ? "y" : ans === "no" ? "n" : ans === "na" ? "na" : ""}`}>
                          <div className="qbody">
                            <div className="qid">{q.id}</div>
                            <div className="qtitle">{q.title}</div>
                            <div className="qtext">{q.content}</div>
                            {q.frameworks && <div className="qfw">📎 {q.frameworks}</div>}
                            <div className="qbtns">
                              <button className={`byn ${ans === "yes" ? "ay" : ""}`} onClick={() => setAns(q.id, "yes")}>✓ Yes</button>
                              <button className={`byn bnn ${ans === "no" ? "an" : ""}`} onClick={() => setAns(q.id, "no")}>✗ No</button>
                              <button className={`byn bna ${ans === "na" ? "ana" : ""}`} onClick={() => setAns(q.id, "na")}>N/A</button>
                              <button className="bnote" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                                {expandedQ === q.id ? "Hide note" : "＋ Note"}
                              </button>
                            </div>
                            {expandedQ === q.id && (
                              <div className="qnote">
                                <textarea value={notes[q.id] || ""} onChange={e => setNotes(p => ({ ...p, [q.id]: e.target.value }))} placeholder="Add context, evidence, or notes for this answer..." />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="qnav">
                      <button className="bnav bprev" disabled={idx === 0} onClick={() => setActiveDomain(activeDomains[idx - 1])}>← Previous</button>
                      {idx < activeDomains.length - 1
                        ? <button className="bnav bnext" onClick={() => setActiveDomain(activeDomains[idx + 1])}>Next Domain →</button>
                        : <button className="bnav bfin" onClick={() => setView("results")}>View Results →</button>
                      }
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {view === "results" && (() => {
          const gaps = filteredQs.filter(q => answers[q.id] === "no");
          const unanswered = filteredQs.filter(q => !answers[q.id]);
          return (
            <>
              <div className="rhero">
                <div className="rhero-top">
                  <div>
                    <div className="rh1">AI Security Assessment Report</div>
                    <div className="rh2">ADI Infocon LLC · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <button className="rbk" onClick={() => setView("assessment")}>← Back to Assessment</button>
                </div>
                <div className="rstats">
                  {[
                    { label: "Compliance Score", val: `${score.pct}%`, color: scoreColor(score.pct) },
                    { label: "Compliant Controls", val: score.yes, color: C.green },
                    { label: "Gaps Identified", val: score.no, color: "#f87171" },
                    { label: "Not Answered", val: unanswered.length, color: "rgba(255,255,255,0.45)" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="rstat">
                      <div className="rstat-v" style={{ color }}>{val}</div>
                      <div className="rstat-l">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rbody">
                <div className="rsect" style={{ marginBottom: 16 }}>Domain Breakdown</div>
                <div style={{ marginBottom: 44 }}>
                  {activeDomains.map(d => {
                    const meta = DOMAIN_META[d] || { icon: "📋", color: C.navyLt };
                    const s = ds(d);
                    const pct = s.ans ? Math.round((s.yes / s.ans) * 100) : 0;
                    return (
                      <div key={d} className="drow">
                        <div className="drow-name"><span>{meta.icon}</span>{d}</div>
                        <div className="drow-bar"><div className="drow-fill" style={{ width: `${pct}%`, background: meta.color }} /></div>
                        <div className="drow-sc" style={{ color: meta.color }}>{s.yes}/{s.ans}</div>
                      </div>
                    );
                  })}
                </div>

                {gaps.length > 0 && (
                  <>
                    <div className="rsect">Identified Gaps ({gaps.length})</div>
                    {gaps.map(q => (
                      <div key={q.id} className="gcard">
                        <div>
                          <div className="gid">{q.id}</div>
                          <div className="gtitle">{q.title}</div>
                          <div className="gdom">{q.domain}</div>
                          {notes[q.id] && <div style={{ fontSize: 12, color: C.gray600, marginTop: 5, fontStyle: "italic" }}>Note: {notes[q.id]}</div>}
                        </div>
                        {q.frameworks && <div className="gfw">{q.frameworks}</div>}
                      </div>
                    ))}
                  </>
                )}

                {gaps.length === 0 && score.answered > 0 && (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 8 }}>No Gaps Identified</div>
                    <div style={{ color: C.gray400, fontSize: 14 }}>All answered controls are compliant.</div>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        <div className="footer">
          © 2025 <a href="https://adiinfocon.com" target="_blank" rel="noreferrer">ADI Infocon LLC</a> · Cloud Computing · AI · Cybersecurity · Aldie, VA
        </div>
      </div>
    </>
  );
}

