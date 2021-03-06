// TODO: Cypress does not support request based whitelisting :( https://github.com/cypress-io/cypress/issues/4843
const mockRequest = (method, url, fn) => ({
	method,
	url,
	onResponse: xhr => {
		const mockResponse = fn(xhr);
		if (mockResponse) {
			xhr.response.body = mockResponse;
		}
	}
});

Cypress.Commands.add("waitForSteps", () => {
	// TODO: cypress does not support polling :(
	// https://github.com/cypress-io/cypress/issues/3308
	cy.wait(["@steplib-inputs"]);
	cy.wait(3000);
});

Cypress.Commands.add("loadSteps", (cb) => {
	cy.server();
	cy.route("POST", "/1/indexes/steplib_inputs/**").as("steplib-inputs");

	cy.fixture("steps.json").then(steps => {
		cy.route(
			mockRequest("POST", "/1/indexes/steplib_steps/**", xhr => {
				const { body } = xhr.request;
				if (body.query === "") {
					return steps;
				}
			})
		).as("steplib-steps");

		cb();
		cy.waitForSteps();
	});
});
