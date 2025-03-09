/// <reference types="cypress" />

describe("Auth Tests", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.intercept("POST", "/clubs", { fixture: "clubs.json" }).as("clubs");
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
          (successFn) => {
            successFn({
              coords: {
                latitude: 40.73061,
                longitude: -73.935242,
                accuracy: 100,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
            });
          }
        );
      },
    });
    cy.wait("@clubs");
  });
  it("should do full auth flow", () => {
    cy.contains("Login").should("be.visible").click();
    cy.get('input[name="email"]').type("test2@example.com");
    cy.get('input[name="password"]').type("Fencing1");
    cy.get('button[type="submit"]').click();
    cy.contains("Queen's Fencing Club");
    cy.contains("View Details").click();
    cy.url().then((current) => {
      expect(current).to.include("/club/1");
    });
  });

  it("should error on wrong credentials", () => {
    cy.contains("Login").should("be.visible").click();
    cy.get('input[name="email"]').type("test2@example.com");
    cy.get('input[name="password"]').type("123456");
    cy.get('button[type="submit"]').click();
    cy.contains("Invalid email or password").should("be.visible");
  });

  it("should show success message on forgot password", () => {
    cy.visit("/login");
    cy.contains("Reset Password").should("be.visible").click();
    cy.get('input[placeholder="Enter your email"]').type("test2@example.com");
    cy.contains("Send Password Reset Link").click();
    cy.contains(
      "Password reset email has been sent! Please check your inbox."
    ).should("be.visible");
  });

  it("test login redirect", () => {
    cy.visit("/login?redirect=/club/1");
    cy.get('input[name="email"]').type("test2@example.com");
    cy.get('input[name="password"]').type("Fencing1");
    cy.get('button[type="submit"]').click();
    cy.url().then((current) => {
      expect(current).to.include("/club/1");
    });
  });
});
