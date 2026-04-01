const { createApp } = Vue;

const API_BASE = "https://riverside-api.onrender.com";
// const API_BASE = "http://localhost:3000";

const app = createApp({
  data() {
    return {
      currentPage: "landing",
      pendingFormPage: null,

      activeIndex: 3,
      categories: [
        { key: "home", title: "Home Insurance", sub: "Protect your home and belongings", formPage: "homeForm", imageUrl: "/home.avif" },
        { key: "auto", title: "Auto Insurance", sub: "Coverage for your vehicle", formPage: "autoForm", imageUrl: "/auto.jpg" },
        { key: "generalLiability", title: "General Liability", sub: "Protect your business assets", formPage: "generalForm", imageUrl: "/general.jpg" },
        { key: "workers", title: "Workers Comp", sub: "Protect your employees", formPage: "workersCompForm", imageUrl: "/workers.jpg" },
        { key: "inlandMarine", title: "Inland Marine", sub: "Coverage for equipment, builders risk and new constructions", formPage: "inlandForm", imageUrl: "/inland.avif" },
        { key: "life", title: "Life Insurance", sub: "Coverage for your family", formPage: "lifeForm", imageUrl: "/life.jpg" },
        { key: "other", title: "Other Insurance", sub: "Coverage for motorcycle, boat, umbrella, etc.", formPage: "otherForm", imageUrl: "/other.avif" },
      ],

      // client auth
      isClientLoggedIn: false,
      isClientSignup: false,
      clientAuth: {
        fullName: "",
        email: "",
        password: "",
        phone: "",
      },

      // agent auth
      isAgentLoggedIn: false,
      isAgentSignup: false,
      agentAuth: {
        fullName: "",
        email: "",
        password: "",
        licenseNumber: "",
      },

      // quotes
      quoteRequests: [],
      selectedQuoteId: null,
      seenQuotes: JSON.parse(localStorage.getItem("seenQuotes") || "[]"),

      // agent edit box data by quote id
      littleRateBox: {},

      // file picker stuff
      studentFilesByForm: {
        homeForm: [],
        autoForm: [],
        generalForm: [],
        workersCompForm: [],
        inlandForm: [],
        lifeForm: [],
        otherForm: [],
      },

      // HOME
      homeForm: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        propertyType: "",
        sqft: "",
        yearBuilt: "",
        roofType: "",
      },

      // AUTO
      autoForm: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        make: "",
        model: "",
        year: "",
        vin: "",
        driversLicense: "",
      },

      // GENERAL LIABILITY
      generalForm: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        businessName: "",
        businessAddress: "",
        businessType: "",
        numberOfEmployees: "",
        annualRevenue: "",
        startYear: "",
        payroll: "",
        additionalCoverage: "",
      },

      // WORKERS COMP
      workersCompForm: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        businessName: "",
        businessAddress: "",
        businessType: "",
        FEIN: "",
        annualRevenue: "",
        startYear: "",
        payroll: "",
      },

      // INLAND
      inlandForm: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        ownerOrContractor: "",
        businessName: "",
        businessAddress: "",
        businessType: "",
        equipmentType: "",
        equipmentMake: "",
        equipmentModel: "",
        serialNumber: "",
        equipmentValue: "",
        descriptionOfOperation: "",
        estimatedCompletionDate: "",
      },

      // LIFE
      lifeForm: {
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        smokerStatus: "",
        annualIncome: "",
        medicalHistory: "",
        beneficiaryNames: "",
      },

      // OTHER
      otherForm: {
        fullName: "",
        email: "",
        phone: "",
        coverageDetails: "",
      },
    };
  },

  methods: {
    async goTo(page) {
      this.currentPage = page;

      if (page === "clientDashboard") {
        await this.loadClientQuotes();
      }

      if (page === "agentDashboard") {
        await this.loadQuotes();
      }
    },

    prefillForms() {
      if (!this.isClientLoggedIn) return;

      const { fullName, email, phone } = this.clientAuth;
      const forms = [
        "homeForm",
        "autoForm",
        "generalForm",
        "workersCompForm",
        "inlandForm",
        "lifeForm",
        "otherForm",
      ];

      forms.forEach((formName) => {
        if (this[formName]?.fullName !== undefined) this[formName].fullName = fullName || "";
        if (this[formName]?.email !== undefined) this[formName].email = email || "";
        if (this[formName]?.phone !== undefined) this[formName].phone = phone || "";
      });
    },

    requestQuote(formPage) {
      if (!this.isClientLoggedIn) {
        this.pendingFormPage = formPage;
        this.goTo("clientLogin");
      } else {
        this.prefillForms();
        this.goTo(formPage);
      }
    },

    async handleClientAuth() {
      try {
        const endpoint = this.isClientSignup
          ? `${API_BASE}/auth/client/signup`
          : `${API_BASE}/auth/client/login`;

        const body = this.isClientSignup
          ? {
              fullName: this.clientAuth.fullName,
              email: this.clientAuth.email,
              password: this.clientAuth.password,
              phone: this.clientAuth.phone,
            }
          : {
              email: this.clientAuth.email,
              password: this.clientAuth.password,
            };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Client auth failed:", res.status, text);
          alert("Client login/signup failed.");
          return;
        }

        const data = await res.json();

        localStorage.setItem("client_token", data.token);

        this.isClientLoggedIn = true;
        this.clientAuth.fullName = data.client.full_name;
        this.clientAuth.email = data.client.email;
        this.clientAuth.phone = data.client.phone || "";
        this.clientAuth.password = "";

        alert(this.isClientSignup ? "Client account created!" : "Client logged in!");
        this.isClientSignup = false;

        if (this.pendingFormPage) {
          const nextPage = this.pendingFormPage;
          this.pendingFormPage = null;
          this.prefillForms();
          this.goTo(nextPage);
        } else {
          this.goTo("clientDashboard");
        }
      } catch (err) {
        console.error("Client auth error:", err);
        alert("Client login/signup error.");
      }
    },

    async handleAgentAuth() {
      try {
        const endpoint = this.isAgentSignup
          ? `${API_BASE}/auth/agent/signup`
          : `${API_BASE}/auth/agent/login`;

        const body = this.isAgentSignup
          ? {
              fullName: this.agentAuth.fullName,
              email: this.agentAuth.email,
              password: this.agentAuth.password,
              licenseNumber: this.agentAuth.licenseNumber,
            }
          : {
              email: this.agentAuth.email,
              password: this.agentAuth.password,
            };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Agent auth failed:", res.status, text);
          alert("Agent login/signup failed.");
          return;
        }

        const data = await res.json();

        localStorage.setItem("agent_token", data.token);

        this.isAgentLoggedIn = true;
        this.agentAuth.fullName = data.agent.full_name;
        this.agentAuth.email = data.agent.email;
        this.agentAuth.licenseNumber = data.agent.license_number || "";
        this.agentAuth.password = "";

        alert(this.isAgentSignup ? "Agent account created!" : "Agent logged in!");
        this.isAgentSignup = false;
        this.goTo("agentDashboard");
      } catch (err) {
        console.error("Agent auth error:", err);
        alert("Agent login/signup error.");
      }
    },

    logout() {
      this.isClientLoggedIn = false;
      this.isAgentLoggedIn = false;
      this.isClientSignup = false;
      this.isAgentSignup = false;

      localStorage.removeItem("client_token");
      localStorage.removeItem("agent_token");
      localStorage.removeItem("client_email");

      this.clientAuth = {
        fullName: "",
        email: "",
        password: "",
        phone: "",
      };

      this.agentAuth = {
        fullName: "",
        email: "",
        password: "",
        licenseNumber: "",
      };

      this.goTo("landing");
      alert("Logged out successfully!");
    },

    carouselNext() {
      const slide = this.$refs.carouselSlide;
      if (!slide || !slide.children.length) return;
      slide.appendChild(slide.children[0]);
    },

    carouselPrev() {
      const slide = this.$refs.carouselSlide;
      if (!slide || !slide.children.length) return;
      slide.prepend(slide.children[slide.children.length - 1]);
    },

    // -----------------------------
    // FILE HELPERS
    // -----------------------------
    savePickedFiles(event, formName) {
      const picked = Array.from(event.target.files || []);
      this.studentFilesByForm[formName] = picked;
    },

    async uploadMyFiles(formName) {
      const pickedFiles = this.studentFilesByForm[formName] || [];

      if (!pickedFiles.length) return [];

      const formData = new FormData();
      pickedFiles.forEach((file) => {
        formData.append("files", file);
      });

      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Upload failed:", res.status, text);
          alert("File upload failed.");
          return [];
        }

        const data = await res.json();
        return data.files || [];
      } catch (err) {
        console.error("Upload error:", err);
        alert("File upload error.");
        return [];
      }
    },

    getNiceFileName(fileThing) {
      if (!fileThing) return "";

      if (typeof fileThing === "string") {
        const parts = fileThing.split("/");
        return parts[parts.length - 1];
      }

      return fileThing.originalname || fileThing.filename || "File";
    },

    getFileUrl(fileThing) {
      if (!fileThing) return "#";

      if (typeof fileThing === "string") {
        if (fileThing.startsWith("http")) return fileThing;
        return `${API_BASE}${fileThing}`;
      }

      if (fileThing.url) return fileThing.url;
      if (fileThing.path) return `${API_BASE}${fileThing.path}`;
      if (fileThing.filename) return `${API_BASE}/uploads/${fileThing.filename}`;

      return "#";
    },

    getQuoteFiles(quote) {
      return quote?.payload?.uploadedFiles || [];
    },

    // -----------------------------
    // QUOTE CRUD
    // -----------------------------
    async sendQuote(quoteType, fullName, email, phone, payload) {
      try {
        const response = await fetch(`${API_BASE}/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote_type: quoteType,
            full_name: fullName,
            email,
            phone,
            payload,
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error("Submitting quote failed:", response.status, text);
          alert("Quote submission failed.");
          return null;
        }

        return await response.json();
      } catch (err) {
        console.error("sendQuote error:", err);
        alert("Quote submission error.");
        return null;
      }
    },

    async loadQuotes() {
      try {
        const res = await fetch(`${API_BASE}/quotes`);
        if (!res.ok) {
          console.error("Retrieving quotes failed", res.status);
          return;
        }

        this.quoteRequests = await res.json();

        this.quoteRequests.forEach((quote) => {
          if (!this.littleRateBox[quote.id]) {
            const oldBack = quote.payload?.agentBackToClient || {};
            this.littleRateBox[quote.id] = {
              status: oldBack.status || "",
              company: oldBack.company || "",
              monthlyPrice: oldBack.monthlyPrice || "",
              deductible: oldBack.deductible || "",
              note: oldBack.note || "",
            };
          }
        });
      } catch (err) {
        console.error("loadQuotes error:", err);
      }
    },

    async loadClientQuotes() {
      try {
        const res = await fetch(`${API_BASE}/quotes`);

        if (!res.ok) {
          console.error("Retrieving quotes failed", res.status);
          return;
        }

        const allQuotes = await res.json();
        const email = (this.clientAuth.email || "").toLowerCase();

        this.quoteRequests = allQuotes.filter(
          (q) => (q.email || "").toLowerCase() === email
        );
      } catch (err) {
        console.error("loading client quotes error:", err);
      }
    },

    async deleteQuote(id) {
      try {
        const res = await fetch(`${API_BASE}/quotes/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("deleting quote failed:", res.status, text);
          alert("Error deleting quote.");
          return;
        }

        await this.loadQuotes();
      } catch (err) {
        console.error("deleting quote error:", err);
        alert("Error deleting quote.");
      }
    },

    markQuoteSeen(id) {
      if (!this.seenQuotes.includes(id)) {
        this.seenQuotes.push(id);
        localStorage.setItem("seenQuotes", JSON.stringify(this.seenQuotes));
      }
    },

    quoteDetails(id) {
      this.selectedQuoteId = this.selectedQuoteId === id ? null : id;
      this.markQuoteSeen(id);
    },

    formatQuoteDetails(key) {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },

    // -----------------------------
    // AGENT SAVES RATE / STATUS
    // -----------------------------
    getLittleRate(quoteId, key) {
      return this.littleRateBox?.[quoteId]?.[key] || "";
    },

    async saveRateBackToClient(quote) {
      try {
        const littleBox = this.littleRateBox[quote.id] || {
          status: "",
          company: "",
          monthlyPrice: "",
          deductible: "",
          note: "",
        };

        const newPayload = {
          ...(quote.payload || {}),
          agentBackToClient: {
            status: littleBox.status || "Pending",
            company: littleBox.company || "",
            monthlyPrice: littleBox.monthlyPrice || "",
            deductible: littleBox.deductible || "",
            note: littleBox.note || "",
            updatedAt: new Date().toISOString(),
          },
        };

        const res = await fetch(`${API_BASE}/quotes/${quote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: newPayload }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Saving agent update failed:", res.status, text);
          alert("Could not save the quote update.");
          return;
        }

        alert("Quote update saved!");
        await this.loadQuotes();
      } catch (err) {
        console.error("saveRateBackToClient error:", err);
        alert("Error saving quote update.");
      }
    },

    getClientStatus(quote) {
      return quote?.payload?.agentBackToClient?.status || "Pending";
    },

    getClientCompany(quote) {
      return quote?.payload?.agentBackToClient?.company || "";
    },

    getClientPrice(quote) {
      return quote?.payload?.agentBackToClient?.monthlyPrice || "";
    },

    getClientDeductible(quote) {
      return quote?.payload?.agentBackToClient?.deductible || "";
    },

    getClientNote(quote) {
      return quote?.payload?.agentBackToClient?.note || "";
    },

    // -----------------------------
    // FORM SUBMIT HELPERS
    // -----------------------------
    async sendFormWithFiles(formName, quoteType, formDataObj, successMessage) {
      const uploadedFiles = await this.uploadMyFiles(formName);

      const payload = {
        ...formDataObj,
        uploadedFiles,
        agentBackToClient: {
          status: "Pending",
          company: "",
          monthlyPrice: "",
          deductible: "",
          note: "",
          updatedAt: null,
        },
      };

      const saved = await this.sendQuote(
        quoteType,
        formDataObj.fullName,
        formDataObj.email,
        formDataObj.phone,
        payload
      );

      if (!saved) return;

      this.studentFilesByForm[formName] = [];
      await this.loadClientQuotes();
      alert(successMessage);
      this.goTo("clientDashboard");
    },

    async submitHomeForm() {
      await this.sendFormWithFiles(
        "homeForm",
        "home",
        this.homeForm,
        "Home Insurance Quote Request Submitted! An agent will contact you soon."
      );
    },

    async submitAutoForm() {
      await this.sendFormWithFiles(
        "autoForm",
        "auto",
        this.autoForm,
        "Auto Insurance Quote Request Submitted! An agent will contact you soon."
      );
    },

    async submitGeneralForm() {
      await this.sendFormWithFiles(
        "generalForm",
        "general",
        this.generalForm,
        "General Liability Insurance Quote Request Submitted! An agent will contact you soon."
      );
    },

    async submitWorkersCompForm() {
      await this.sendFormWithFiles(
        "workersCompForm",
        "workers_comp",
        this.workersCompForm,
        "Workers Comp Quote Request Submitted! An agent will contact you soon."
      );
    },

    async submitInlandForm() {
      await this.sendFormWithFiles(
        "inlandForm",
        "inland_marine",
        this.inlandForm,
        "Inland Marine Quote Request Submitted! An agent will contact you soon."
      );
    },

    async submitLifeForm() {
      await this.sendFormWithFiles(
        "lifeForm",
        "life",
        this.lifeForm,
        "Life Insurance Quote Request Submitted! An agent will contact you soon."
      );
    },

    async submitOtherForm() {
      await this.sendFormWithFiles(
        "otherForm",
        "other",
        this.otherForm,
        "Insurance Quote Request Submitted! An agent will contact you soon."
      );
    },
  },

  mounted() {
    const savedClientToken = localStorage.getItem("client_token");
    const savedAgentToken = localStorage.getItem("agent_token");

    if (savedClientToken) {
      this.isClientLoggedIn = true;
    }

    if (savedAgentToken) {
      this.isAgentLoggedIn = true;
    }
  },
});

app.mount("#app");