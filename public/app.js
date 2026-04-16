const { createApp } = Vue;

const app = createApp({
  data() {
    return {
  
      currentPage: "landing",
      pendingFormPage: null,
 
      activeIndex: 3,
      categories: [
        { key: "home", title: "Home Insurance", sub: "Protect your home and belongings", formPage: "homeForm", imageUrl:"/home.avif"},
        { key: "auto", title: "Auto Insurance", sub: "Coverage for your vehicle", formPage: "autoForm", imageUrl:"/auto.jpg" },
        { key: "generalLiability", title: "General Liability", sub: "Protect your business assets", formPage: "generalForm", imageUrl:"/general.jpg" },
        { key: "workers", title: "Workers Comp", sub: "Protect your employees", formPage: "workersCompForm", imageUrl:"/workers.jpg" },
        { key: "inlandMarine", title: "Inland Marine", sub: "Coverage for equipment, builders risk and new constructions", formPage: "inlandForm", imageUrl:"/inland.avif" },
        { key: "life", title: "Life Insurance", sub: "Coverage for your family", formPage: "lifeForm", imageUrl:"/life.jpg" },
        { key: "other", title: "Other Insurance", sub: "Coverage for mortocycle, boat, umbrella, etc..", formPage: "otherForm", imageUrl:"/other.avif" },
      ],

      // CLIENT AUTHENTICATION
      isClientLoggedIn: false,
      isClientSignup: false,
      clientAuth: {
        fullName: "",
        email: "",
        password: "",
        phone: "",
      },

      // AGENT AUTHENTICATION
      isAgentLoggedIn: false,
      isAgentSignup: false,
      agentAuth: {
        fullName: "",
        email: "",
        password: "",
        licenseNumber: "",
      },

      
      quoteRequests: [],
      //to retrieve quote details in teh agent dashboard
      selectedQuoteId: null,

      //quote has been seen by the agent
      seenQuotes: JSON.parse(localStorage.getItem("seenQuotes") || "[]"),

      agentQuoteForm: {
        premium: "",
        carrier: "",
        agent_notes: "",
        status: "Pending",
      },

    
      // HOME form data
      homeForm: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        propertyType: "",
        sqft: "",
        yearBuilt: "",
        roofType: "",
        previousPolicyFile: null,
      },

      // AUTO form data
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
        vinFile: null,
        driversLicenseFile: null,
        previousPolicyFile: null,
      },

      // BUSINESS form data
      generalForm: {
        fullName: "",
        email: "",
        phone: "",
        businessName: "",
        businessAddress: "",
        businessType: "",
        numberOfEmployees: "",
        annualRevenue: "",
        startYear: "",
        payroll: "",
        previousPolicyFile: null,
        additionalCoverage: "",
      },

      // WORKERS COMP form data
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
        previousPolicyFile: null,
      },

      //inland marine fomr data
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
            previousPolicyFile: null,


        },

      // LIFE form data
      lifeForm: {
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        smokerStatus: "",
        annualIncome: "",
        medicalHistory: "",
        beneficiaryNames: "",
        previousPolicyFile: null,
      },

      // OTHER form data
      otherForm: {
        fullName: "",
        email: "",
        phone: "",
        coverageDetails: "",
        previousPolicyFile: null,
      },

      toast: {
        show: false,
        message: "",
        type: "info"
      },

      carrierOptions: 
      [{ carrier: "", 
        premium: "", 
        notes: "" 
      }],

    };
  },

  methods: {

    showToast(message, type = "info") {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;

      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    async goTo(page) {
      console.log("Go to: ", page);
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
        'homeForm', 'autoForm', 'generalForm',
        'workersCompForm', 'inlandForm', 'lifeForm', 'otherForm'
      ];
      forms.forEach(form => {
        if (this[form].fullName  !== undefined) this[form].fullName  = fullName || '';
        if (this[form].email     !== undefined) this[form].email     = email    || '';
        if (this[form].phone     !== undefined) this[form].phone     = phone    || '';
      });
    },

    // if the client isn't logged in they won't be able to request any quotes
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
          ? "https://riverside-api.onrender.com/auth/client/signup"
          : "https://riverside-api.onrender.com/auth/client/login";
    
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
          this.showToast("Client login/signup failed.");
          return;
        }
    
        const data = await res.json();
    
        localStorage.setItem("client_token", data.token);
    
        this.isClientLoggedIn = true;
        this.clientAuth.fullName = data.client.full_name;
        this.clientAuth.email = data.client.email;
        this.clientAuth.phone = data.client.phone || "";
        this.clientAuth.password = "";
    
        this.showToast(this.isClientSignup ? "Client account created!" : "Client logged in!", "success");
        this.isClientSignup = false;  

        if (this.pendingFormPage) {
          const next = this.pendingFormPage;
          this.pendingFormPage = null;
          this.prefillForms();  
          this.goTo(next);
        } else {
          this.goTo("clientDashboard");
        }
      } catch (err) {
        console.error("handleClientAuth error:", err);
        this.showToast("Client login/signup error.");
      }
    },    


    handleAgentAuth() {
      if (this.isAgentSignup) {
        console.log("Agent Signup:", this.agentAuth);
        this.showToast(`Agent account created for ${this.agentAuth.fullName}!`);
        this.isAgentLoggedIn = true;
      } else {
        console.log("Agent Login:", this.agentAuth.email);
        this.showToast(`Welcome, Agent ${this.agentAuth.email}!`);
        this.isAgentLoggedIn = true;
      }

      this.goTo("agentDashboard");
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
        phone: "" 
      };
      this.agentAuth = { 
        fullName: "", 
        email: "", 
        password: "", 
        licenseNumber: "" 
      };
      this.goTo("landing");
      this.showToast("Logged out successfully!");
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



    async sendQuote(quoteType, fullName, email, phone, payload) {

      try {
        const response = await fetch("https://riverside-api.onrender.com/quotes", {
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
          this.showToast("Quote submission failed.");
          return null;
        }

        return await response.json();
      } catch (err) {
        console.error("sendQuote error:", err);
        this.showToast("Quote submission error.");
      }
    },


// loading quotes for the agent to see in their dashboard
    async loadQuotes() {
      try {
        const res = await fetch("https://riverside-api.onrender.com/quotes");
        if (!res.ok) {
          console.error("Retrieving quotes failed", res.status);
          return;
        }
        this.quoteRequests = await res.json();
      } catch (err) {
        console.error("loadQuotes error:", err);
      }
    },


    async deleteQuote(id) {
      try {
        const res = await fetch(`https://riverside-api.onrender.com/quotes/${id}`, {
          method: 'DELETE',
        });
        await this.loadQuotes();
      } catch (err) {
        console.error("deleting quote error:", err);
        this.showToast("Error deleting quote.");
      }
    },


    markQuoteSeen(id) {
      if(!this.seenQuotes.includes(id)){
        this.seenQuotes.push(id);
        localStorage.setItem("seenQuotes", JSON.stringify(this.seenQuotes));
      }
    },



    quoteDetails(id) {
      this.selectedQuoteId = this.selectedQuoteId === id ? null : id;
      this.markQuoteSeen(id);
      
      const quote = this.quoteRequests.find(q => q.id === id);
      if (quote && this.selectedQuoteId === id) {
        this.fillAgentQuoteForm(quote);
      }
    },



    formatQuoteDetails(key) {
      return key
        .replace(/([A-Z])/g, " $1") 
        .replace(/^./, str => str.toUpperCase());
    },

    formatDate(dateStr) {
      if(!dateStr) return "";
      return new Date(dateStr).toLocaleDateString('en-US',{ month: "short", day: "numeric", year: "numeric" });
    },


      // cloading quotes in the client dashboard 
    async loadClientQuotes() {
      try {
        const res = await fetch("https://riverside-api.onrender.com/quotes");

        if (!res.ok) {
          console.error("Retrieving quotes failed", res.status);
          return;
        }
        const all = await res.json();
        const email = (this.clientAuth.email || "").toLowerCase();
        this.quoteRequests = all.filter(
          q => (q.email || "").toLowerCase() === email
        );

      } catch (err) {
        console.error("loading client quotes error:", err);
      }
    },



    fillAgentQuoteForm(quote) {
      this.agentQuoteForm.premium = quote.premium || "";
      this.agentQuoteForm.carrier = quote.carrier || "";
      this.agentQuoteForm.agent_notes = quote.agent_notes || "";
      this.agentQuoteForm.status = quote.status || "Pending";
      this.agentQuoteForm.carrierOptions = quote.carrier_options?.length
        ? quote.carrier_options
        : [{ carrier: "", premium: "", notes: "" }];
    },

    
    async saveAgentQuote(id) {
      try {
        const res = await fetch(`https://riverside-api.onrender.com/quotes/${id}/agent-update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            premium: this.agentQuoteForm.premium,
            carrier: this.agentQuoteForm.carrier,
            agent_notes: this.agentQuoteForm.agent_notes,
            status: this.agentQuoteForm.status,
            carrier_options: this.agentQuoteForm.carrierOptions,
          }),
        });
        
    
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Saving agent quote failed:", res.status, text);
          this.showToast("Saving quote update failed.");
          return;
        }
    
        await this.loadQuotes();
        this.showToast("Quote updated successfully!", "success");
      } catch (err) {
        console.error("saveAgentQuote error:", err);
        this.showToast("Error saving quote update.");
      }
    },





    // forms 
    async submitHomeForm() {
      try {
        const formData = new FormData();

        const payload = {
          address: this.homeForm.address,
          propertyType: this.homeForm.propertyType,
          sqft: this.homeForm.sqft,
          yearBuilt: this.homeForm.yearBuilt,
          roofType: this.homeForm.roofType,
        };
        formData.append("quote_type", "home");
        formData.append("full_name", this.homeForm.fullName);
        formData.append("email", this.homeForm.email);
        formData.append("phone", this.homeForm.phone);
        formData.append("payload", JSON.stringify(payload));

        if(this.homeForm.previousPolicyFile){
          formData.append("previousPolicyFile", this.homeForm.previousPolicyFile);
        }
        const response = await fetch("https://riverside-api.onrender.com/quotes/upload", {
          method: "POST",
          body: formData,
        });
        await response.json();
        await this.loadClientQuotes();
        this.showToast("Home Insurance Quote Request Submitted! An agent will contact you soon.", "success");
        this.goTo("clientDashboard");
      }
        catch (err) {
          console.error("submitHomeForm error:", err);
          this.showToast("Home quote submission failed.");
        }
    },



    async submitAutoForm() {
      try {
        const formData = new FormData();
    
        const payload = {
          fullName: this.autoForm.fullName,
          email: this.autoForm.email,
          phone: this.autoForm.phone,
          address: this.autoForm.address,
          make: this.autoForm.make,
          model: this.autoForm.model,
          year: this.autoForm.year,
          vin: this.autoForm.vin,
          driversLicense: this.autoForm.driversLicense,
        };
    
        formData.append("quote_type", "auto");
        formData.append("full_name", this.autoForm.fullName);
        formData.append("email", this.autoForm.email);
        formData.append("phone", this.autoForm.phone);
        formData.append("payload", JSON.stringify(payload));
    
        if (this.autoForm.driversLicenseFile) {
          formData.append("driversLicenseFile", this.autoForm.driversLicenseFile);
        }
    
        if (this.autoForm.vinFile) {
          formData.append("vinFile", this.autoForm.vinFile);
        }
    
        if (this.autoForm.previousPolicyFile) {
          formData.append("previousPolicyFile", this.autoForm.previousPolicyFile);
        }
    
        const response = await fetch("https://riverside-api.onrender.com/quotes/auto-upload", {
          method: "POST",
          body: formData,
        });
    
        await response.json();
        await this.loadClientQuotes();
        this.showToast("Auto Insurance Quote Request Submitted! An agent will contact you soon.", "success");
        this.goTo("clientDashboard");
      } catch (err) {
        console.error("submitAutoForm error:", err);
        this.showToast("Auto quote submission failed.");
      }
    },

    async submitGeneralForm() {
      try{
        const formData = new FormData();

        const payload = {
          businessName: this.generalForm.businessName,
          businessAddress: this.generalForm.businessAddress,
          businessType: this.generalForm.businessType,
          numberOfEmployees: this.generalForm.numberOfEmployees,
          annualRevenue: this.generalForm.annualRevenue,
          startYear: this.generalForm.startYear,
          payroll: this.generalForm.payroll,
          additionalCoverage: this.generalForm.additionalCoverage,
        };
        formData.append("quote_type", "general_liability");
        formData.append("full_name", this.generalForm.fullName);
        formData.append("email", this.generalForm.email);
        formData.append("phone", this.generalForm.phone);
        formData.append("payload", JSON.stringify(payload));

        if (this.generalForm.previousPolicyFile) {
          formData.append("previousPolicyFile", this.generalForm.previousPolicyFile);
        }

        const response = await fetch("https://riverside-api.onrender.com/quotes/upload", {
          method: "POST",
          body: formData,
        });

        await response.json();
        await this.loadClientQuotes();
        this.showToast("General Liability Insurance Quote Request Submitted! An agent will contact you soon.", "success");
        this.goTo("clientDashboard");
      } catch (err) {
        console.error("submitGeneralForm error:", err);
        this.showToast("General Liability quote submission failed.");
      }
    },



    async submitWorkersCompForm() {
      try{
        const formData = new FormData();

        const payload = {
          address: this.workersCompForm.address,
          businessName: this.workersCompForm.businessName,
          businessAddress: this.workersCompForm.businessAddress,
          businessType: this.workersCompForm.businessType,
          FEIN: this.workersCompForm.FEIN,
          annualRevenue: this.workersCompForm.annualRevenue,
          startYear: this.workersCompForm.startYear,
          payroll: this.workersCompForm.payroll,
        };
    
        formData.append("quote_type", "workersComp");
        formData.append("full_name", this.workersCompForm.fullName);
        formData.append("email", this.workersCompForm.email);
        formData.append("phone", this.workersCompForm.phone);
        formData.append("payload", JSON.stringify(payload));
    
        if (this.workersCompForm.previousPolicyFile) {
          formData.append("previousPolicyFile", this.workersCompForm.previousPolicyFile);
        }
        const response = await fetch("https://riverside-api.onrender.com/quotes/upload", {
          method: "POST",
          body: formData,
        });
        await response.json();
        await this.loadClientQuotes();
        this.showToast("Workers Comp Quote Request Submitted! An agent will contact you soon.", "success");
        this.goTo("clientDashboard");

      } catch (err) {
        console.error("submitWorkersCompForm error:", err);
        this.showToast("Workers Comp quote submission failed.");
        return;
      }
    },



    async submitInlandForm() {
      try{
        const formData = new FormData();

        const payload = {
          address: this.inlandForm.address,
          ownerOrContractor: this.inlandForm.ownerOrContractor,
          businessName: this.inlandForm.businessName,
          businessAddress: this.inlandForm.businessAddress,
          businessType: this.inlandForm.businessType,
          equipmentType: this.inlandForm.equipmentType,
          equipmentMake: this.inlandForm.equipmentMake,
          equipmentModel: this.inlandForm.equipmentModel,
          serialNumber: this.inlandForm.serialNumber,
          equipmentValue: this.inlandForm.equipmentValue,
          descriptionOfOperation: this.inlandForm.descriptionOfOperation,
          estimatedCompletionDate: this.inlandForm.estimatedCompletionDate,
        };

        formData.append("quote_type", "inland_marine");
        formData.append("full_name", this.inlandForm.fullName);
        formData.append("email", this.inlandForm.email);
        formData.append("phone", this.inlandForm.phone);
        formData.append("payload", JSON.stringify(payload));

        if(this.inlandForm.previousPolicyFile){
          formData.append("previousPolicyFile", this.inlandForm.previousPolicyFile);
        }
        const response = await fetch("https://riverside-api.onrender.com/quotes/upload", {
          method: "POST",
          body: formData,

        });
        await response.json();
        await this.loadClientQuotes();
        this.showToast("Inland Marine Quote Request Submitted! An agent will contact you soon.", "success");
        this.goTo("clientDashboard");

      }
      catch (err) {
        console.error("submitInlandForm error:", err);
        this.showToast("Inland Marine quote submission failed.");
      }
    },



    async submitLifeForm() {
      try{
        const formData = new FormData();

        const payload = {
          dateOfBirth: this.lifeForm.dateOfBirth,
          smokerStatus: this.lifeForm.smokerStatus,
          annualIncome: this.lifeForm.annualIncome,
          medicalHistory: this.lifeForm.medicalHistory,
          beneficiaryNames: this.lifeForm.beneficiaryNames,
        };

        formData.append("quote_type", "life");
        formData.append("full_name", this.lifeForm.fullName);
        formData.append("email", this.lifeForm.email);
        formData.append("phone", this.lifeForm.phone);
        formData.append("payload", JSON.stringify(payload));

        if(this.lifeForm.previousPolicyFile){
          formData.append("previousPolicyFile", this.lifeForm.previousPolicyFile);
        }

        const response = await fetch("https://riverside-api.onrender.com/quotes/upload", {
          method: "POST",
          body: formData,
        });

        await response.json();
        await this.loadClientQuotes();
        this.showToast("Life Insurance Quote Request Submitted! An agent will contact you soon.", "success");
        this.goTo("clientDashboard");

      } catch (err) {
        console.error("submitLifeForm error:", err);
        this.showToast("Life quote submission failed.");
      }
    },


    async submitOtherForm() {
      try{
        const formData = new FormData();
        const payload = {
          coverageDetails: this.otherForm.coverageDetails,
        };
        formData.append("quote_type", "other");
        formData.append("full_name", this.otherForm.fullName);
        formData.append("email", this.otherForm.email);
        formData.append("phone", this.otherForm.phone);
        formData.append("payload", JSON.stringify(payload));

        if(this.otherForm.previousPolicyFile){
          formData.append("previousPolicyFile", this.otherForm.previousPolicyFile);
        }

        const response = await fetch("https://riverside-api.onrender.com/quotes/upload", {
          method: "POST",
          body: formData,
        });

        await response.json();
        await this.loadClientQuotes();
        this.showToast("Other Insurance Quote Request Submitted! An agent will contact you soon.", "success");

      }catch (err) {
        console.error("submitOtherForm error:", err);
        this.showToast("Other quote submission failed.");
      }
    },





    async handleAgentAuth() {
      try {
        const endpoint = this.isAgentSignup
          ? "https://riverside-api.onrender.com/auth/agent/signup"
          : "https://riverside-api.onrender.com/auth/agent/login";
    
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
          this.showToast("Agent login/signup failed.");
          return;
        }
    
        const data = await res.json();
    
        localStorage.setItem("agent_token", data.token);
    
        this.isAgentLoggedIn = true;
        this.agentAuth.fullName = data.agent.full_name;
        this.agentAuth.email = data.agent.email;
        this.agentAuth.licenseNumber = data.agent.license_number || "";
        
        this.showToast(this.isAgentSignup ? "Agent account created!" : "Agent logged in!", "success");
        this.isAgentSignup = false;  
        this.goTo("agentDashboard");
      } catch (err) {
        console.error("handleAgentAuth error:", err);
        this.showToast("Agent login/signup error.");
      }
    },


    handleFileChange(event, formName, fieldName) {
      const file = event.target.files[0] || null;
      this[formName][fieldName] = file;
    },

    connectSocket() { /* io() setup, listen for newQuote + quoteUpdated */ },
    addCarrierOption() { this.carrierOptions.push({ carrier: "", premium: "", notes: "" }); },
    removeCarrierOption(i) { this.carrierOptions.splice(i,1); },
      

    mounted() { 
      this.connectSocket(); 
    },



  },
});

app.mount("#app");