const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const assert = require("assert");

describe("Riverside Render E2E", function () {
  this.timeout(90000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://riverside-api.onrender.com");
  });

  beforeEach(async function () {
    await driver.executeScript("localStorage.clear();");
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });



  it("loads the homepage", async function () {
    await driver.get("https://riverside-api.onrender.com");

    await driver.wait(async function () {
      const title = await driver.getTitle();
      return title && title.length > 0;
    }, 20000);

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("RIVERSIDE BUSINESS INSURANCE"));
  });


  it("opens client login", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 20000);

    const clientLoginButton = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Client Login')]")
    );
    await driver.executeScript("arguments[0].click();", clientLoginButton);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      15000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Client Portal"));
  });


  it("navigates to categories page", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const startBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Get Started')]")
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Select Your Coverage')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Select Your Coverage"));
  });


  it("opens agent login page", async function () {
    await driver.get("https://riverside-api.onrender.com");

    const agentBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Agent Login')]")
    );
    await driver.executeScript("arguments[0].click();", agentBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Agent Portal')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Agent Portal"));
  });


  it("toggles client signup and login", async function () {
    await driver.get("https://riverside-api.onrender.com");

    const clientBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Client Login')]")
    );
    await driver.executeScript("arguments[0].click();", clientBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      10000
    );

    const signUpBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Sign Up')]")
    );
    await driver.executeScript("arguments[0].click();", signUpBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Create your account')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Create your account"));
  });


  it("opens contact page", async function () {
    await driver.get("https://riverside-api.onrender.com");

    const contactBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Contact')]")
    );
    await driver.executeScript("arguments[0].click();", contactBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Contact Us')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Contact Us"));
  });


  it("toggles agent signup and login", async function () {
    await driver.get("https://riverside-api.onrender.com");

    const agentBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Agent Login')]")
    );
    await driver.executeScript("arguments[0].click();", agentBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Agent Portal')]")),
      10000
    );

    const signUpBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Sign Up')]")
    );
    await driver.executeScript("arguments[0].click();", signUpBtn);

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Create agent account"));
  });


  it("opens categories from client dashboard", async function () {
    await driver.get("https://riverside-api.onrender.com");

    const clientBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Client Login')]")
    );
    await driver.executeScript("arguments[0].click();", clientBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      10000
    );

    const signUpBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Sign Up')]")
    );
    await driver.executeScript("arguments[0].click();", signUpBtn);

    const uniqueEmail = `request${Date.now()}@example.com`;
    const textInputs = await driver.findElements(By.css("input[type='text']"));
    await textInputs[0].sendKeys("Request Test");
    await driver.findElement(By.css("input[type='email']")).sendKeys(uniqueEmail);
    await driver.findElement(By.css("input[type='password']")).sendKeys("TestPassword123!");
    await driver.findElement(By.css("input[type='tel']")).sendKeys("5551234567");

    const submitBtn = await driver.findElement(By.css("button[type='submit']"));
    await driver.executeScript("arguments[0].click();", submitBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Your Quote Requests')]")),
      60000
    );

    const requestBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Request New Quote')]")
    );
    await driver.executeScript("arguments[0].click();", requestBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Select Your Coverage')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Select Your Coverage"));
  });



  it("loads agents page", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const agentsBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Agents')]")
    );
    await driver.executeScript("arguments[0].click();", agentsBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(@class, 'team-section')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Blake O."));
  });


  it("loads carriers page", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const carriersBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Carriers')]")
    );
    await driver.executeScript("arguments[0].click();", carriersBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(@class, 'carrier-grid')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Travelers"));
  });


  it("brand logo click returns to landing page", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const contactBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Contact')]")
    );
    await driver.executeScript("arguments[0].click();", contactBtn);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Contact Us')]")),
      10000
    );

    const brand = await driver.findElement(By.css(".brand-box"));
    await driver.executeScript("arguments[0].click();", brand);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Get Started')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Get Started"));
  });


  it("back button on categories returns to landing", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const startBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Get Started')]")
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Select Your Coverage')]")),
      10000
    );

    const backBtn = await driver.findElement(
      By.xpath("//button[contains(., '← Back to Home')]")
    );
    await driver.executeScript("arguments[0].click();", backBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Get Started')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Get Started"));
  });


  it("back button on contact page returns to landing", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const contactBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Contact')]")
    );
    await driver.executeScript("arguments[0].click();", contactBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Contact Us')]")),
      10000
    );

    const backBtn = await driver.findElement(
      By.xpath("//button[contains(., '← Back to Home')]")
    );
    await driver.executeScript("arguments[0].click();", backBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Get Started')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Get Started"));
  });


  it("client login back button returns to categories", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const startBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Get Started')]")
    );
    await driver.executeScript("arguments[0].click();", startBtn);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Select Your Coverage')]")),
      10000
    );

    const firstCard = await driver.findElement(By.css(".quote-card-btn"));
    await driver.executeScript("arguments[0].click();", firstCard);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      10000
    );

    const backBtn = await driver.findElement(
      By.xpath("//button[contains(., '← Back')]")
    );
    await driver.executeScript("arguments[0].click();", backBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Select Your Coverage')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Select Your Coverage"));
  });


  it("client signup back button toggles to sign in", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const clientBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Client Login')]")
    );
    await driver.executeScript("arguments[0].click();", clientBtn);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      10000
    );

    const signUpBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Sign Up')]")
    );
    await driver.executeScript("arguments[0].click();", signUpBtn);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Create your account')]")),
      10000
    );

    const signInBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Sign In')]")
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Welcome back')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Welcome back"));
  });



  it("client login shows error with wrong password", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const clientBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Client Login')]")
    );
    await driver.executeScript("arguments[0].click();", clientBtn);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      10000
    );

    await driver.findElement(By.css("input[type='email']")).sendKeys("doesnotexist@fake.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("wrongpassword");

    const submitBtn = await driver.findElement(By.css("button[type='submit']"));
    await driver.executeScript("arguments[0].click();", submitBtn);

    await driver.wait(
      until.elementLocated(By.css(".toast")),
      20000
    );

    const toast = await driver.findElement(By.css(".toast"));
    const toastText = await toast.getText();
    assert(toastText.length > 0);
  });


  it("agent login shows error with wrong password", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const agentBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Agent Login')]")
    );
    await driver.executeScript("arguments[0].click();", agentBtn);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Agent Portal')]")),
      10000
    );

    await driver.findElement(By.css("input[type='email']")).sendKeys("fakeagent@fake.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("wrongpassword");

    const submitBtn = await driver.findElement(By.css("button[type='submit']"));
    await driver.executeScript("arguments[0].click();", submitBtn);

    await driver.wait(
      until.elementLocated(By.css(".toast")),
      20000
    );

    const toast = await driver.findElement(By.css(".toast"));
    const toastText = await toast.getText();
    assert(toastText.length > 0);
  });


  it("contact page displays address, phone, email, and fax", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const contactBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Contact')]")
    );
    await driver.executeScript("arguments[0].click();", contactBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Contact Us')]")),
      10000
    );

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("157 E. Riverside Drive"));
    assert(pageSource.includes("435"));
    assert(pageSource.includes("insurance157@gmail.com"));
    assert(pageSource.includes("Fax"));
  });


  it("homepage displays stats", async function () {
    await driver.get("https://riverside-api.onrender.com");

    await driver.wait(
      until.elementLocated(By.css(".stat-num")),
      10000
    );

    const stats = await driver.findElements(By.css(".stat-num"));
    assert(stats.length === 3, `Expected 3 stat boxes, found ${stats.length}`);

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Years Experience"));
    assert(pageSource.includes("Clients Protected"));
    assert(pageSource.includes("Carrier Partners"));
  });


  it("categories page shows all 7 coverage types", async function () {
    await driver.get("https://riverside-api.onrender.com");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const startBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Get Started')]")
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Select Your Coverage')]")),
      10000
    );

    const cards = await driver.findElements(By.css(".quote-card"));
    assert(cards.length === 7, `Expected 7 coverage cards, found ${cards.length}`);

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Home Insurance"));
    assert(pageSource.includes("Auto Insurance"));
    assert(pageSource.includes("General Liability"));
    assert(pageSource.includes("Workers Comp"));
    assert(pageSource.includes("Inland Marine"));
    assert(pageSource.includes("Life Insurance"));
    assert(pageSource.includes("Other Insurance"));
  });


});