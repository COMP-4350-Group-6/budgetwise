
# BudgetWise Web App (React + Vite)

This is the **primary frontend** for the BudgetWise project, built with **React**, **TypeScript**, and **Vite**.  
It provides a clean structure for scalable development with pages for:

- Login  
- Home (Dashboard)  
- Transaction Management  
- Budget  
- Insights  

---

## 1. Check if Node.js and npm are installed

Run the following commands in your terminal:

```bash
node -v
npm -v
```

You should see version numbers like:

```
v22.12.0
10.9.0
```

---

## 2. Check Node.js version compatibility

Vite requires **Node.js 20.19+ or 22.12+** to work properly.

Check if you have **NVM (Node Version Manager)** installed:

```bash
nvm version
```

If you get an error, install NVM for Windows from:  
👉 [NVM for Windows Releases](https://github.com/coreybutler/nvm-windows/releases)


---

### Update Node.js via NVM (if needed)

If your Node version is too old, run:

```bash
nvm install 22.12.0
nvm use 22.12.0
node -v
```

You should now see Node.js version 22.12.0 (or newer).

---

## 3. Install dependencies

Navigate to the frontend directory:

```bash
cd budgetwise/src/web-app-react
npm install
```

This installs all required packages (React, Vite, React Router, etc.).

---

##  4. Run the web app locally

Start the development server:

```bash
npm run dev
```

Then open the link shown in your terminal (usually):

➡️ **http://localhost:5173**

---

## Project Structure

```
src/
  components/
    Navbar.tsx
    Sidebar.tsx
  pages/
    Login/Login.tsx
    Home/Home.tsx
    TransactionManagement/TransactionManagement.tsx
    Budget/Budget.tsx
    Insights/Insights.tsx
  App.tsx
  main.tsx
  styles.css
```

Each page is isolated so multiple team members can work simultaneously without conflicts.

---

## Documentation

See our **Wiki** → _Manual of Style_ for details on:
- How to add a new page

---
