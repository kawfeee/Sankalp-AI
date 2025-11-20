import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Hard Coded Value, but should be fetched from the form 
const summaryType = "Descriptive"; // can be of Two types : "Descriptive Summary" or "Point-Wise summary"
const summaryLength = "100 Words"; // can be of Two types : "N words" or "N Points"

// Hard Coded Value, but should be fetched from the Database
const extractedText = `
Research Proposal
 Section-1. Overview of the Project
 1.1 Proposal Submitted for Programme Areas under TDP
 Technology Development Programme (TDP) – Advanced Materials for Mining Safety, Gas-Sensing
 Technologies, and Hazard Mitigation Systems.
 1.2 Project Title
 Electrostatic Deposition and Functionalization of MWCNTs for Selective Detection of CMM
 1.3 Thrust Area
 Nanomaterial-based methane detection, electrostatic material processing, advanced mining safety
 instrumentation, and sustainable methane hazard monitoring.
 1.4 Category
 Applied R&D in Advanced Materials, Gas Sensors, and Mining Safety Devices.
 1.5 TRL (at present)
 TRL 3 – Proof-of-concept demonstrated under controlled laboratory conditions.
 1.6 Total Cost
 ₹ 78.50 Lakhs (Estimated inclusive of manpower, equipment, testing, and operational expenses).
 1.7 Project Duration
 24 Months (Two Years).
 1.8 Relevance to Sector / Ministry / Mission
 Coal Mine Methane (CMM) emissions remain a major operational challenge across Indian underground
 mines. Methane leakages are responsible for catastrophic explosions, loss of lives, shutdown of operations,
 and major economic impact. This project directly aligns with the goals of the Ministry of Coal, the Mine
 Safety Directorate, and the national initiative on Methane Mitigation and Utilization. By developing highly
 selective and sensitive methane sensors using functionalized MWCNTs processed through electrostatic
 deposition, the project enhances India’s capacity for real-time gas hazard detection. It supports CMPDI’s
 mandate for innovation-driven safety solutions and contributes to the broader mission of reducing
 methane emissions under climate and environmental sustainability commitments.
 1
1.9 Lead Investigators
 Dr. R. Sharma, Principal Investigator, Amity Institute for Advanced Research & Studies (Materials & Devices),
 Noida. Expert in nanomaterials, gas sensing, and electrostatic deposition. Mr. S. Kumar, Co-Investigator,
 BCCL R&D Division, Dhanbad. Specializes in underground mine gas monitoring and field instrumentation.
 1.10 Details of Collaborating Institutes and Industry
 Amity Institute will lead nanomaterial synthesis, electrostatic deposition, functionalization, and sensor
 fabrication. BCCL Dhanbad will provide controlled mining test facilities, methane exposure chambers,
 sensor calibration platforms, and underground validation support. The partnership ensures academic
material excellence and real-world mining integration.
 Section-2. Forwarding Letters
 2.1 Certificate from Investigator
 I certify that the information provided in this proposal is accurate. The project will be executed following all
 research ethics, safety standards, and quality protocols. All required facilities and expertise are available for
 its successful completion.
 2.2 Endorsement from Head of Organisation
 The organisation endorses this project proposal and confirms full administrative, laboratory, and
 infrastructural support. The research aligns with institutional R&D goals and national mining safety
 priorities.
 2.3 Undertaking from Collaborating Industries / Agencies
 BCCL agrees to collaborate in real-time testing, provide methane testing environments, enable
 underground trials, and support deployment and validation activities.
 2.4 Conflict of Interest
 There are no conflicts of interest, financial or personal, associated with the conduct of this project.
 Section-3. Relevance of Proposed Project
 3.1 Current Status of the Technology
 Current methane detection technologies deployed in underground mines rely heavily on catalytic
 combustion sensors, infrared optical sensors, and metal-oxide semiconductors. These systems, although
 proven, face major limitations including low sensitivity to sub-ppm methane levels, slow response time,
 susceptibility to poisoning, high power consumption, and cross-interference from gases like CO₂, CO, and
 2
H₂S. Nanomaterial-based sensing platforms, especially those using multiwall carbon nanotubes (MWCNTs),
 have demonstrated significant promise due to high surface-to-volume ratios, tunable electronic properties,
 and functionalization feasibility. Electrostatic deposition is emerging as a superior technique for achieving
 uniform nanotube coatings with controlled orientation and density. However, integration of functionalized
 MWCNTs with field-ready methane sensor modules is still at a nascent stage, with no indigenous systems
 fully developed for Indian mines. Existing studies are mostly academic with limited field validation.
 3.2 Significance of the Project
 This project directly addresses methane-induced hazards in underground coal mines by developing an
 advanced sensing platform capable of selective, sensitive (>100 ppm), and low-power detection.
 Functionalized MWCNTs combined with electrostatic deposition promise a breakthrough in sensor response
 time, selectivity, durability, and operational stability in harsh mining conditions. The sensor will support
 early-warning systems, reduce explosion risks, improve productivity, and support methane capture
 initiatives. Indigenous development of this technology will reduce dependence on imported sensors,
 fostering self-reliance under Atmanirbhar Bharat. The project further contributes to environmental
 commitments related to methane emission reduction, making mining safer and sustainable.
 Section-4. Project Work Summary
 4.1 Detailed Objectives
 The project aims to design, develop, and validate a highly selective methane sensing system based on
 functionalized MWCNTs. Detailed objectives include: - Develop electrostatic deposition parameters for
 uniform MWCNT layer formation on sensor substrates. - Functionalize MWCNTs with Pd, SnO₂, and
 polymeric groups to enhance methane adsorption and electron transfer. - Perform complete
 physicochemical characterization using SEM, TEM, BET, Raman, FTIR, and XRD. - Fabricate a sensor module
 using interdigitated electrodes, microcontroller interface, and wireless data acquisition. - Benchmark sensor
 performance in controlled laboratory conditions. - Validate sensor performance in BCCL underground
 testing facilities. - Prepare guidelines for commercial-scale prototype deployment.
 4.2 Technical Details
 The project integrates nanomaterials engineering, device fabrication, and real-world testing. MWCNTs will
 undergo purification, acid oxidation, and functionalization using chemical and physical routes. Electrostatic
 deposition equipment will be optimized for controlled charging and deposition cycles to achieve nano
uniform coatings. Gas-sensing experiments will rely on resistance modulation principles measured through
 precision source meters. Calibration will be conducted across a concentration range of 50–5000 ppm
 methane. Sensor packaging will ensure protection against humidity and dust. Software algorithms will
 interpret resistance change patterns to enhance accuracy. Field validation will involve methane exposure
 tunnels at BCCL, ensuring robustness against cross-gases.
 4.3 Project Work Plan
 Months 1–4: Setup, procurement, purification of MWCNTs, preliminary deposition trials.
 Months 5–10: Functionalization, material characterization, deposition optimization.
 3
Months 11–15: Sensor fabrication, PCB design, microcontroller integration.
 Months 16–20: Laboratory calibration, selectivity and sensitivity benchmarking.
 Months 21–24: Field testing at BCCL mines, data logging, optimization, final reporting.
 Section-5. Budget Summary (₹ Lakhs)
 5.1 Consolidated Budget
 • 
• 
• 
• 
• 
• 
Manpower: 18.0 
Consumables: 12.5 
Equipment: 32.0 
Travel: 2.0 
Contingencies: 4.0 
Outsourcing/Testing/Patenting: 10.0
 Total: 78.50 Lakhs
 5.2 Budget – Multi-Institutional Project
 • 
• 
Amity Institute (60%): 47.10 Lakhs 
BCCL (40%): 31.40 Lakhs
 Section-6. Itemised Budget
 6.1 Manpower
 Two JRFs (24 months), one technician (18 months), and partial PI involvement.
 6.2 Consumables
 MWCNTs, acids, metal salts, solvents, electrodes, PCBs, microcontrollers, calibration gases.
 6.3 Contingencies
 Minor repairs, chemical replenishment, unforeseen experiments.
 6.4 Other Costs
 Outsourcing for SEM/TEM, testing chamber rental, fabrication charges, patent filing.
 6.5 Domestic Travel
 Travel for coordination, field validation visits to Dhanbad.
 4
6.6 Equipment Proposed
 Electrostatic deposition system, gas exposure chamber, source meters, Raman spectroscopy attachments.
 6.7 Existing Equipment Available
 SEM, FTIR, ultrasonicators, furnaces, Raman spectrometer at Amity Institute.
 Section-7. Annexure: Justification for Itemized Budget
 7.1 Consumables
 Chemicals and deposition materials are essential for repeat trials.
 7.2 Contingency & Travel
 Ensures timely coordination and uninterrupted workflow.
 7.3 Other Costs
 Covers characterization outsourcing and intellectual property filings.
 7.4 Permanent Equipment
 Required for long-term methane sensor research.
 Section-8. Biodata of Investigators
 Detailed biodata including qualifications, publications, patents, and experience will be appended as
 Annexure-1.
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// PROMPT
const prompt = `
  You are an expert Technical content writer from Ministry of Coal, Your task is to write summaries for the given R&D Proposals.

  Analyse the following proposal 

  PROPOSAL TEXT:
  ${extractedText}

  Your task is to now write a ${summaryType} summary which is in ${summaryLength}

  Return ONLY a valid JSON object (no markdown, no extra text)
  if the summary type is Descriptive , then return this format JSON
  {
    summary : "string"  
  }

  if the summary type is Point-Wise summary, then return this format JSON
  {
    summary : ["Point 1", "Point 2", ....]
  }
`;

async function finance_Score() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);

  // CORRECT way to extract text
  const resultText = result.response.text().trim();

  // Extract JSON using regex
  const jsonMatch = resultText.match(/\{[\s\S]*\}/);

  const jsonData = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : (() => { throw new Error("No valid JSON found in model response"); })();

  console.log("Generating Summary .......");
  console.log(JSON.stringify(jsonData, null, 2));
}

finance_Score();
