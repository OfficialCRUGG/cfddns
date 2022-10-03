export function helloWorld(name?: string): string {
    if (name) {
        return `Hello ${name}`;
    } else {
        return "Hello World";
    }
}
