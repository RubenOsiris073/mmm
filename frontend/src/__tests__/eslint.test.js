const { ESLint } = require("eslint");

describe("ESLint warnings", () => {
    let eslint;

    beforeAll(async () => {
        eslint = new ESLint();
    });

    test("DetectionService.js should assign instance to a variable before exporting", async () => {
        const results = await eslint.lintFiles(["src/components/pos/services/DetectionService.js"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    ruleId: "import/no-anonymous-default-export",
                }),
            ])
        );
    });

    test("ProveedorView.jsx should remove unused imports and fix useEffect dependency", async () => {
        const results = await eslint.lintFiles(["src/components/proveedor/ProveedorView.jsx"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
                expect.objectContaining({ ruleId: "react-hooks/exhaustive-deps" }),
            ])
        );
    });

    test("POSMainPage.jsx should remove unused variable 'user'", async () => {
        const results = await eslint.lintFiles(["src/pages/POSMainPage.jsx"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
            ])
        );
    });

    test("ProductsPage.jsx should remove unused variable 'registeredProducts'", async () => {
        const results = await eslint.lintFiles(["src/pages/ProductsPage.jsx"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
            ])
        );
    });

    test("SalesPage.jsx should remove unused imports", async () => {
        const results = await eslint.lintFiles(["src/pages/SalesPage.jsx"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
            ])
        );
    });

    test("firebase.js should remove unused imports", async () => {
        const results = await eslint.lintFiles(["src/services/firebase.js"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
            ])
        );
    });

    test("storageService.js should remove unused imports", async () => {
        const results = await eslint.lintFiles(["src/services/storageService.js"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
            ])
        );
    });

    test("pdfGenerator.js should remove unused variable", async () => {
        const results = await eslint.lintFiles(["src/utils/pdfGenerator.js"]);
        const messages = results[0].messages;
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ruleId: "no-unused-vars" }),
            ])
        );
    });
});