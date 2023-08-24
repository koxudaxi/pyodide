import { loadPyodide } from "./dist/pyodide.mjs";

const py = await loadPyodide({ _profiling: true, indexURL: "./dist" });
py._module._write_profile();
