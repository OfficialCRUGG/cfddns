import { helloWorld } from "../src/helloworld";

test(`No custom name`, () => {
    expect(helloWorld()).toBe("Hello World");
    expect(helloWorld()).not.toBe("Hello undefined!");
});

test(`Custom name ("Nagi Aoe")`, () => {
    expect(helloWorld("Nagi Aoe")).toBe("Hello Nagi Aoe");
    expect(helloWorld("Nagi Aoe")).not.toBe("Hello World");
});
