# Horizone Hotels – Project Back-end Setup Guide

This document provides a comprehensive step-by-step guide to setting up the **backend** of the Horizone Hotel Booking Platform. It walks through initializing the project, connecting to MongoDB Atlas, integrating third-party services like Clerk, OpenAI, and Stripe, and securing API keys with environment variables.
<br><br>

👉 **Looking for the frontend project? Check out the corresponding GitHub repository here: [Horizone Hotel Application – Front-End](https://github.com/DelwoA/Horizone-Hotel-Application-Front-End)**
<br><br>
🌐 Horizone Hotels deployed application => https://horizonehotels-delwoathauda.netlify.app
<br><br>


## 📁 Project Initialization

1. **Clone the Backend Repository**

   ```bash
   git clone https://github.com/DelwoA/Horizone-Hotel-Application-Back-End.git
   ```

2. **Open the Project in Your Code Editor**

   * Preferably use **VS Code** or **Cursor**.
   * Open a terminal inside the editor.

3. **Install Dependencies**

   ```bash
   npm i
   ```

   This will create the `node_modules` folder with all necessary packages.
<br><br><br>


## 🌐 Setting Up MongoDB Atlas

1. **Go to [MongoDB Atlas](https://www.mongodb.com/)**

   * Sign up or log in.

2. **Create a New Project**

   * Name it something like `horizone-hotels`, or any other name you desire.
     ![Creating a MongoDB project](https://github.com/user-attachments/assets/a0e9cb5d-351e-4c78-a951-34392545f81a)
   * Click **Next**, then click **Create Project**.

3. **Create a Cluster**

   * You will now see a Create button in the section labeled Create a Cluster, as shown in the image below.
     ![Creating a cluster](https://github.com/user-attachments/assets/7dc852d6-bd93-4825-b4c7-78ff1f3449ad)
   * _If you do not see this button immediately, navigate to Clusters from the left-hand menu, where you will find the option to create a new cluster._
     <br><br>
   * Select the **Free** version (M0 tier).
     ![Creating a cluster](https://github.com/user-attachments/assets/23a4c341-6f2a-4a9f-a594-b240ccfb7fe3)
   * Use default settings for cluster name, provider, and region.
   * Click **Create Deployment**.
     ![Creating a cluster](https://github.com/user-attachments/assets/8dda109b-ea86-4271-8fdd-0c0047783813)
     

4. **Initial Connection Popup**

   * A popup will appear prompting you to connect to the cluster.
     ![Connect to cluster](https://github.com/user-attachments/assets/c7cef96b-a8e0-4630-bc90-08cb54d5d64d)
   * Copy and safely store the password shown in this step.
   * Click **Create Database User**.
     ![Connect to cluster](https://github.com/user-attachments/assets/dbb379f4-fd08-4f26-8602-580bc054d757)

5. **Choose Connection Method**

   * Click **Choose a connection method**.
     ![Connect to cluster](https://github.com/user-attachments/assets/b7d8ce9b-d0a7-4626-ab1d-5ca019fd640c)
   * Select **Drivers**.
     ![Connect to cluster](https://github.com/user-attachments/assets/070b3aa0-e084-4761-b64c-047af72a342c)
   * If your cluster is still provisioning, wait until the process is completed.

6. **Copy Connection String**

   * Select Drivers → Node.js (6.7 or later).
     ![Connect to cluster](https://github.com/user-attachments/assets/abad1d56-2a42-4108-a018-d49007ccf154)
   * **If you see a "Show Password" toggle**, turn it ON to reveal your password embedded in the connection string. Copy the full string directly and store it safely.
   

     * Example:

     ```env
     mongodb+srv://delwo2003:u9T9qAAS9A4UKifO@cluster0.ktrwbwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
     ![Connect to cluster](https://github.com/user-attachments/assets/7e4b07ad-3291-4d6e-a577-3efd59270ced)
   
   * **If you do NOT see a "Show Password" toggle**, copy the default string provided and manually replace `<db_password>` with the password you saved earlier.

     * Example:

     ```env
     mongodb+srv://delwo2003:<db_password>@cluster0.ktrwbwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```

     becomes:

     ```env
     mongodb+srv://delwo2003:u9T9qAAS9A4UKifO@cluster0.ktrwbwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
     ![Connect to cluster](https://github.com/user-attachments/assets/bb6fee87-c092-4343-a24a-5d2671e2f68e)
     
   * Regardless of the method, store the final connection string securely for use in the next step.
   * Click **Done**.
     ![Connect to cluster](https://github.com/user-attachments/assets/41ee286d-3874-4fd9-937c-190aad850200)


7. **Create `.env` File**

   * In the root directory of your project, create a file named `.env`.
     <br><br>
     ![Project file structure](https://github.com/user-attachments/assets/1c492b78-c75a-43ff-ba41-579cb490a4ec)
     <br><br>
   * Add the following line in the `.env` file, replacing it with your prepared connection string:

   ```env
   MONGODB_URL=mongodb+srv://<your--connection-string>
   ```
   <br>

8. **Network Access Configuration**

   * Go to **Network Access** (left sidebar).
     ![Network access page](https://github.com/user-attachments/assets/5d23e419-0725-4e71-9d88-80b2a12ded66)
   * Click **Add IP Address** → Select **Allow access from anywhere** → Confirm.
   ![Add IP Access List Entry](https://github.com/user-attachments/assets/c54ed204-beee-4e84-8a13-5dc48e0983b2)
   ![Add IP Access List Entry](https://github.com/user-attachments/assets/a940b7b5-5ee6-4511-9cb4-42e7c62468b3)

> 🔍 *This step allows the backend to access the MongoDB cluster even from different networks.*

<br><br>


## 🔐 Integrating Clerk (Authentication)

1. **Go to [Clerk](https://clerk.com)**

   * Sign up or log in.

2. **Create a New Application**

   * Name the application (e.g., `Horizone Hotels`).
   * Toggle ON desired sign-in methods (Email, Google, etc.).
   ![Create new Clerk application](https://github.com/user-attachments/assets/ba6cb323-ac79-499d-93ae-fb8495b1b92f)

3. **Framework Selection**

   * Select **React**.
   ![Select framework to setup Clerk application to work with the project](https://github.com/user-attachments/assets/125ee62b-2744-4b8f-90ab-1dbafa4dfaeb)
   * Scroll down and click **Continue to the React Router quickstart**.
   ![Process of setting up Clerk](https://github.com/user-attachments/assets/d6cd55be-8e1f-4226-8229-5d7687784238)

5. **Access Clerk API Keys**

   * On the next screen, locate `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
   * Copy **both keys** and store safely for use in the next step.
  
   ![Clerk keys](https://github.com/user-attachments/assets/87728943-a908-4565-a320-91ec69b552b5)

6. **Update `.env` File**

   * Paste the copied keys into `.env`:

   ```env
   CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
   CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx
   ```

   > 🔁 *Rename* `VITE_CLERK_PUBLISHABLE_KEY` to `CLERK_PUBLISHABLE_KEY`, since it is used in the backend. <br>
   
   > 💡 `VITE_CLERK_PUBLISHABLE_KEY` _is commonly used in the front-end, since Vite is not used in the back-end of this project, it is renamed to_ `CLERK_PUBLISHABLE_KEY` _in the_ `.env` _file_.

<br><br>


## 🧠 Integrating OpenAI (AI Search)

1. **Go to [OpenAI API](https://openai.com/api/)**

   * Sign up or log in.
   * In order to sign up or log in, click on **API Log in** which is displayed on the left.
     ![OpenAI API Login page](https://github.com/user-attachments/assets/436140fe-4a04-47bd-b5fa-7281659e5577)
   * After logging in, you are directed to a page like the one shown in the image below.
   * ![OpenAI developer platform page](https://github.com/user-attachments/assets/8c131ff2-e102-437b-9d9b-04a391cbc9f6)


2. **Create a New Project**

   * Name it accordingly (e.g., Horizone Hotels).
     ![Create new project from the OpenAI developer platform page](https://github.com/user-attachments/assets/45fdaf7a-bbdf-42b8-9ebb-f59831d33ac8)
     ![Create a new project popup](https://github.com/user-attachments/assets/d90d903b-2fb1-48ae-ab2e-ac3cbc56ce7c)

3. **Generate a Secret API Key**

   * Click **Create new secret key**.
   * Copy the key **immediately** (you won’t see it again).
   ![Create new API secret key](https://github.com/user-attachments/assets/950d4d0a-8962-43a5-8dc8-d7febc69b09a)
   ![Save the new API secret key just created](https://github.com/user-attachments/assets/5857e357-6c4d-4f8d-be29-03ccdcbc131c)

4. **Add OpenAI Key to `.env`**

   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
<br><br><br>


## 💳 Integrating Stripe (Payment Gateway)

1. **Go to [Stripe](https://stripe.com)** and log in.

2. **Open Dashboard** → Click **Developers > API keys** (bottom left).
   ![Stripe dashboard on developers, selecting API keys](https://github.com/user-attachments/assets/7450f323-092b-491f-b79f-a328383be848)

3. **Copy the Keys**

   * `Publishable key`
   * `Secret key`
   ![Stripe dashboard on developers, selecting API keys](https://github.com/user-attachments/assets/dc28f447-5fa6-4d49-ad55-5f9907744a43)

4. **Update `.env` File**

   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx
   ```
<br><br><br>


## ✅ Final `.env` Sample

```env
MONGODB_URL=mongodb+srv://delwo2003:password@cluster0.ktrwbwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx

OPENAI_API_KEY=sk-xxxx

STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
```

> 🛑 **Important:** Never share your `.env` file or commit it to GitHub. Always add it to `.gitignore`.

<br><br><br>

## 🚀 Run the Server

Start your development server:

```bash
npm run dev
```

Your backend server should now be connected to MongoDB, and integrated with Clerk, OpenAI, and Stripe.
<br><br><br>

Happy Building! 🏗️✨
