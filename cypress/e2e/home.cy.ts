/// <reference types="cypress" />

describe("Home Page Tests", () => {
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
  it("should direct to club page from home page", () => {
    cy.contains("Queen's Fencing Club").should("be.visible").click();
    cy.url().then((current) => {
      expect(current).to.include("/club/1");
    });
    cy.contains("Request to Join").should("be.visible");
  });

  it("should direct to browse clubs from home page", () => {
    cy.contains("See All Clubs >>").should("be.visible").click();
    cy.url().then((current) => {
      expect(current).to.include("/clubs");
    });
    cy.contains("Browse Clubs").should("be.visible");
  });

  it("should direct to browse clubs page from nav", () => {
    cy.contains("Browse Clubs").should("be.visible").click();
    cy.url().then((current) => {
      expect(current).to.include("/clubs");
    });
    cy.contains("Browse Clubs").should("be.visible");
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
});
