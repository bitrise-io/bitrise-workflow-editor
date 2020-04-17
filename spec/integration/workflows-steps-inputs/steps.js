import $ from "../elements";
import "../common";

afterEach(() => {
	$("Discard Button").then(btn => {
		if (!btn.is(":disabled")) {
			btn.click();
		}
	});
});
