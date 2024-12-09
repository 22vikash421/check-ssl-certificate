import React, { useState } from "react";
import "./SSLChecker.css";

const SSLChecker = () => {
  const [hostname, setHostname] = useState("");
  const [certDetails, setCertDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkSSLCertificate = async () => {
    setCertDetails(null);
    setError(null);
    setLoading(true);

    if (!hostname) {
      setError("Please enter a hostname");
      setLoading(false);
      return;
    }

    try {
      const cleanHostname = hostname.replace(/^https?:\/\//, "").split("/")[0];

      const response = await fetch(
        `https://ssl-certificates.whoisxmlapi.com/api/v1?apiKey=at_MVyN6AyOGAagsRDqImtEHSVF1DYeF&domainName=${cleanHostname}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch SSL certificate details: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Log certificates array for debugging
      console.log("Certificates Data:", data.certificates);

      if (!data.certificates || data.certificates.length === 0) {
        throw new Error("No certificate details found in the response");
      }

      const certificate = data.certificates[0]; // Extract the first certificate

      // Map fields from the certificate object
      setCertDetails({
        hostname: cleanHostname,
        issuer: certificate.issuer?.commonName || "N/A",
        subject: certificate.subject?.commonName || "N/A",
        serialNumber: certificate.serialNumber || "N/A",
        validFrom: new Date(certificate.validFrom).toLocaleString(),
        validTo: new Date(certificate.validTo).toLocaleString(),
        daysRemaining: Math.ceil(
          (new Date(certificate.validTo) - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      });
    } catch (err) {
      console.error("Error fetching SSL certificate:", err);
      setError(err.message || "Failed to retrieve SSL certificate");
    } finally {
      setLoading(false);
    }
  };

  const renderCertificateDetails = () => {
    if (!certDetails) return null;

    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Certificate Details</h2>

        <div className="space-y-2">
          <DetailRow label="Hostname" value={certDetails.hostname} />
          <DetailRow label="Issuer" value={certDetails.issuer} />
          <DetailRow label="Subject" value={certDetails.subject} />
          <DetailRow label="Serial Number" value={certDetails.serialNumber} />
          <DetailRow label="Valid From" value={certDetails.validFrom} />
          <DetailRow label="Valid To" value={certDetails.validTo} />
          <DetailRow
            label="Days Remaining"
            value={certDetails.daysRemaining}
            className={
              certDetails.daysRemaining < 30 ? "text-red-600 font-bold" : ""
            }
          />
        </div>
      </div>
    );
  };

  const DetailRow = ({ label, value, className = "" }) => (
    <div className="flex">
      <span className="font-semibold w-1/3">{label}:</span>
      <span className={`w-2/3 ${className}`}>{value}</span>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">
        SSL/TLS Certificate Checker
      </h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
          placeholder="Enter hostname (e.g., google.com)"
          className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={checkSSLCertificate}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-blue-500">
          Analyzing SSL Certificate...
        </div>
      )}

      {renderCertificateDetails()}
    </div>
  );
};

export default SSLChecker;
