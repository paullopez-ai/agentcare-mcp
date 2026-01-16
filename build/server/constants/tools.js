export const TOOL_DEFINITIONS = [
    {
        name: "find_patient",
        description: "Search for a patient by demographics",
        inputSchema: {
            type: "object",
            properties: {
                lastName: { type: "string" },
                firstName: { type: "string" },
                birthDate: { type: "string", description: "YYYY-MM-DD format" },
                gender: {
                    type: "string",
                    enum: ["male", "female", "other", "unknown"]
                }
            },
            required: ["lastName"]
        }
    },
    {
        name: "get_patient_observations",
        description: "Get observations (vitals, labs) for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                code: { type: "string", description: "LOINC or SNOMED code" },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" },
                status: {
                    type: "string",
                    enum: ["registered", "preliminary", "final", "amended", "corrected", "cancelled"]
                }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_patient_conditions",
        description: "Get medical conditions/diagnoses for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["active", "inactive", "resolved"]
                },
                onsetDate: { type: "string", description: "YYYY-MM-DD" }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_patient_medications",
        description: "Get medication orders for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["active", "completed", "stopped", "on-hold"]
                }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_patient_encounters",
        description: "Get healthcare encounters/visits for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["planned", "arrived", "in-progress", "finished", "cancelled"]
                },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_patient_allergies",
        description: "Get allergies and intolerances for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["active", "inactive", "resolved"]
                },
                type: {
                    type: "string",
                    enum: ["allergy", "intolerance"]
                },
                category: {
                    type: "string",
                    enum: ["food", "medication", "environment", "biologic"]
                }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_patient_procedures",
        description: "Get procedures performed on a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["preparation", "in-progress", "completed", "entered-in-error"]
                },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_patient_careplans",
        description: "Get care plans for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["draft", "active", "suspended", "completed", "cancelled"]
                },
                category: { type: "string" },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_vital_signs",
        description: "Get patient's vital signs history",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                timeframe: {
                    type: "string",
                    description: "e.g., 3m, 6m, 1y, all"
                }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_lab_results",
        description: "Get patient's lab results",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                category: {
                    type: "string",
                    description: "e.g., CBC, METABOLIC, LIPIDS, ALL"
                },
                timeframe: { type: "string" }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_medications_history",
        description: "Get patient's medication history including changes",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                includeDiscontinued: { type: "boolean" }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_appointments",
        description: "Get patient's Appointments",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" }
            },
            required: ["patientId"]
        }
    },
    {
        name: 'search-pubmed',
        description: 'Search PubMed for medical literature',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                maxResults: { type: 'number' }
            },
            required: ['query']
        }
    },
    {
        name: 'search-trials',
        description: 'Search ClinicalTrials.gov for relevant studies',
        inputSchema: {
            type: 'object',
            properties: {
                condition: { type: 'string' },
                location: { type: 'string' }
            },
            required: ['condition']
        }
    },
    {
        name: 'get-drug-info',
        description: 'Get Drug details by a generic name',
        inputSchema: {
            type: 'object',
            properties: {
                genericName: { type: 'string' },
            },
            required: ['genericName']
        }
    },
    // DocumentReference - Clinical Notes
    {
        name: "get_patient_documents",
        description: "Get clinical documents and notes for a patient (discharge summaries, progress notes, consult notes, etc.)",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                type: {
                    type: "string",
                    description: "Document type code (e.g., 18842-5 for discharge summary, 11506-3 for progress note)"
                },
                category: {
                    type: "string",
                    enum: ["clinical-note", "imaging", "laboratory", "pathology", "procedure", "other"]
                },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" },
                status: {
                    type: "string",
                    enum: ["current", "superseded", "entered-in-error"]
                }
            },
            required: ["patientId"]
        }
    },
    {
        name: "get_document_content",
        description: "Get the actual content/attachment of a specific document by its ID",
        inputSchema: {
            type: "object",
            properties: {
                documentId: { type: "string", description: "DocumentReference resource ID" }
            },
            required: ["documentId"]
        }
    },
    // DiagnosticReport - Lab/Imaging Reports
    {
        name: "get_diagnostic_reports",
        description: "Get diagnostic reports (lab reports, radiology reports, pathology reports) for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                category: {
                    type: "string",
                    enum: ["LAB", "RAD", "PAT", "CUS", "OTH"],
                    description: "LAB=Laboratory, RAD=Radiology, PAT=Pathology, CUS=Cardiology/Ultrasound, OTH=Other"
                },
                code: { type: "string", description: "LOINC code for specific report type" },
                dateFrom: { type: "string", description: "YYYY-MM-DD" },
                dateTo: { type: "string", description: "YYYY-MM-DD" },
                status: {
                    type: "string",
                    enum: ["registered", "partial", "preliminary", "final", "amended", "corrected", "appended", "cancelled", "entered-in-error"]
                }
            },
            required: ["patientId"]
        }
    },
    // Coverage - Insurance Information
    {
        name: "get_patient_coverage",
        description: "Get insurance coverage information for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                status: {
                    type: "string",
                    enum: ["active", "cancelled", "draft", "entered-in-error"]
                }
            },
            required: ["patientId"]
        }
    },
    // Write Operations
    {
        name: "create_observation",
        description: "Create/file a new observation (vital signs, patient-reported data) for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                code: { type: "string", description: "LOINC code for the observation type" },
                codeDisplay: { type: "string", description: "Human-readable name for the observation" },
                value: { type: "number", description: "Numeric value of the observation" },
                unit: { type: "string", description: "Unit of measurement (e.g., kg, mmHg, bpm)" },
                effectiveDateTime: { type: "string", description: "When the observation was made (ISO 8601)" },
                status: {
                    type: "string",
                    enum: ["registered", "preliminary", "final", "amended"],
                    description: "Status of the observation (default: final)"
                },
                category: {
                    type: "string",
                    enum: ["vital-signs", "laboratory", "social-history", "survey"],
                    description: "Category of observation (default: vital-signs)"
                }
            },
            required: ["patientId", "code", "codeDisplay", "value", "unit"]
        }
    },
    {
        name: "create_allergy",
        description: "Create/file a new allergy or intolerance for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                allergenCode: { type: "string", description: "Code for the allergen (RxNorm, SNOMED, or UNII)" },
                allergenDisplay: { type: "string", description: "Human-readable name of the allergen" },
                allergenSystem: {
                    type: "string",
                    enum: ["http://www.nlm.nih.gov/research/umls/rxnorm", "http://snomed.info/sct", "http://fdasis.nlm.nih.gov"],
                    description: "Code system for the allergen"
                },
                type: {
                    type: "string",
                    enum: ["allergy", "intolerance"],
                    description: "Whether this is an allergy or intolerance"
                },
                category: {
                    type: "string",
                    enum: ["food", "medication", "environment", "biologic"]
                },
                criticality: {
                    type: "string",
                    enum: ["low", "high", "unable-to-assess"]
                },
                reactionDescription: { type: "string", description: "Description of the reaction" },
                reactionSeverity: {
                    type: "string",
                    enum: ["mild", "moderate", "severe"]
                }
            },
            required: ["patientId", "allergenCode", "allergenDisplay", "category"]
        }
    },
    {
        name: "create_condition",
        description: "Create/file a new condition or diagnosis for a patient",
        inputSchema: {
            type: "object",
            properties: {
                patientId: { type: "string" },
                code: { type: "string", description: "ICD-10 or SNOMED code for the condition" },
                codeDisplay: { type: "string", description: "Human-readable name of the condition" },
                codeSystem: {
                    type: "string",
                    enum: ["http://hl7.org/fhir/sid/icd-10-cm", "http://snomed.info/sct"],
                    description: "Code system (ICD-10 or SNOMED)"
                },
                clinicalStatus: {
                    type: "string",
                    enum: ["active", "recurrence", "relapse", "inactive", "remission", "resolved"],
                    description: "Clinical status (default: active)"
                },
                verificationStatus: {
                    type: "string",
                    enum: ["unconfirmed", "provisional", "differential", "confirmed", "refuted"],
                    description: "Verification status (default: confirmed)"
                },
                severity: {
                    type: "string",
                    enum: ["mild", "moderate", "severe"]
                },
                onsetDateTime: { type: "string", description: "When the condition started (ISO 8601)" },
                note: { type: "string", description: "Additional notes about the condition" }
            },
            required: ["patientId", "code", "codeDisplay"]
        }
    }
];
