
const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const assert = require("assert");

describe("Riverside Render E2E", function () {
  this.timeout(90000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
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

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Client Login"));

    const clientLoginButton = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.), 'Client Login')]")
    );

    await driver.executeScript("arguments[0].click();", clientLoginButton);

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      15000
    );

    const newPageSource = await driver.getPageSource();
    assert(newPageSource.includes("Client Portal"));
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
  
    await driver.findElement(
      By.xpath("//button[contains(., 'Client Login')]")
    ).click();
  
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Client Portal')]")),
      10000
    );
  
    // Click Sign Up
    await driver.findElement(
      By.xpath("//button[contains(., 'Sign Up')]")
    ).click();
  
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Create your account')]")),
      10000
    );
  
    const pageSource = await driver.getPageSource();
    assert(pageSource.includes("Create your account"));
  });





  it("opens contact page", async function () {
    await driver.get("https://riverside-api.onrender.com");
  
    await driver.findElement(
      By.xpath("//button[contains(., 'Contact')]")
    ).click();
  
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
    await driver.findElement(By.css("button[type='submit']")).click();
  
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Your Quote Requests')]")),
      15000
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

  




  //home quote loads


  // auto quote loads


  // general liability quote loads


  // workers comp quote loads


  // inland marine quote loads


  //life quote loads


  // other quote loads



});


