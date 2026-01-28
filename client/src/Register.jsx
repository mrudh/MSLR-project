import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import QrScanner from "qr-scanner";
import Header from "./components/Header";

QrScanner.WORKER_PATH = new URL(
  "qr-scanner/qr-scanner-worker.min.js",
  import.meta.url
).toString();

const Register = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [dob, setDob] = useState();
  const [sccCode, setSccCode] = useState("");
  const [errors, setErrors] = useState({});

  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");

  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const startScanner = async () => {
      setScanError("");
      if (!videoRef.current) return;

      try {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            const decoded = (result?.data || "").trim();
            if (decoded) {
              setSccCode(decoded.toUpperCase());
              setShowScanner(false);
            }
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await scannerRef.current.start();
      } catch (e) {
        console.error(e);
        setScanError(
          "Could not access camera. Please allow camera permission or use manual entry."
        );
      }
    };

    if (showScanner) startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    axios
      .post("http://localhost:3001/register", {
        name,
        email,
        password,
        dob,
        sccCode,
      })
      .then((res) => {
        if (res.data.message === "REGISTER_SUCCESS") {
          navigate("/login");
        }
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.errors) {
          setErrors(err.response.data.errors);
        } else {
          setErrors({
            form: "Something went wrong. Please try again.",
          });
        }
      });
  };

  return (
    <div>
      <Header
        title="MSLR"
        showLogout={false}
      />
      <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
        <div className="bg-white p-3 col-md-4 col-12">
          <h2>Sign up!</h2>

          {errors.form && (
            <div className="alert alert-danger" role="alert">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name">
                <strong>Name</strong>
              </label>
              <input
                type="text"
                placeholder="Enter name"
                autoComplete="off"
                name="name"
                className={`form-control rounded-0 ${
                  errors.name ? "is-invalid" : ""
                }`}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                className={`form-control rounded-0 ${
                  errors.email ? "is-invalid" : ""
                }`}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                autoComplete="off"
                name="password"
                className={`form-control rounded-0 ${
                  errors.password ? "is-invalid" : ""
                }`}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="dob">
                <strong>Date of Birth</strong>
              </label>
              <input
                type="date"
                placeholder="Enter your DOB"
                autoComplete="off"
                name="dob"
                className={`form-control rounded-0 ${
                  errors.dob ? "is-invalid" : ""
                }`}
                onChange={(e) => setDob(e.target.value)}
              />
              {errors.dob && (
                <div className="invalid-feedback">{errors.dob}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="sccCode">
                <strong>Shangri-La Citizen Code</strong>
              </label>

              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Shangri-La Citizen Code"
                  autoComplete="off"
                  name="sccCode"
                  maxLength={11}
                  value={sccCode}
                  className={`form-control rounded-0 ${
                    errors.sccCode ? "is-invalid" : ""
                  }`}
                  onChange={(e) => setSccCode(e.target.value.toUpperCase())}
                />

                <button
                  type="button"
                  className="btn btn-outline-primary rounded-0"
                  onClick={() => setShowScanner(true)}
                >
                  Scan QR
                </button>
              </div>

              {errors.sccCode && (
                <div className="invalid-feedback d-block">{errors.sccCode}</div>
              )}
            </div>

            <button type="submit" className="btn btn-success w-100 rounded-0">
              Register
            </button>

            <p className="mt-3">Already have an account</p>
          </form>

          <Link to="/login" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
            Login
          </Link>
        </div>
      </div>

      {showScanner && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 16,
              width: "min(420px, 100%)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Scan SCC QR Code</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowScanner(false)}
              >
                Close
              </button>
            </div>

            {scanError && (
              <div className="alert alert-danger" role="alert">
                {scanError}
              </div>
            )}

            <video
              ref={videoRef}
              style={{ width: "100%", borderRadius: 8 }}
              muted
              playsInline
            />

            <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>
              Point your camera at the QR code — SCC will auto-fill.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
