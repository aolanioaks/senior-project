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
        // previousPolicy: "",
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
        // vinFile: null,
        // driversLicenseFile: null,
        // previousPolicyFile: null,
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
        // previousPolicyFile: null,
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
        // previousPolicyFile: null,
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
        // previousPolicyFile: null,
      },

      // OTHER form data
      otherForm: {
        fullName: "",
        email: "",
        phone: "",
        coverageDetails: "",
        // previousPolicyFile: null,
      },
    };
  },

  methods: {
    // navigation
    async goTo(page) {
      console.log("Go to: ", page);
      this.currentPage = page;
      if (page === "clientDashboard" || page === "agentDashboard") {
        await this.loadQuotes();
      }
    },

   // if the client isnt llogged in they wont be able to request any quotes
    requestQuote(formPage) {
      if (!this.isClientLoggedIn) {
        this.pendingFormPage = formPage;
        this.goTo("clientLogin");
      } else {
        this.goTo(formPage);
      }
    },

    // client auth
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
    
        if (this.pendingFormPage) {
          const next = this.pendingFormPage;
          this.pendingFormPage = null;
          this.goTo(next);
        } else {
          this.goTo("clientDashboard");
        }
      } catch (err) {
        console.error("handleClientAuth error:", err);
        alert("Client login/signup error.");
      }
    },    

    // agent auth 
    handleAgentAuth() {
      if (this.isAgentSignup) {
        console.log("Agent Signup:", this.agentAuth);
        alert(`Agent account created for ${this.agentAuth.fullName}!`);
        this.isAgentLoggedIn = true;
      } else {
        console.log("Agent Login:", this.agentAuth.email);
        alert(`Welcome, Agent ${this.agentAuth.email}!`);
        this.isAgentLoggedIn = true;
      }

      this.goTo("agentDashboard");
    },

    // logout
    logout() {
      this.isClientLoggedIn = false;
      this.isAgentLoggedIn = false;
      this.clientAuth = { fullName: "", email: "", password: "", phone: "" };
      this.agentAuth = { fullName: "", email: "", password: "", licenseNumber: "" };
      this.goTo("landing");
      alert("Logged out successfully!");
    },





    // // carousel
    // prev() {
    //   this.activeIndex = (this.activeIndex - 1 + this.categories.length) % this.categories.length;
    // },

    // next() {
    //   this.activeIndex = (this.activeIndex + 1) % this.categories.length;
    // },

    // goCard(index) {
    //   this.activeIndex = index;
    // },

    // onWheel(event) {
    //   if (event.deltaY < 0) this.prev();
    //   else this.next();
    // },

    // cardStyle(index) {
    //   const len = this.categories.length;
    //   let offset = index - this.activeIndex;

    //   if (offset > len / 2) offset -= len;
    //   if (offset < -len / 2) offset += len;

    //   const abs = Math.abs(offset);
    //   const x = offset * 190;
    //   const scale = 1 - abs * 0.12;
    //   const rotate = offset * -18;
    //   const z = 50 - abs;
    //   const opacity = abs > 4 ? 0 : 1 - abs * 0.18;
    //   const blur = abs > 2 ? (abs - 2) * 1.2 : 0;

    //   return {
    //     transform: `translateX(${x}px) scale(${Math.max(scale, 0.55)}) rotateY(${rotate}deg)`,
    //     zIndex: z,
    //     opacity,
    //     filter: `blur(${blur}px)`,
    //     pointerEvents: abs > 4 ? "none" : "auto",
    //   };
    // },

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
          alert("Quote submission failed.");
          return null;
        }

        return await response.json();
      } catch (err) {
        console.error("sendQuote error:", err);
        alert("Quote submission error.");
      }
    },


// loading quotes for the agent dashboard
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





    // form submissions
    async submitHomeForm() {
      const payload = { ...this.homeForm };

      const saved = await this.sendQuote(
        "home",
        this.homeForm.fullName,
        this.homeForm.email,
        this.homeForm.phone,
        payload
      );

      if (!saved) return;

      await this.loadQuotes();
      alert("Home Insurance Quote Request Submitted! An agent will contact you soon.");
      this.goTo("clientDashboard");
    },

    async submitAutoForm() {
      const payload = { ...this.autoForm };

      const saved = await this.sendQuote(
        "auto",
        this.autoForm.fullName,
        this.autoForm.email,
        this.autoForm.phone,
        payload
      );

      if (!saved) return;

      await this.loadQuotes();
      alert("Auto Insurance Quote Request Submitted! An agent will contact you soon.");
      this.goTo("clientDashboard");
    },

    async submitGeneralForm() {
      const payload = { ...this.generalForm };

      const saved = await this.sendQuote(
        "general",
        this.generalForm.fullName,
        this.generalForm.email,
        this.generalForm.phone,
        payload
      );

      if (!saved) return;

      await this.loadQuotes();
      alert("General Liability Insurance Quote Request Submitted! An agent will contact you soon.");
      this.goTo("clientDashboard");
    },

    async submitWorkersCompForm() {
      const payload = { ...this.workersCompForm };

      const saved = await this.sendQuote(
        "workers_comp",
        this.workersCompForm.fullName,
        this.workersCompForm.email,
        this.workersCompForm.phone,
        payload
      );

      if (!saved) return;

      await this.loadQuotes();
      alert("Workers Comp Quote Request Submitted! An agent will contact you soon.");
      this.goTo("clientDashboard");
    },
    async submitInlandForm() {
        const payload = { ...this.inlandForm };
    
        const saved = await this.sendQuote(
            "inland_marine",
            this.inlandForm.fullName,
            this.inlandForm.email,
            this.inlandForm.phone,
            payload
        );
    
        if (!saved) return;
    
        await this.loadQuotes();
        alert("Inland Marine Quote Request Submitted! An agent will contact you soon.");
        this.goTo("clientDashboard");
    },

    async submitLifeForm() {
      const payload = { ...this.lifeForm };

      const saved = await this.sendQuote(
        "life",
        this.lifeForm.fullName,
        this.lifeForm.email,
        this.lifeForm.phone,
        payload
      );

      if (!saved) return;

      await this.loadQuotes();
      alert("Life Insurance Quote Request Submitted! An agent will contact you soon.");
      this.goTo("clientDashboard");
    },

    async submitOtherForm() {
      const payload = { ...this.otherForm };

      const saved = await this.sendQuote(
        "other",
        this.otherForm.fullName,
        this.otherForm.email,
        this.otherForm.phone,
        payload
      );

      if (!saved) return;

      await this.loadQuotes();
      alert("Insurance Quote Request Submitted! An agent will contact you soon.");
      this.goTo("clientDashboard");
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
          alert("Agent login/signup failed.");
          return;
        }
    
        const data = await res.json();
    
        localStorage.setItem("agent_token", data.token);
    
        this.isAgentLoggedIn = true;
        this.agentAuth.fullName = data.agent.full_name;
        this.agentAuth.email = data.agent.email;
        this.agentAuth.licenseNumber = data.agent.license_number || "";
    
        alert(this.isAgentSignup ? "Agent account created!" : "Agent logged in!");
        this.goTo("agentDashboard");
      } catch (err) {
        console.error("handleAgentAuth error:", err);
        alert("Agent login/signup error.");
      }
    }
    
  },
});

app.mount("#app");


