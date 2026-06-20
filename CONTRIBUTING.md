# Contributing to Contribly

Thank you for your interest in contributing to Contribly! We welcome contributions from developers of all skill levels to help build the best directory for open-source hackathons.

Below are guidelines and steps to help you get started with contributing to this repository.

---

## How to Get Started

### 1. Find or Raise an Issue
- Look at our [Issues page](https://github.com/anmolsah/Contribly/issues) to find tasks labeled `good first issue` or `help wanted`.
- If you find a bug or have a feature suggestion, please open a new issue describing it in detail first before submitting code.

### 2. Set Up Your Local Environment

1. **Fork the Repository**: Create a fork of the repository to your own GitHub account.
2. **Clone the Fork**: Clone your fork to your local machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Contribly.git
   cd Contribly
   ```
3. **Install Dependencies**: Install the project packages:
   ```bash
   npm install
   ```
4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Note: If you do not have Supabase keys yet, Contribly will automatically run in **Sandbox Mode** using localStorage and mock fallbacks.*

---

## Development Workflow

### 1. Create a Branch
Create a new feature or bugfix branch off the `main` branch:
```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b bugfix/your-bugfix-name
```

### 2. Run the Dev Server
Launch Vite's development server with hot module reloading (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Test Scraper Script (Optional)
If you're editing feed sources or data schemas, you can test the CLI scraper by running:
```bash
npm run scrape
```

### 4. Run TypeScript Check
Before committing your work, verify that your changes are fully type-safe:
```bash
npm run typecheck
```

---

## Submitting Your Changes

1. **Commit Guidelines**: Write clear, descriptive commit messages.
2. **Push to GitHub**: Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Open a Pull Request**:
   - Go to the main Contribly repository on GitHub.
   - Click **New Pull Request** and select your branch.
   - Provide a clear title and description detailing the changes you made.
   - Link the PR to the relevant issue (e.g., `Closes #12`).

Thank you for making the open-source community a better place!
