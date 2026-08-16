import React, { useState } from "react";

export function AuthPage() {
  // Toggle between "login" and "mfa" to preview both views
  const [step, setStep] = useState<"login" | "mfa">("login");
  const [email , setEmail ] = useState('');
  const [password , setPassword] = useState('');
  

  const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePrimaryLogin = async (e : React.FormEvent) =>{
    e.preventDefault()
    setError(null)
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });


      const data = await res.json();
      if (!res.ok){
        throw new Error("Login failed");
      }

      // if the data payload has the mfa flag , set the pre_auth_token and move to the mfa step
      if(data.requires_mfa){
        setPreAuthToken(data.pre_auth_token);
        setStep("mfa");
      }
    } catch(error : any){
      setError(error.message || "An error occurred during login.");

    }
  };


  // function to handle otp verification
  const handleVerifyOTP = async (e : React.FormEvent) =>{
    e.preventDefault()
    setError(null)
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          pre_auth_token: preAuthToken, 
          otp_token: otpCode 
        }),
      });

      // parse the response and check for errors
      const data = await res.json();

      if (!res.ok){
        throw new Error(data.message || "OTP verification failed");
      }

      // store the admin token in local storage and redirect to the dashboard
      localStorage.setItem("admin_token", data.access_token);
      window.location.href = "/admin/dashboard"; // Redirect to admin dashboard
    } catch(error : any){
      setError(error.message || "An error occurred during OTP verification.");
    }
  }


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>
            {step === "login"
              ? "Sign in with your administrative credentials"
              : "Enter the 6-digit verification code sent to your email"}
          </p>
        </div>

        {step === "login" ? (
          /* Step 1: Standard Admin Login */
          <form onSubmit={handlePrimaryLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Admin Email</label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                style={styles.input}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                required
                style={styles.input}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" style={styles.primaryButton}>
              Continue to Verification
            </button>
          </form>
        ) : (
          /* Step 2: MFA Code Challenge */
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.mfaBanner}>
              <span>📬 Check Mailpit (<code>localhost:8025</code>) for your code.</span>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="otp" style={styles.label}>One-Time Password (OTP)</label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                required
                autoComplete="one-time-code"
                style={styles.otpInput}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>

            <button type="submit" style={styles.primaryButton}>
              Verify & Enter Dashboard
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              style={styles.secondaryButton}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    border: "1px solid #334155",
    padding: "36px 32px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
  },
  header: {
    marginBottom: "28px",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #475569",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
  },
  otpInput: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #475569",
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "8px",
    textAlign: "center",
    outline: "none",
  },
  mfaBanner: {
    padding: "10px 14px",
    borderRadius: "6px",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    color: "#38bdf8",
    fontSize: "12px",
    lineHeight: "1.4",
  },
  primaryButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  secondaryButton: {
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "center",
  },
};