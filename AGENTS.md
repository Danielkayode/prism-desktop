# Agent Instructions and Codebase Analysis for Prism (formerly Aide)

This document provides a comprehensive analysis of the Aide codebase. It is intended to guide future development and provide context for any agent or developer working on this project.

**CRITICAL NOTE:** This project is a fork of an archived and unmaintained project, "Aide". The underlying VS Code base is from early 2024 and is significantly outdated. Any work on this project should first consider a strategy to modernize the codebase.

## 1. Summary of Overall Architecture

The codebase is a fork of Microsoft's Visual Studio Code (`Code - OSS`). It retains the fundamental architecture of VS Code, which is built on Electron and TypeScript.

*   **Core Shell:** An Electron application wrapper (`src/main.ts`) that handles window management, application lifecycle, and process creation.
*   **Core Modules (`src/vs/`):**
    *   `platform`: Provides foundational services like dependency injection, file access, IPC, and configuration.
    *   `editor`: The Monaco Editor, which is the core text editing component.
    *   `workbench`: The main user interface, including the sidebars, activity bar, panels, editor tabs, and command palette.
*   **Extensions:** A significant portion of the functionality is implemented as extensions.
*   **AI Integration:** The unique "Aide" functionality is implemented in a custom extension located at `extensions/codestory`. This extension introduces a central `aiModelService` and an "Aide Agent" for chat. It communicates with a separate "sidecar" process that handles the heavy lifting of AI computations.

## 2. AI Models and Providers

The system is designed to be model-agnostic through a provider-based service, with the core logic residing in `extensions/codestory/src/sidecar/types.ts`.

*   **AI Model Service (`src/vs/workbench/services/aiModel/browser/aiModelService.ts`):** A core service that allows different AI model providers to be registered and used by the workbench.

*   **Supported Providers:** The `LLMProvider` enum lists the following providers:
    *   OpenAI
    *   TogetherAI
    *   Ollama
    *   LMStudio
    *   OpenAICompatible
    *   Anthropic
    *   FireworksAI
    *   GoogleAIStudio
    *   OpenRouter

*   **Supported Models:** The `LLMType` enum lists the following specific models:
    *   Mixtral
    *   MistralInstruct
    *   Gpt4
    *   GPT3_5_16k
    *   Gpt4_32k
    *   Gpt4O
    *   Gpt4Turbo
    *   DeepSeekCoder1_3BInstruct
    *   DeepSeekCoder33BInstruct
    *   DeepSeekCoder6BInstruct
    *   CodeLLama70BInstruct
    *   CodeLlama13BInstruct
    *   CodeLlama7BInstruct
    *   Llama3_8bInstruct
    *   ClaudeOpus
    *   ClaudeSonnet
    *   ClaudeHaiku
    *   PPLXSonnetSmall
    *   CohereRerankV3
    *   GoogleAIStudio
    *   GoogleAIStudioFlash

*   **Implementation (`extensions/codestory`):** The `codestory` extension is the primary consumer of these AI services. It includes the `openai` npm package and contains the logic for formatting requests and handling responses from the various supported providers. Communication with the AI models is proxied through a local sidecar process.

## 3. Available Tool Calls

The application uses an abstracted, service-based approach for interacting with external tools.

*   **Shell/Process Execution:** The primary mechanism for running external tools is `child_process.spawn`. This is used within extensions that need to interact with the underlying system, most notably for Git.
*   **Git:** Git functionality is fully implemented in the built-in extensions `extensions/git` and `extensions/git-base`. The `git.ts` file within the `git` extension directly spawns the `git` executable to run commands.
*   **HTTP/Network:** Network requests are handled by standard Node.js modules or libraries like `node-fetch`. The `codestory` extension uses this to communicate with its sidecar process, which listens on `http://127.0.0.1:42424` by default.
*   **Language Server Protocol (LSP):** As a VS Code fork, it has native, deep support for the LSP.

## 4. Codebase Structure and Feature Mapping

*   **Main UI, Sidebar, Editor Core:**
    *   `src/vs/workbench/`: Implements the overall structure of the UI.
    *   `src/vs/editor/`: The Monaco Editor component.
*   **AI Chat:**
    *   `extensions/codestory/`: This extension contributes the "Aide Agent" to the UI.
    *   `src/vs/workbench/services/aiModel/`: The underlying service that manages AI model providers.
*   **Sidecar Communication:**
    *   `extensions/codestory/package.json`: Defines the configuration setting `aide.sidecarURL`.
*   **Inline Completions:**
    *   `extensions/codestory/`: The inline completion feature was heavily borrowed from Sourcegraph's Cody.
*   **Build System:**
    *   `gulpfile.js` and the `/build` directory: Contain the Gulp-based build scripts.

## 5. Web Findings and Project Status

*   **Project Identity:** Aide was an "open-source AI-native code editor."
*   **Project Status:** **ARCHIVED AND UNMAINTAINED.** The official GitHub repository is archived. The project is no longer maintained as of February 2025. This means the codebase is static and will not receive updates, bug fixes, or security patches from the original authors.

## 6. Comparison with Modern VS Code & Vulnerabilities

*   **What's Different:** Deep, native integration of the Aide agent and its specific AI workflows.
*   **Outdatedness and Vulnerabilities:**
    *   **Features & Bug Fixes:** The `package.json` specifies version `1.97.0` and a `distro` hash of `c504aa6...`. This commit in the VS Code repository is from **early 2024**. The Aide codebase is missing over a year of development from the official VS Code team.
    *   **Security Risks:** The Electron version and other dependencies are outdated, which can pose a security risk. This is the primary vulnerability of the codebase.
    *   **Extension Compatibility:** Modern extensions from the VS Code Marketplace may not be compatible with this older version of the editor.

## 7. Conclusion and Recommendation

The codebase is **significantly outdated** and **unmaintained**.

Evolving this codebase would require not only rebranding but also a significant effort to update the VS Code base to a modern version, which would likely involve resolving numerous breaking changes in the VS Code API. This should be the first priority before adding any new features.
