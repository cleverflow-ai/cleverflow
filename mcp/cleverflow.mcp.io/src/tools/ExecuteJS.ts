import vm from 'vm';

/**
 * Executes a JavaScript string safely using Node.js V8 engine with dynamic input.
 * @param jsCode - The JavaScript code to execute (you can use `data` inside it).
 * @param input - The input passed into the code, available as the `data` variable.
 * @returns The result returned from the executed code, or `null` if an error occurs.
 */
export function executeJS<TInput = any, TResult = any>(
    jsCode: string,
    input: TInput
): TResult | null {
    // Sandbox environment for the code to run inside
    const sandbox: Record<string, any> = {
        data: input,
        result: undefined,
    };

    // Wrap the input code so it can use `return` and access `data`
    const wrappedCode = `
    result = (function(data) {
      ${jsCode}
    })(data);
  `;

    // Create VM context and script
    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrappedCode);

    try {
        script.runInContext(context);
        return sandbox.result as TResult;
    } catch (error) {
        console.error('Error while executing JavaScript code:', error);
        return null;
    }
}
