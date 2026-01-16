import axios, { AxiosInstance } from "axios";
import { ResourceType } from "../../types.js";
import {calculateTimeframeDate} from "./Helper.js"

export class FhirClient { 
  private client: AxiosInstance;
  private accessToken!: string;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        //Authorization: `Bearer ${apiKey}`,
        Accept: "application/fhir+json",
        Authorization: `Bearer ${this.accessToken}`
      },
    });
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    this.client.defaults.headers.Authorization = `Bearer ${this.accessToken}`;
  }

  async search(resourceType: string, params = {}) {
    const searchParams = new URLSearchParams(params);
    const response = await this.client.get(`/${resourceType}?${searchParams}`)
    
    return response.data;
  }

  async get(resourceType: string, id: string) {
    const response = await this.client.get(`/${resourceType}/${id}`)
  
    return response.data
  }

  async executeQuery(queryParams: any) {
    const params = this.buildSearchParams(queryParams);
    const response = await this.client.get(`/${queryParams.resourceType}?${params}`);
    return this.formatResults(response.data, queryParams.resourceType);
  }

  async getActiveConditions() {
    const response = await this.client.get('/Condition?clinical-status=active');
    return this.formatResponse("fhir://Condition/active", response.data);
  }

  async findPatient(args: any) {
    const params = new URLSearchParams();
    if (args.lastName) params.append('family', args.lastName);
    if (args.firstName) params.append('given', args.firstName);
    if (args.birthDate) params.append('birthdate', args.birthDate);

    const response = await this.client.get(`/Patient?${params}`);
    
    // Check if we have results
    if (!response.data?.entry?.[0]?.resource) {
        return this.formatResponse("fhir://Patient/search", { message: "No patients found" });
    }

    const resource = response.data.entry[0].resource;
    const name = resource.name?.[0] ?? {};
    const address = resource.address?.[0] ?? {};

    const patient = {
        name: name.given?.[0] ?? 'Unknown',
        familyName: name.family ?? 'Unknown',
        dob: resource.birthDate ?? 'Unknown',
        gender: resource.gender ?? 'Unknown',
        address: address.line?.[0] ?? 'Unknown',
        city: address.city ?? 'Unknown',
        state: address.state ?? 'Unknown',
        zip: address.postalCode ?? 'Unknown',
        id: resource.id ?? 'Unknown'
    };

    return this.formatResponse("fhir://Patient/search", patient);
  }


  handleError(error: any) {
    const errorMessage = axios.isAxiosError(error)
      ? `FHIR API error: ${error.response?.data?.issue?.[0]?.details?.text ?? error.message}`
      : error.message;
    return { content: [{ type: "text", text: errorMessage }], isError: true };
  }

  private buildSearchParams(queryParams: any) {
    const params = new URLSearchParams();
    if (queryParams.codes?.length) params.append('code', queryParams.codes.join(','));
    if (queryParams.dateRange) {
      if (queryParams.dateRange.start) params.append('date', `ge${queryParams.dateRange.start}`);
      if (queryParams.dateRange.end) params.append('date', `le${queryParams.dateRange.end}`);
    }
    return params;
  }

  private formatResults(data: any, resourceType: ResourceType) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  private formatResponse(uri: string, data: any) {
    
    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    }
  }

  async getPatientObservations(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.code) params.append('code', args.code);
    if (args.status) params.append('status', args.status);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/Observation?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/observations`, response.data);
  }

  async getPatientConditions(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.status) params.append('clinical-status', args.status);
    if (args.onsetDate) params.append('onset-date', args.onsetDate);

    const response = await this.client.get(`/Condition?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/conditions`, response.data);
  }

  async getPatientMedications(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.status) params.append('status', args.status);

    const response = await this.client.get(`/MedicationRequest?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/medications`, response.data);
  }

  async getPatientEncounters(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.status) params.append('status', args.status);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/Encounter?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/encounters`, response.data);
  }

  async getPatientAllergies(args: any) {
    const params = new URLSearchParams();
    params.append('patient', args.patientId);
    if (args.status) params.append('clinical-status', args.status);
    if (args.type) params.append('type', args.type);
    if (args.category) params.append('category', args.category);

    const response = await this.client.get(`/AllergyIntolerance?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/allergies`, response.data);
  }

  async getPatientProcedures(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.status) params.append('status', args.status);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/Procedure?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/procedures`, response.data);
  }

  async getPatientCareTeam(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.status) params.append('status', args.status);

    const response = await this.client.get(`/CareTeam?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/careteam`, response.data);
  }

  async getPatientCarePlans(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.status) params.append('status', args.status);
    if (args.category) params.append('category', args.category);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/CarePlan?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/careplans`, response.data);
  }

  async getPatientVitalSigns(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/Observation?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/vital-signs`, response.data);
  }

  async getMedicationHistory(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/MedicationStatement?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/medication-history`, response.data);
  }

  async getPatientLabResults(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/Observation?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/lab-results`, response.data);
  }
  async getPatientAppointments(args: any) {
    const params = new URLSearchParams();
    params.append('patient', `${args.patientId}`);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/Appointment?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/appointments`, response.data);
  }

  async getVitalSigns(patientId: string, timeframe?: string) {
    const parms: Record<string, string> = {
      patient: patientId,
      category: 'vital-signs',
      _sort: '-date',
      _count: '50'
    };
  
    if (timeframe) {
      const date = calculateTimeframeDate(timeframe);
      if (date) {
        parms["date"] = `ge${date}`;
      }
    }  
    return await this.client.get(`/Observation?${parms}`);
  }

  async getPatientSummaryData(patientId: string) {
    const [
      patient,
      conditions,
      medications,
      allergies,
      immunizations,
      procedures,
      carePlans,
      recentLabs,
      encounters,
      appointments
    ] = await Promise.all([
      this.get("Patient", patientId),
      this.search("Condition", { patient: patientId }),
      this.search("MedicationRequest", { patient: patientId}),
      this.search("AllergyIntolerance", { patient: patientId }),
      this.search("Immunization", { patient: patientId }),
      this.search("Procedure", { patient: patientId }),
      this.search("CarePlan", { patient: patientId}),
      this.getPatientLabData(patientId),
      this.search("Encounter", { patient: patientId }),
      this.search("Appointment", { patient: patientId })
    ]);

    return {
      patient,
      conditions,
      medications,
      allergies,
      immunizations,
      procedures,
      carePlans,
      recentLabs,
      encounters,
      appointments
    };
  }
  
  // Additional helper functions for other prompts
  async getPatientConditionData(patientId: string, timeframe?: string) {
    const searchParams: Record<string, string> = { 
      patient: patientId,
      _sort: "date"
    };
    
    if (timeframe) {
      const date = calculateTimeframeDate(timeframe);
      if (date) {
        searchParams["date"] = `ge${date}`;
      }
    }
  
    return await this.search("Condition", searchParams);
  }
  
  async getPatientLabData(patientId: string, labType?: string) {
    const searchParams: Record<string, string> = {
      patient: patientId,
      category: "laboratory",
      _sort: "-date"
    };
  
    if (labType) {
      searchParams["code"] = labType;
    }
  
    return await this.search("Observation", searchParams);
  }
  
  async  getPatientCareGapsData(patientId: string) {
    const [
      patient,
      immunizations,
      procedures,
      carePlans
    ] = await Promise.all([
      this.get("Patient", patientId),
      this.search("Immunization", { patient: patientId }),
      this.search("Procedure", { patient: patientId }),
      this.search("CarePlan", { patient: patientId, status: "active" })
    ]);
  
    return {
      patient,
      immunizations,
      procedures,
      carePlans
    };
  }
    
  getRelevantMetrics(observations: any[], condition: any): string[] {
    // Map conditions to relevant LOINC codes
    const metricMap:any = {
      'Diabetes': ['4548-4', '17856-6'], // HbA1c, Glucose
      'Hypertension': ['8480-6', '8462-4'], // Systolic BP, Diastolic BP
      'Hyperlipidemia': ['2093-3', '2571-8'], // Cholesterol, Triglycerides
    };

    const conditionName = condition.code?.coding?.[0]?.display || '';
    const relevantCodes = metricMap[conditionName] || [];

    return observations
      .filter((obs: any) => {
        const obsCode = obs.resource.code?.coding?.[0]?.code;
        return relevantCodes.includes(obsCode);
      })
      .map((obs: any) => {
        const value = obs.resource.valueQuantity?.value || 'No value';
        const unit = obs.resource.valueQuantity?.unit || '';
        const date = obs.resource.effectiveDateTime?.split('T')[0] || 'unknown date';
        const name = obs.resource.code?.coding?.[0]?.display || 'Unknown metric';
        return `${name}: ${value} ${unit} (${date})`;
      });
  }

  // DocumentReference - Clinical Notes
  async getPatientDocuments(args: any) {
    const params = new URLSearchParams();
    params.append('patient', args.patientId);
    if (args.type) params.append('type', args.type);
    if (args.category) params.append('category', args.category);
    if (args.status) params.append('status', args.status);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/DocumentReference?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/documents`, response.data);
  }

  async getDocumentContent(args: any) {
    const response = await this.client.get(`/DocumentReference/${args.documentId}`);
    const document = response.data;

    // If there's a Binary attachment, fetch it
    if (document.content?.[0]?.attachment?.url) {
      const binaryUrl = document.content[0].attachment.url;
      // Handle relative vs absolute URLs
      if (binaryUrl.startsWith('Binary/')) {
        const binaryResponse = await this.client.get(`/${binaryUrl}`);
        return this.formatResponse(`fhir://DocumentReference/${args.documentId}/content`, {
          document,
          binaryContent: binaryResponse.data
        });
      }
    }

    return this.formatResponse(`fhir://DocumentReference/${args.documentId}`, document);
  }

  // DiagnosticReport - Lab/Imaging Reports
  async getDiagnosticReports(args: any) {
    const params = new URLSearchParams();
    params.append('patient', args.patientId);
    if (args.category) params.append('category', args.category);
    if (args.code) params.append('code', args.code);
    if (args.status) params.append('status', args.status);
    if (args.dateFrom) params.append('date', `ge${args.dateFrom}`);
    if (args.dateTo) params.append('date', `le${args.dateTo}`);

    const response = await this.client.get(`/DiagnosticReport?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/diagnostic-reports`, response.data);
  }

  // Coverage - Insurance Information
  async getPatientCoverage(args: any) {
    const params = new URLSearchParams();
    params.append('patient', args.patientId);
    if (args.status) params.append('status', args.status);

    const response = await this.client.get(`/Coverage?${params}`);
    return this.formatResponse(`fhir://Patient/${args.patientId}/coverage`, response.data);
  }

  // Write Operations
  async createObservation(args: any) {
    const observation = {
      resourceType: "Observation",
      status: args.status || "final",
      category: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/observation-category",
          code: args.category || "vital-signs",
          display: args.category || "Vital Signs"
        }]
      }],
      code: {
        coding: [{
          system: "http://loinc.org",
          code: args.code,
          display: args.codeDisplay
        }]
      },
      subject: {
        reference: `Patient/${args.patientId}`
      },
      effectiveDateTime: args.effectiveDateTime || new Date().toISOString(),
      valueQuantity: {
        value: args.value,
        unit: args.unit,
        system: "http://unitsofmeasure.org",
        code: args.unit
      }
    };

    const response = await this.client.post('/Observation', observation);
    return this.formatResponse(`fhir://Observation/created`, {
      message: "Observation created successfully",
      resourceId: response.data.id,
      resource: response.data
    });
  }

  async createAllergy(args: any) {
    const allergyIntolerance = {
      resourceType: "AllergyIntolerance",
      clinicalStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
          code: "active",
          display: "Active"
        }]
      },
      verificationStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
          code: "confirmed",
          display: "Confirmed"
        }]
      },
      type: args.type || "allergy",
      category: [args.category],
      criticality: args.criticality,
      code: {
        coding: [{
          system: args.allergenSystem || "http://snomed.info/sct",
          code: args.allergenCode,
          display: args.allergenDisplay
        }]
      },
      patient: {
        reference: `Patient/${args.patientId}`
      },
      recordedDate: new Date().toISOString(),
      ...(args.reactionDescription && {
        reaction: [{
          description: args.reactionDescription,
          severity: args.reactionSeverity
        }]
      })
    };

    const response = await this.client.post('/AllergyIntolerance', allergyIntolerance);
    return this.formatResponse(`fhir://AllergyIntolerance/created`, {
      message: "Allergy created successfully",
      resourceId: response.data.id,
      resource: response.data
    });
  }

  async createCondition(args: any) {
    const condition = {
      resourceType: "Condition",
      clinicalStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: args.clinicalStatus || "active",
          display: args.clinicalStatus || "Active"
        }]
      },
      verificationStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: args.verificationStatus || "confirmed",
          display: args.verificationStatus || "Confirmed"
        }]
      },
      ...(args.severity && {
        severity: {
          coding: [{
            system: "http://snomed.info/sct",
            code: args.severity === "mild" ? "255604002" : args.severity === "moderate" ? "6736007" : "24484000",
            display: args.severity.charAt(0).toUpperCase() + args.severity.slice(1)
          }]
        }
      }),
      code: {
        coding: [{
          system: args.codeSystem || "http://snomed.info/sct",
          code: args.code,
          display: args.codeDisplay
        }]
      },
      subject: {
        reference: `Patient/${args.patientId}`
      },
      onsetDateTime: args.onsetDateTime,
      recordedDate: new Date().toISOString(),
      ...(args.note && {
        note: [{
          text: args.note
        }]
      })
    };

    const response = await this.client.post('/Condition', condition);
    return this.formatResponse(`fhir://Condition/created`, {
      message: "Condition created successfully",
      resourceId: response.data.id,
      resource: response.data
    });
  }

}

